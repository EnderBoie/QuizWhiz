
import React, { useState, useEffect, useRef } from 'react';
import { Quiz, Question } from '../types';
import { COLORS, THEMES } from '../constants';
import { Logo } from './Logo';
import { Flame, Info, ArrowUp, ArrowDown, Volume2, VolumeX } from 'lucide-react';

interface QuizTakerProps {
  quiz: Quiz;
  onComplete: (answers: (number | string | number[])[], score: number) => void;
  onExit: () => void;
}

interface ShuffledQuestion extends Question {
    originalIndex: number;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ quiz, onComplete, onExit }) => {
  const [shuffledQuestions, setShuffledQuestions] = useState<ShuffledQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const userAnswersRef = useRef<(number | string | number[])[]>([]);
  
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [timerActive, setTimerActive] = useState(false);
  
  // Input States
  const [textInput, setTextInput] = useState('');
  const [orderingState, setOrderingState] = useState<{item: string, originalIndex: number}[]>([]);
  
  // Feedback State
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrectFeedback, setIsCorrectFeedback] = useState<boolean | null>(null);

  // Streak State
  const [streak, setStreak] = useState(0);
  
  // Countdown State
  const [startCountdown, setStartCountdown] = useState(3);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Background Music State
  const [isMuted, setIsMuted] = useState(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);

  const currentTheme = THEMES[quiz.theme || 'classic'] || THEMES.classic;

  useEffect(() => {
    let q: ShuffledQuestion[] = quiz.questions.map((qs, idx) => ({ ...qs, originalIndex: idx }));
    
    if (quiz.shuffleQuestions) {
        for (let i = q.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [q[i], q[j]] = [q[j], q[i]];
        }
    }
    setShuffledQuestions(q);
    userAnswersRef.current = [];
    setTimeLeft(q[0]?.timeLimit || 20);
    
    if (q[0]?.type === 'ordering') {
        const items = q[0].options.map((opt, idx) => ({ item: opt, originalIndex: idx }));
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        setOrderingState(items);
    }
  }, [quiz]);

  useEffect(() => {
    if (quiz.backgroundMusic) {
        const audio = new Audio(quiz.backgroundMusic);
        audio.loop = true;
        audio.volume = 0.4;
        bgMusicRef.current = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Auto-play prevented");
                setIsMuted(true);
            });
        }
    }

    return () => {
        if (bgMusicRef.current) {
            bgMusicRef.current.pause();
            bgMusicRef.current = null;
        }
    };
  }, [quiz.backgroundMusic]);

  const toggleMute = () => {
    if (bgMusicRef.current) {
        if (isMuted) {
            bgMusicRef.current.play();
            setIsMuted(false);
        } else {
            bgMusicRef.current.pause();
            setIsMuted(true);
        }
    }
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];
  const timePercentage = currentQuestion ? (timeLeft / currentQuestion.timeLimit) * 100 : 0;

  const getAudioContext = () => {
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playTickSound = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(800, t);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.05);
    } catch (e) {}
  };

  useEffect(() => {
    if (startCountdown > 0) {
        const timer = setInterval(() => {
            setStartCountdown(prev => {
               if (prev <= 1) {
                   clearInterval(timer);
                   setTimerActive(true);
                   return 0;
               } 
               return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }
  }, [startCountdown]);

  useEffect(() => {
    if (!timerActive || timeLeft === null || showExplanation) return;

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
      });
      playTickSound();
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerActive, showExplanation]);

  const handleTimeUp = () => {
    submitAnswer(-1);
  };

  const calculateScore = (finalAnswers: (number | string | number[])[]) => {
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      const ans = finalAnswers[i];
      if (ans === -1) return;

      if (q.type === 'text-input') {
        if (typeof ans === 'string' && typeof q.correctAnswer === 'string' &&
            ans.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
          correct++;
        }
      } else if (q.type === 'ordering') {
          if (Array.isArray(ans) && ans.every((val, idx) => val === idx)) {
              correct++;
          }
      } else {
        if (ans === q.correctAnswer) correct++;
      }
    });
    return correct;
  };

  const checkAnswerIsCorrect = (question: any, answer: number | string | number[]) => {
    if (question.type === 'text-input') {
      return (
        typeof answer === 'string' && 
        typeof question.correctAnswer === 'string' &&
        answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
      );
    } else if (question.type === 'ordering') {
        return Array.isArray(answer) && answer.every((val, idx) => val === idx);
    } else {
        return answer === question.correctAnswer;
    }
  };

  const submitAnswer = (answer: number | string | number[]) => {
    setTimerActive(false);
    
    let isCorrect = false;
    if (answer !== -1) {
        isCorrect = checkAnswerIsCorrect(currentQuestion, answer);
        if (isCorrect) {
            setStreak(prev => prev + 1);
        } else {
            setStreak(0);
            if (typeof navigator.vibrate === 'function') navigator.vibrate(200);
        }
    } else {
        setStreak(0);
        if (typeof navigator.vibrate === 'function') navigator.vibrate(200);
    }
    
    setIsCorrectFeedback(isCorrect);

    const newAnswers = [...userAnswersRef.current];
    newAnswers[currentQuestionIndex] = answer;
    userAnswersRef.current = newAnswers;

    if (currentQuestion.explanation || !isCorrect) {
        setShowExplanation(true);
    } else {
        setTimeout(nextQuestion, 600);
    }
  };

  const nextQuestion = () => {
      setShowExplanation(false);
      setIsCorrectFeedback(null);
      
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setTimeLeft(shuffledQuestions[nextIndex].timeLimit);
        setTextInput('');
        
        if (shuffledQuestions[nextIndex].type === 'ordering') {
             const items = shuffledQuestions[nextIndex].options.map((opt, idx) => ({ item: opt, originalIndex: idx }));
            for (let i = items.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [items[i], items[j]] = [items[j], items[i]];
            }
            setOrderingState(items);
        }

        setTimerActive(true);
      } else {
        const finalAnswers = new Array(quiz.questions.length).fill(-1);
        userAnswersRef.current.forEach((ans, idx) => {
            const originalIdx = shuffledQuestions[idx].originalIndex;
            finalAnswers[originalIdx] = ans;
        });
        const finalScore = calculateScore(finalAnswers);
        onComplete(finalAnswers, finalScore);
      }
  };

  const handleSelectAnswer = (index: number) => {
    if (!timerActive) return;
    submitAnswer(index);
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && timerActive) {
      submitAnswer(textInput);
    }
  };

  const handleOrderingSubmit = () => {
      if (timerActive) {
          const currentOrder = orderingState.map(s => s.originalIndex);
          submitAnswer(currentOrder);
      }
  };

  const moveOrderingItem = (index: number, direction: 'up' | 'down') => {
    if (!timerActive) return;
    const newState = [...orderingState];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (swapIndex >= 0 && swapIndex < newState.length) {
        const temp = newState[index];
        newState[index] = newState[swapIndex];
        newState[swapIndex] = temp;
        setOrderingState(newState);
    }
  };

  const getCorrectAnswerText = () => {
    if (!currentQuestion) return '';
    if (currentQuestion.type === 'text-input') return String(currentQuestion.correctAnswer);
    if (currentQuestion.type === 'multiple-choice' || currentQuestion.type === 'true-false') {
        const idx = Number(currentQuestion.correctAnswer);
        if (!isNaN(idx) && currentQuestion.options[idx]) return currentQuestion.options[idx];
    }
    if (currentQuestion.type === 'ordering') return currentQuestion.options.join(' → ');
    return '';
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Custom Theme Helpers
  const customStyle = quiz.customTheme ? {
      background: quiz.customTheme.backgroundImage ? `url(${quiz.customTheme.backgroundImage}) center/cover no-repeat fixed` : quiz.customTheme.background,
      color: quiz.customTheme.text
  } : {};
  
  const customClass = quiz.customTheme ? '' : `bg-gradient-to-br ${currentTheme.gradient} ${currentTheme.text}`;

  const cardStyle = quiz.customTheme ? {
      backgroundColor: hexToRgba(quiz.customTheme.cardColor, quiz.customTheme.cardOpacity),
      color: quiz.customTheme.text,
      border: `1px solid ${hexToRgba(quiz.customTheme.text, 0.1)}`
  } : {};

  if (!currentQuestion) return null;

  return (
    <div 
        className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${customClass}`}
        style={customStyle}
    >
      
      {startCountdown > 0 && (
          <div className={`absolute inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300`}>
             <div className="text-9xl font-black text-white animate-bounce drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {startCountdown}
             </div>
             <p className="text-2xl font-bold text-gray-400 mt-8 tracking-widest uppercase">Get Ready</p>
          </div>
      )}

      {showExplanation && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
              <div 
                className="rounded-[2rem] p-8 sm:p-10 max-w-lg w-full shadow-2xl border-4 border-white/20"
                style={{ backgroundColor: quiz.customTheme ? quiz.customTheme.cardColor : 'white', color: quiz.customTheme ? quiz.customTheme.text : '#0f172a' }}
              >
                  <div className={`text-center mb-8`}>
                      {isCorrectFeedback ? (
                          <div className="text-green-500 font-black text-5xl mb-2 drop-shadow-sm">Correct! 🎉</div>
                      ) : (
                          <>
                            <div className="text-red-500 font-black text-5xl mb-4 drop-shadow-sm">Incorrect</div>
                            <div className="bg-red-50 text-red-900 p-5 rounded-2xl mt-4 border border-red-100 text-left shadow-inner">
                                <span className="block text-xs font-bold uppercase tracking-widest opacity-60 mb-2 text-red-700">Correct Answer</span>
                                <span className="text-xl font-black block leading-tight">{getCorrectAnswerText()}</span>
                            </div>
                          </>
                      )}
                  </div>
                  
                  {currentQuestion.explanation && (
                    <div className="bg-slate-100 p-5 rounded-2xl mb-8 border border-slate-200">
                        <h4 className="font-bold text-slate-500 uppercase text-xs tracking-wide mb-2 flex items-center gap-2">
                            <Info size={16} /> Explanation
                        </h4>
                        <p className="text-lg font-medium leading-relaxed text-slate-700">{currentQuestion.explanation}</p>
                    </div>
                  )}

                  <button 
                    onClick={nextQuestion}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl text-xl shadow-lg transition-all active:scale-95"
                    style={quiz.customTheme ? { backgroundColor: quiz.customTheme.accent } : {}}
                  >
                    Next Question
                  </button>
              </div>
          </div>
      )}

      <div className={`flex flex-col h-full transition-opacity duration-500 ${startCountdown > 0 ? 'opacity-0' : 'opacity-100'}`}>
        <div className="bg-white/10 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-lg border-b border-white/10">
            <div className="flex items-center gap-3">
                <Logo variant="small" />
                <div className="text-xl font-black tracking-tight">QuizWhiz</div>
            </div>
            
            {streak > 1 && (
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-orange-400 font-black animate-in zoom-in slide-in-from-bottom-4 duration-300 bg-black/20 px-4 py-1 rounded-full backdrop-blur-sm">
                    <Flame className="fill-orange-500 animate-pulse" size={20} />
                    <span className="text-xl">{streak}</span>
                </div>
            )}
            
            <div className="flex items-center gap-3">
                {quiz.backgroundMusic && (
                    <button
                        onClick={toggleMute}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-colors backdrop-blur-sm"
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                )}
                <button
                onClick={onExit}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl font-bold transition-colors text-sm backdrop-blur-sm"
                >
                End Quiz
                </button>
            </div>
        </div>

        <div className="w-full h-3 bg-black/30 backdrop-blur-sm">
            <div
            className={`h-full ${timeLeft <= 5 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : timeLeft <= 10 ? 'bg-yellow-400' : 'bg-green-400'} transition-all duration-1000 ease-linear rounded-r-full`}
            style={{ width: `${timePercentage}%` }}
            />
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 py-6 sm:p-8 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto w-full">
            <div className="text-center mb-8 sm:mb-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="flex items-center justify-center gap-4 mb-4">
                <div className="bg-black/20 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase">
                    Question {currentQuestionIndex + 1} / {shuffledQuestions.length}
                </div>
                <div className={`text-3xl font-black tabular-nums ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : ''}`}>
                    {timeLeft}s
                </div>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-8 px-4 leading-tight drop-shadow-lg">{currentQuestion.question}</h2>
                {currentQuestion.image && (
                <div className="max-w-2xl mx-auto mb-8">
                    <img
                    src={currentQuestion.image}
                    alt="Question"
                    className="w-full rounded-[2rem] shadow-2xl max-h-80 object-contain border-4 border-white/20 bg-black/20"
                    />
                </div>
                )}
            </div>

            {currentQuestion.type === 'multiple-choice' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 max-w-5xl mx-auto">
                {currentQuestion.options.map((option, index) => (
                    <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={!timerActive}
                    className={`${!quiz.customTheme ? `${COLORS[index].bg} ${COLORS[index].hover}` : ''} group relative overflow-hidden rounded-3xl p-6 sm:p-8 min-h-[140px] flex flex-col items-center justify-center shadow-lg transition-all hover:scale-[1.02] active:scale-95 border-b-8 border-black/20 ${!timerActive ? 'opacity-60 cursor-not-allowed transform-none grayscale' : ''}`}
                    style={quiz.customTheme ? { 
                        backgroundColor: hexToRgba(quiz.customTheme.cardColor, quiz.customTheme.cardOpacity),
                        color: quiz.customTheme.text,
                        border: `2px solid ${hexToRgba(quiz.customTheme.accent, 0.5)}`
                    } : {}}
                    >
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className={`text-5xl mb-3 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300 ${!quiz.customTheme ? 'text-white/90' : ''}`} style={quiz.customTheme ? {color: quiz.customTheme.accent} : {}}>{COLORS[index].icon}</div>
                    <div className={`text-xl sm:text-2xl font-bold text-center leading-snug drop-shadow-sm ${!quiz.customTheme ? 'text-white' : ''}`}>{option}</div>
                    </button>
                ))}
                </div>
            )}

            {currentQuestion.type === 'true-false' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {['True', 'False'].map((option, index) => (
                    <button
                    key={index}
                    onClick={() => handleSelectAnswer(index)}
                    disabled={!timerActive}
                    className={`${!quiz.customTheme ? `${COLORS[index].bg} ${COLORS[index].hover}` : ''} group rounded-[2.5rem] p-10 sm:p-14 min-h-[200px] flex flex-col items-center justify-center shadow-xl transition-all hover:scale-[1.02] active:scale-95 border-b-8 border-black/20 ${!timerActive ? 'opacity-60 cursor-not-allowed transform-none grayscale' : ''}`}
                    style={quiz.customTheme ? { 
                        backgroundColor: hexToRgba(quiz.customTheme.cardColor, quiz.customTheme.cardOpacity),
                        color: quiz.customTheme.text,
                        border: `2px solid ${hexToRgba(quiz.customTheme.accent, 0.5)}`
                    } : {}}
                    >
                    <div className={`text-7xl mb-4 drop-shadow-md transform group-hover:rotate-12 transition-transform duration-300 ${!quiz.customTheme ? 'text-white/90' : ''}`} style={quiz.customTheme ? {color: quiz.customTheme.accent} : {}}>{COLORS[index].icon}</div>
                    <div className={`text-4xl font-black drop-shadow-sm tracking-tight ${!quiz.customTheme ? 'text-white' : ''}`}>{option}</div>
                    </button>
                ))}
                </div>
            )}

            {currentQuestion.type === 'text-input' && (
                <div className="max-w-2xl mx-auto">
                <div 
                    className={`backdrop-blur-md border rounded-3xl p-8 shadow-2xl ${!quiz.customTheme ? 'bg-white/10 border-white/20' : ''}`}
                    style={cardStyle}
                >
                    <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={!timerActive}
                    className="w-full px-8 py-6 border-none bg-white rounded-2xl text-slate-900 placeholder-slate-400 text-2xl font-bold focus:ring-4 focus:ring-white/50 focus:outline-none disabled:opacity-50 shadow-inner text-center"
                    placeholder="Type your answer..."
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') handleTextSubmit();
                    }}
                    />
                    <button
                    onClick={handleTextSubmit}
                    disabled={!timerActive || !textInput.trim()}
                    className={`w-full mt-6 text-white font-bold py-5 rounded-2xl text-xl transition-all shadow-lg active:scale-95 disabled:cursor-not-allowed ${!quiz.customTheme ? 'bg-green-500 hover:bg-green-400 disabled:bg-slate-600' : ''}`}
                    style={quiz.customTheme ? { backgroundColor: quiz.customTheme.accent, opacity: !timerActive || !textInput.trim() ? 0.5 : 1 } : {}}
                    >
                    Submit Answer
                    </button>
                </div>
                </div>
            )}

            {currentQuestion.type === 'ordering' && (
                <div className="max-w-3xl mx-auto">
                    <div 
                        className={`backdrop-blur-md border rounded-[2rem] p-8 shadow-2xl ${!quiz.customTheme ? 'bg-white/10 border-white/20' : ''}`}
                        style={cardStyle}
                    >
                        <p className={`text-center font-bold mb-6 opacity-90 text-lg ${!quiz.customTheme ? 'text-white' : ''}`}>Arrange in the correct order (Top to Bottom)</p>
                        <div className="space-y-4 mb-8">
                            {orderingState.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-5 flex items-center gap-5 shadow-lg text-slate-800 transition-transform hover:scale-[1.01]">
                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={() => moveOrderingItem(idx, 'up')} 
                                            disabled={idx === 0 || !timerActive}
                                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                                        >
                                            <ArrowUp size={24} />
                                        </button>
                                        <button 
                                            onClick={() => moveOrderingItem(idx, 'down')} 
                                            disabled={idx === orderingState.length - 1 || !timerActive}
                                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 disabled:opacity-20 transition-colors"
                                        >
                                            <ArrowDown size={24} />
                                        </button>
                                    </div>
                                    <span className="font-black text-3xl text-slate-200 w-12 text-center select-none">{idx + 1}</span>
                                    <span className="font-bold text-xl flex-1">{item.item}</span>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleOrderingSubmit}
                            disabled={!timerActive}
                            className={`w-full text-white font-bold py-5 rounded-2xl text-xl transition-all shadow-lg active:scale-95 disabled:cursor-not-allowed ${!quiz.customTheme ? 'bg-green-500 hover:bg-green-400 disabled:bg-slate-600' : ''}`}
                            style={quiz.customTheme ? { backgroundColor: quiz.customTheme.accent, opacity: !timerActive ? 0.5 : 1 } : {}}
                        >
                            Submit Order
                        </button>
                    </div>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};
