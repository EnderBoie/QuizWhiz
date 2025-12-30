
import React, { useState, useEffect } from 'react';
import { Menu, Home, X, Trash2, Image as ImageIcon, Sparkles, Palette, Shuffle, GripVertical, ArrowUp, ArrowDown, PenTool, ArrowRight, Wand2, ArrowLeft, Camera, Music, PlusCircle, Eye } from 'lucide-react';
import { Quiz, Question, QuestionType, User, CustomTheme } from '../types';
import { COLORS, TUTORIAL_STEPS, THEMES } from '../constants';
import { TutorialWidget } from './TutorialWidget';
import { ValidationModal } from './ValidationModal';
import { ImageSelectionModal } from './ImageSelectionModal';
import { GitHubAIModal } from './GitHubAIModal';
import { ImageQuizModal } from './ImageQuizModal';
import { MusicSelectionModal } from './MusicSelectionModal';
import { ThemeEditorModal } from './ThemeEditorModal';
import { QuizTaker } from './QuizTaker';

interface QuizCreatorProps {
  initialQuiz: Quiz | null;
  currentUser: User;
  onSave: (quiz: Quiz) => void;
  onExit: () => void;
  startWithTutorial: boolean;
  onTutorialComplete?: () => void;
  onStatUpdate: (type: 'create' | 'ai_img' | 'ai_quiz') => void;
}

const DEFAULT_QUESTION: Question = {
  question: '',
  image: '',
  type: 'multiple-choice',
  options: ['', '', '', ''],
  correctAnswer: 0,
  timeLimit: 20,
  explanation: ''
};

export const QuizCreator: React.FC<QuizCreatorProps> = ({ initialQuiz, currentUser, onSave, onExit, startWithTutorial, onTutorialComplete, onStatUpdate }) => {
  const [creationMode, setCreationMode] = useState<'selection' | 'editor'>(
    initialQuiz || startWithTutorial ? 'editor' : 'selection'
  );

  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState<Question[]>([JSON.parse(JSON.stringify(DEFAULT_QUESTION))]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Theme State
  const [quizTheme, setQuizTheme] = useState('classic');
  const [customTheme, setCustomTheme] = useState<CustomTheme | undefined>(undefined);
  
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [bgMusic, setBgMusic] = useState('');
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  const [showImageModal, setShowImageModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showImageQuizModal, setShowImageQuizModal] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  // Preview State
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    if (initialQuiz) {
      setQuizTitle(initialQuiz.title);
      setQuestions(JSON.parse(JSON.stringify(initialQuiz.questions)));
      setQuizTheme(initialQuiz.theme || 'classic');
      setCustomTheme(initialQuiz.customTheme);
      setShuffleQuestions(initialQuiz.shuffleQuestions || false);
      setBgMusic(initialQuiz.backgroundMusic || '');
    }
  }, [initialQuiz]);

  useEffect(() => {
    if (startWithTutorial) {
      setShowTutorial(true);
      setTutorialStep(0);
    }
  }, [startWithTutorial]);

  const addQuestion = () => {
    setQuestions([...questions, JSON.parse(JSON.stringify(DEFAULT_QUESTION))]);
    setCurrentQuestionIndex(questions.length);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Update options based on question type
    if (field === 'type') {
      const type = value as QuestionType;
      if (type === 'true-false') {
        updated[index].options = ['True', 'False'];
        updated[index].correctAnswer = 0;
      } else if (type === 'text-input') {
        updated[index].options = [''];
        updated[index].correctAnswer = '';
      } else if (type === 'ordering') {
        updated[index].options = ['', '', '', ''];
        updated[index].correctAnswer = null; 
      } else {
        updated[index].options = ['', '', '', ''];
        updated[index].correctAnswer = 0;
      }
    }
    
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options = [...updated[qIndex].options];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const moveOrderingOption = (qIndex: number, optIndex: number, direction: 'up' | 'down') => {
      const updated = [...questions];
      const options = [...updated[qIndex].options];
      const swapIndex = direction === 'up' ? optIndex - 1 : optIndex + 1;
      
      if (swapIndex >= 0 && swapIndex < options.length) {
          const temp = options[optIndex];
          options[optIndex] = options[swapIndex];
          options[swapIndex] = temp;
          updated[qIndex].options = options;
          setQuestions(updated);
      }
  };

  const removeQuestion = (index: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
    if (currentQuestionIndex >= questions.length - 1) {
      setCurrentQuestionIndex(Math.max(0, questions.length - 2));
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    updateQuestion(currentQuestionIndex, 'image', imageUrl);
  };

  const handleAIGenerated = (newQuestions: Question[], title: string) => {
    if (creationMode === 'selection') {
      // Create fresh quiz
      setQuestions(newQuestions);
      setQuizTitle(title);
      setCurrentQuestionIndex(0);
      setCreationMode('editor');
    } else {
      // Editor mode: Append questions
      if (questions.length === 1 && !questions[0].question.trim()) {
        setQuestions(newQuestions);
        if(!quizTitle.trim()) setQuizTitle(title);
        setCurrentQuestionIndex(0);
      } else {
        setQuestions(prev => [...prev, ...newQuestions]);
        // Jump to first new question
        setCurrentQuestionIndex(questions.length);
      }
    }
  };

  const playSaveSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const ctx = new AudioContext();
      const t = ctx.currentTime;
      
      const bufferSize = ctx.sampleRate * 1.5; 
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(100, t);
      noiseFilter.frequency.exponentialRampToValueAtTime(4000, t + 0.4); 
      noiseFilter.frequency.exponentialRampToValueAtTime(100, t + 1.0);  

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, t);
      noiseGain.gain.linearRampToValueAtTime(0.3, t + 0.4);
      noiseGain.gain.linearRampToValueAtTime(0, t + 1.0);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 1.5);

      const notes = [523.25, 659.25, 783.99, 1046.50]; 
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + 0.3 + (i * 0.05));

        gain.gain.setValueAtTime(0, t + 0.3 + (i * 0.05));
        gain.gain.linearRampToValueAtTime(0.1, t + 0.4 + (i * 0.05));
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + 0.3 + (i * 0.05));
        osc.stop(t + 1.5);
      });

    } catch (e) {
      console.error("Audio synthesis failed:", e);
    }
  };

  const handleSave = () => {
    // Validation
    const errors: string[] = [];
    
    if (!quizTitle.trim()) {
      errors.push('• Add a quiz title');
    }
    
    if (questions.length === 0) {
      errors.push('• Add at least one question');
    }
    
    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        errors.push(`• Question ${index + 1}: Add question text`);
      }
      
      if (q.type === 'multiple-choice' || q.type === 'ordering') {
        const emptyOptions = q.options.filter(opt => !opt.trim());
        if (emptyOptions.length > 0) {
          errors.push(`• Question ${index + 1}: Fill in all 4 answer options`);
        }
      }
      
      if (q.type === 'text-input' && (typeof q.correctAnswer === 'string' && !q.correctAnswer.trim())) {
        errors.push(`• Question ${index + 1}: Provide the correct text answer`);
      }
      
      if (q.type === 'multiple-choice' && q.correctAnswer === null) {
        errors.push(`• Question ${index + 1}: Mark one answer as correct`);
      }
      
      if (q.type === 'true-false' && q.correctAnswer === null) {
        errors.push(`• Question ${index + 1}: Mark True or False as correct`);
      }
    });
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationModal(true);
      return;
    }

    const validQuestions = questions.filter(q => {
      if (!q.question.trim()) return false;
      if (q.type === 'multiple-choice' || q.type === 'ordering') {
        return q.options.every(opt => opt.trim());
      }
      if (q.type === 'true-false') return true;
      if (q.type === 'text-input') return typeof q.correctAnswer === 'string' && q.correctAnswer.trim();
      return true;
    });

    const newQuiz: Quiz = {
      id: initialQuiz?.id || Date.now(),
      userId: currentUser.id, 
      title: quizTitle,
      questions: validQuestions,
      createdAt: initialQuiz?.createdAt || new Date().toISOString(),
      theme: quizTheme,
      customTheme: customTheme,
      shuffleQuestions: shuffleQuestions,
      backgroundMusic: bgMusic
    };

    playSaveSound();
    
    if (!initialQuiz) {
       onStatUpdate('create');
    }

    onSave(newQuiz);
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    if (onTutorialComplete) {
      onTutorialComplete();
    }
  };

  const startPreview = () => {
    // Basic validation for preview
    if (!quizTitle.trim() && questions.every(q => !q.question.trim())) {
        alert("Please add some content before previewing.");
        return;
    }
    setIsPreviewing(true);
  };

  if (isPreviewing) {
    const previewQuiz: Quiz = {
        id: initialQuiz?.id || -1,
        userId: currentUser.id,
        title: quizTitle || 'Untitled Quiz',
        questions: questions,
        createdAt: new Date().toISOString(),
        theme: quizTheme,
        customTheme: customTheme,
        shuffleQuestions: shuffleQuestions,
        backgroundMusic: bgMusic
    };

    return (
        <div className="fixed inset-0 z-50 bg-white">
            <div className="absolute top-0 left-0 w-full bg-yellow-400 text-yellow-900 text-center text-xs font-bold py-1 z-[60] shadow-sm">
                PREVIEW MODE • RESULTS WILL NOT BE SAVED
            </div>
            <QuizTaker 
                quiz={previewQuiz}
                onComplete={(answers, score) => {
                    const percent = Math.round((score / questions.length) * 100);
                    if(confirm(`Preview Complete!\nScore: ${score}/${questions.length} (${percent}%)\n\nReturn to editor?`)) {
                        setIsPreviewing(false);
                    }
                }}
                onExit={() => setIsPreviewing(false)}
            />
        </div>
    );
  }

  if (creationMode === 'selection') {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="max-w-[1400px] w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
                <button onClick={onExit} className="mb-10 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">Create New Quiz</h1>
                    <p className="text-xl text-slate-500 font-medium">Choose your path to mastery</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Manual Option */}
                    <button 
                        onClick={() => {
                            setCreationMode('editor');
                            setShowTutorial(true);
                            setTutorialStep(0);
                        }}
                        className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-200 hover:border-violet-500 hover:shadow-2xl hover:shadow-violet-200/50 transition-all duration-300 group text-left relative overflow-hidden h-[450px] flex flex-col hover:-translate-y-2"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                            <PenTool size={200} />
                        </div>
                        <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-violet-100 transition-colors shadow-sm">
                            <PenTool size={32} className="text-slate-600 group-hover:text-violet-600 transition-colors" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3 group-hover:text-violet-900 transition-colors">Create Manually</h3>
                        <p className="text-slate-500 font-medium text-base leading-relaxed mb-auto">
                            Build your quiz from scratch. Control every detail, from question types to exact answers and explanations.
                        </p>
                        
                        <div className="mt-8 flex items-center gap-2 text-violet-600 font-bold text-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                           Open Editor <ArrowRight size={20} />
                        </div>
                    </button>

                    {/* AI Text Option */}
                    <button 
                        onClick={() => {
                            setShowAIModal(true);
                        }}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] border-2 border-transparent hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 group text-left relative overflow-hidden h-[450px] flex flex-col hover:-translate-y-2"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 p-8 opacity-10 text-white group-hover:scale-110 transition-transform group-hover:rotate-12 duration-500 pointer-events-none">
                            <Sparkles size={200} />
                        </div>
                        
                        <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/10 group-hover:bg-indigo-500 group-hover:border-indigo-400 transition-all shadow-lg">
                            <Sparkles size={32} className="text-yellow-400" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3">
                            Generate from Topic
                        </h3>
                        <p className="text-slate-400 font-medium text-base leading-relaxed group-hover:text-slate-200 transition-colors mb-auto">
                            Enter a topic like "Ancient Rome" or "Cyberpunk" and let AI instantly build a complete quiz for you.
                        </p>
                        
                         <div className="mt-8 flex items-center gap-2 text-indigo-300 font-bold text-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                           Generate Now <Wand2 size={20} />
                        </div>
                    </button>

                    {/* AI Image Option */}
                    <button 
                        onClick={() => {
                            setCreationMode('editor');
                            setShowImageQuizModal(true);
                        }}
                        className="bg-gradient-to-br from-pink-600 to-rose-600 p-8 rounded-[2.5rem] border-2 border-transparent hover:border-pink-300 hover:shadow-2xl hover:shadow-pink-500/40 transition-all duration-300 group text-left relative overflow-hidden h-[450px] flex flex-col hover:-translate-y-2"
                    >
                         <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                         <div className="absolute top-0 right-0 p-8 opacity-10 text-white group-hover:scale-110 transition-transform group-hover:-rotate-12 duration-500 pointer-events-none">
                            <ImageIcon size={200} />
                        </div>

                        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm border border-white/20 group-hover:bg-white/30 transition-all shadow-lg">
                            <Camera size={32} className="text-white" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                            Quiz from Image
                            <span className="bg-white text-pink-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">Beta</span>
                        </h3>
                        <p className="text-pink-100 font-medium text-base leading-relaxed group-hover:text-white transition-colors mb-auto">
                            Upload a photo of notes, diagrams, or slides. AI will analyze it and create questions based on the visual content.
                        </p>
                        
                         <div className="mt-8 flex items-center gap-2 text-white font-bold text-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                           Upload & Generate <ArrowRight size={20} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const tutorialHighlight = showTutorial ? TUTORIAL_STEPS[tutorialStep].highlight : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {showTutorial && (
        <TutorialWidget 
          step={tutorialStep}
          onClose={closeTutorial}
          onNext={() => setTutorialStep(tutorialStep + 1)}
          onPrev={() => setTutorialStep(Math.max(0, tutorialStep - 1))}
        />
      )}

      {showValidationModal && (
        <ValidationModal 
          errors={validationErrors} 
          onClose={() => setShowValidationModal(false)} 
        />
      )}

      {showImageModal && (
        <ImageSelectionModal
          onSelect={handleImageSelect}
          onClose={() => setShowImageModal(false)}
          onAiUsed={() => onStatUpdate('ai_img')}
        />
      )}

      {showAIModal && (
        <GitHubAIModal
          onGenerate={handleAIGenerated}
          onClose={() => setShowAIModal(false)}
          onAiUsed={() => onStatUpdate('ai_quiz')}
        />
      )}

      {showImageQuizModal && (
        <ImageQuizModal
          onGenerate={handleAIGenerated}
          onClose={() => setShowImageQuizModal(false)}
          onAiUsed={() => onStatUpdate('ai_quiz')}
        />
      )}
      
      {showMusicModal && (
        <MusicSelectionModal 
            currentMusic={bgMusic}
            onSelect={setBgMusic}
            onClose={() => setShowMusicModal(false)}
        />
      )}

      {showThemeEditor && (
        <ThemeEditorModal 
            initialTheme={customTheme}
            onSave={(theme) => {
                setCustomTheme(theme);
                setShowThemeEditor(false);
                setShowThemeSelector(false);
            }}
            onClose={() => setShowThemeEditor(false)}
            onAiUsed={() => onStatUpdate('ai_img')}
        />
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sm:py-4 sticky top-0 z-40 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden hover:bg-slate-100 p-2 rounded-lg transition-colors flex-shrink-0 text-slate-600"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={onExit}
              className="hover:bg-slate-100 p-2 rounded-lg transition-colors flex-shrink-0 hidden sm:block text-slate-600"
            >
              <Home size={24} />
            </button>
            <div className={`flex-1 min-w-0 relative max-w-xl ${tutorialHighlight === 'title' ? 'ring-4 ring-yellow-400 ring-offset-2 rounded-lg' : ''}`}>
               <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-lg sm:text-xl font-bold focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white px-4 py-2 rounded-xl placeholder-slate-400 transition-all shadow-inner"
                placeholder="Enter Quiz Title..."
              />
            </div>
             <button
                onClick={() => setShuffleQuestions(!shuffleQuestions)}
                className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${shuffleQuestions ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                title="Shuffle Questions"
             >
                <Shuffle size={20} />
                <span className="hidden lg:inline text-sm font-bold">Shuffle</span>
             </button>
          </div>
          <div className={`flex gap-2 flex-shrink-0 items-center ${tutorialHighlight === 'save' ? 'ring-4 ring-yellow-400 ring-offset-2 rounded-lg' : ''}`}>
            
            {/* Music Selector */}
            <button
                onClick={() => setShowMusicModal(true)}
                className={`p-2 rounded-xl border transition-all active:scale-95 ${bgMusic ? 'bg-pink-50 border-pink-200 text-pink-600 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800'}`}
                title="Background Music"
            >
                <Music size={20} />
            </button>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className={`p-2 rounded-xl border transition-all active:scale-95 ${customTheme ? 'bg-violet-50 border-violet-300 text-violet-700' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                title="Change Theme"
              >
                <Palette size={20} />
              </button>
              
              {showThemeSelector && (
                <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 w-56 z-50 animate-in fade-in zoom-in duration-200">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide px-2 py-1 mb-1">Select Theme</h4>
                   
                   <button
                        onClick={() => setShowThemeEditor(true)}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 transition-opacity"
                    >
                       <Palette size={16} />
                       Create Custom Theme
                    </button>

                    {customTheme && (
                        <div className="mb-2 px-2 pb-2 border-b border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-violet-600">Custom Active</span>
                            <button 
                                onClick={() => { setCustomTheme(undefined); setShowThemeSelector(false); }}
                                className="text-xs text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>
                    )}

                   {Object.entries(THEMES).map(([key, theme]) => (
                     <button
                        key={key}
                        onClick={() => { setQuizTheme(key); setCustomTheme(undefined); setShowThemeSelector(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${quizTheme === key && !customTheme ? 'bg-violet-50 text-violet-700' : 'hover:bg-slate-50 text-slate-700'}`}
                     >
                       <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${theme.gradient}`}></div>
                       {theme.label}
                     </button>
                   ))}
                </div>
              )}
            </div>

            {/* Preview Button */}
            <button
                onClick={startPreview}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-all active:scale-95"
                title="Preview Quiz"
            >
                <Eye size={20} />
            </button>

             <button
              onClick={() => setShowAIModal(true)}
              className="bg-slate-900 text-white border border-slate-800 px-3 sm:px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm sm:text-base flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Sparkles size={18} className="text-yellow-400" />
              <span className="hidden sm:inline">AI Gen</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-xl font-bold text-white transition-all text-sm sm:text-base shadow-lg hover:shadow-green-200 active:scale-95"
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed lg:relative h-full w-72 sm:w-80 bg-white border-r border-slate-200 shadow-xl lg:shadow-none z-50 lg:z-0
          transform transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4 border-b border-slate-100 flex justify-between items-center lg:hidden">
            <h3 className="font-bold text-slate-800">Questions</h3>
            <button onClick={() => setSidebarOpen(false)} className="text-slate-500">
              <X size={24} />
            </button>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {questions.map((q, index) => (
              <div
                key={index}
                className={`p-3 rounded-2xl cursor-pointer transition-all group border-2 ${
                  index === currentQuestionIndex 
                    ? 'border-violet-500 bg-violet-50 shadow-sm' 
                    : 'border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
                onClick={() => {
                  setCurrentQuestionIndex(index);
                  setSidebarOpen(false);
                }}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      index === currentQuestionIndex ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                  }`}>{index + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold line-clamp-2 ${index === currentQuestionIndex ? 'text-violet-900' : 'text-slate-600'}`}>
                      {q.question || 'New Question'}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-xs font-medium text-slate-400">{q.type.replace('-', ' ')}</span>
                        {questions.length > 1 && (
                            <button
                            onClick={(e) => { e.stopPropagation(); removeQuestion(index); }}
                            className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete Question"
                            >
                            <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
            <button
                onClick={addQuestion}
                className={`w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-violet-500 hover:text-violet-600 hover:bg-violet-50 font-bold transition-all flex items-center justify-center gap-2 ${
                    tutorialHighlight === 'add' ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
                }`}
                >
                <PlusCircle size={20} />
                Add Question
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 h-full">
          {currentQ && (
            <div className="max-w-5xl mx-auto p-4 sm:p-8 lg:p-10 animate-in fade-in zoom-in duration-300">
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 sm:p-10 mb-8">
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Question Type</label>
                    <div className={`relative ${tutorialHighlight === 'type' ? 'ring-4 ring-yellow-400 ring-offset-2 rounded-xl' : ''}`}>
                        <select
                            value={currentQ.type}
                            onChange={(e) => updateQuestion(currentQuestionIndex, 'type', e.target.value)}
                            className="w-full sm:w-auto px-5 py-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:border-violet-500 focus:outline-none font-bold text-slate-700 appearance-none pr-10 cursor-pointer hover:border-slate-300 transition-colors"
                        >
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="true-false">True / False</option>
                            <option value="text-input">Text Answer</option>
                            <option value="ordering">Ordering (Sequence)</option>
                        </select>
                        <ArrowDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="sm:w-48">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Time Limit</label>
                    <div className={`relative ${tutorialHighlight === 'time' ? 'ring-4 ring-yellow-400 ring-offset-2 rounded-xl' : ''}`}>
                        <select
                            value={currentQ.timeLimit}
                            onChange={(e) => updateQuestion(currentQuestionIndex, 'timeLimit', Number(e.target.value))}
                            className="w-full px-5 py-3 border-2 border-slate-200 bg-slate-50 rounded-xl focus:border-violet-500 focus:outline-none font-bold text-slate-700 appearance-none pr-10 cursor-pointer hover:border-slate-300 transition-colors"
                        >
                            {[5, 10, 20, 30, 60, 90, 120, 240].map(time => (
                            <option key={time} value={time}>{time} seconds</option>
                            ))}
                        </select>
                        <ArrowDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="group relative">
                    <textarea
                    value={currentQ.question}
                    onChange={(e) => updateQuestion(currentQuestionIndex, 'question', e.target.value)}
                    className={`w-full text-2xl sm:text-3xl lg:text-4xl font-black bg-transparent border-b-2 border-slate-100 focus:border-violet-600 focus:outline-none py-4 placeholder-slate-300 resize-none transition-all leading-tight ${
                        tutorialHighlight === 'question' ? 'ring-4 ring-yellow-400 ring-offset-2 rounded-lg' : ''
                    }`}
                    placeholder="Type your question here..."
                    rows={2}
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-violet-600 transition-all duration-300 group-focus-within:w-full"></div>
                </div>

                <div className="mt-8">
                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Visual</label>
                    {currentQ.image ? (
                        <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50 w-full max-w-md">
                            <img
                                src={currentQ.image}
                                alt="Question"
                                className="w-full h-64 object-contain"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                                <button
                                    onClick={() => setShowImageModal(true)}
                                    className="bg-white/20 hover:bg-white/40 text-white p-3 rounded-xl transition-all"
                                    title="Change Image"
                                >
                                    <ImageIcon size={24} />
                                </button>
                                <button
                                    onClick={() => updateQuestion(currentQuestionIndex, 'image', '')}
                                    className="bg-red-500/80 hover:bg-red-600 text-white p-3 rounded-xl transition-all"
                                    title="Remove Image"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                        onClick={() => setShowImageModal(true)}
                        className="w-full max-w-md h-48 border-3 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:border-violet-400 hover:text-violet-500 hover:bg-violet-50 transition-all flex flex-col items-center justify-center gap-3 group"
                        >
                            <div className="bg-slate-100 p-4 rounded-full group-hover:bg-white transition-colors">
                                <ImageIcon size={28} />
                            </div>
                            <span className="font-bold text-sm">Add Image</span>
                        </button>
                    )}
                </div>

                {/* Explanation Field */}
                <div className={`mt-8 ${tutorialHighlight === 'explanation' ? 'ring-4 ring-yellow-400 ring-offset-2 rounded-xl' : ''}`}>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Answer Explanation</label>
                    <textarea
                        value={currentQ.explanation || ''}
                        onChange={(e) => updateQuestion(currentQuestionIndex, 'explanation', e.target.value)}
                        className="w-full px-5 py-4 border-2 border-slate-200 bg-slate-50 rounded-2xl focus:border-violet-500 focus:outline-none text-slate-700 text-base font-medium resize-none transition-colors focus:bg-white"
                        placeholder="Explain why the answer is correct..."
                        rows={2}
                    />
                </div>
              </div>

              {currentQ.type === 'multiple-choice' && (
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${
                  (tutorialHighlight === 'answers' || tutorialHighlight === 'correct') ? 'ring-4 ring-yellow-400 ring-offset-4 rounded-3xl p-2' : ''
                }`}>
                  {currentQ.options.map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`${COLORS[optIndex].bg} rounded-3xl p-1 relative shadow-lg group transition-transform hover:-translate-y-1`}
                    >
                      <div className="bg-white/10 backdrop-blur-md rounded-[20px] h-full p-6 flex flex-col justify-between border border-white/20">
                        <div className="flex items-start gap-4 mb-4">
                            <span className="text-white text-3xl font-black opacity-90 drop-shadow-md">{COLORS[optIndex].icon}</span>
                            <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(currentQuestionIndex, optIndex, e.target.value)}
                            className="flex-1 bg-white/90 hover:bg-white rounded-xl text-slate-900 placeholder-slate-400 font-bold text-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all shadow-inner"
                            placeholder={`Option ${optIndex + 1}`}
                            />
                        </div>
                        <button
                            onClick={() => updateQuestion(currentQuestionIndex, 'correctAnswer', optIndex)}
                            className={`w-full py-3 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2 ${
                            currentQ.correctAnswer === optIndex
                                ? 'bg-white text-slate-900 shadow-lg'
                                : 'bg-black/20 text-white hover:bg-black/30'
                            }`}
                        >
                            {currentQ.correctAnswer === optIndex && <Sparkles size={16} />}
                            {currentQ.correctAnswer === optIndex ? 'Correct Answer' : 'Mark Correct'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentQ.type === 'true-false' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                  {['True', 'False'].map((opt, optIndex) => (
                    <div
                      key={optIndex}
                      className={`${COLORS[optIndex].bg} rounded-[2.5rem] p-1 shadow-xl transition-transform hover:-translate-y-2`}
                    >
                         <div className="bg-white/10 backdrop-blur-md rounded-[2.2rem] h-full p-8 flex flex-col items-center justify-center min-h-[220px] border border-white/20">
                            <div className="text-7xl mb-4 opacity-90 drop-shadow-md">{COLORS[optIndex].icon}</div>
                            <div className="text-4xl font-black text-white mb-8 tracking-tight drop-shadow-sm">{opt}</div>
                            <button
                                onClick={() => updateQuestion(currentQuestionIndex, 'correctAnswer', optIndex)}
                                className={`w-full py-4 rounded-2xl font-bold transition-all text-lg ${
                                currentQ.correctAnswer === optIndex
                                    ? 'bg-white text-slate-900 shadow-xl'
                                    : 'bg-black/20 text-white hover:bg-black/30'
                                }`}
                            >
                                {currentQ.correctAnswer === optIndex ? '✓ Correct Answer' : 'Mark Correct'}
                            </button>
                        </div>
                    </div>
                  ))}
                </div>
              )}

              {currentQ.type === 'text-input' && (
                <div className="max-w-2xl mx-auto">
                  <div className="bg-white border-2 border-indigo-100 rounded-3xl p-10 shadow-sm text-center">
                    <label className="block text-sm font-bold text-indigo-400 uppercase tracking-wide mb-4">
                      Correct Answer
                    </label>
                    <input
                      type="text"
                      value={currentQ.correctAnswer as string}
                      onChange={(e) => updateQuestion(currentQuestionIndex, 'correctAnswer', e.target.value)}
                      className="w-full px-8 py-5 border-2 border-indigo-100 bg-indigo-50/50 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none text-2xl font-bold text-indigo-900 placeholder-indigo-300 text-center"
                      placeholder="Type correct answer..."
                    />
                    <p className="text-sm text-slate-500 mt-6 flex items-center justify-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">Note</span>
                        Exact match required (case-insensitive)
                    </p>
                  </div>
                </div>
              )}

              {currentQ.type === 'ordering' && (
                <div className={`grid grid-cols-1 gap-4 ${
                    (tutorialHighlight === 'answers' || tutorialHighlight === 'correct') ? 'ring-4 ring-yellow-400 ring-offset-4 rounded-3xl p-2' : ''
                  }`}>
                    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center text-blue-800 font-bold mb-4">
                        Define the CORRECT order (Top to Bottom)
                    </div>
                    {currentQ.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={`${COLORS[optIndex].bg} rounded-3xl p-4 flex items-center gap-4 shadow-md transition-all hover:scale-[1.01]`}
                      >
                        <div className="flex flex-col gap-1 text-white/50">
                            <button onClick={() => moveOrderingOption(currentQuestionIndex, optIndex, 'up')} disabled={optIndex === 0} className="hover:text-white disabled:opacity-30 p-1 hover:bg-white/10 rounded">
                                <ArrowUp size={24} />
                            </button>
                            <button onClick={() => moveOrderingOption(currentQuestionIndex, optIndex, 'down')} disabled={optIndex === 3} className="hover:text-white disabled:opacity-30 p-1 hover:bg-white/10 rounded">
                                <ArrowDown size={24} />
                            </button>
                        </div>
                        <span className="text-white text-4xl font-black opacity-80 w-12 text-center drop-shadow-md">{optIndex + 1}</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOption(currentQuestionIndex, optIndex, e.target.value)}
                          className="flex-1 bg-white rounded-xl text-slate-900 placeholder-slate-400 font-bold text-xl px-6 py-4 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all shadow-inner"
                          placeholder={`Item ${optIndex + 1}`}
                        />
                        <div className="p-2 cursor-grab active:cursor-grabbing">
                            <GripVertical className="text-white/50" size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
