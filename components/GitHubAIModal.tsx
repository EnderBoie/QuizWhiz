import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, BookOpen, Hash, BarChart, Key, AlertCircle, HelpCircle, ArrowLeft, ExternalLink, Layers, CheckSquare, Square, PlusCircle } from 'lucide-react';
import { Question } from '../types';
import { generateQuizWithGitHub } from '../services/githubAI';
import { generateImageForQuestion } from '../services/genAI';
import { compressImage } from '../services/imageUtils';

interface GitHubAIModalProps {
  onGenerate: (questions: Question[], title: string) => void;
  onClose: () => void;
  onAiUsed: () => void;
}

export const GitHubAIModal: React.FC<GitHubAIModalProps> = ({ onGenerate, onClose, onAiUsed }) => {
  const [step, setStep] = useState<'config' | 'review'>('config');
  
  // Config State
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [quizType, setQuizType] = useState('mixed');
  const [token, setToken] = useState('');
  const [autoImages, setAutoImages] = useState(true);

  // Generation/Review State
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const [generatedData, setGeneratedData] = useState<{title: string, questions: Question[]} | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    const savedToken = localStorage.getItem('gh_models_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    const cleanToken = token.trim();
    if (!cleanToken) {
      setError('Please enter your GitHub Token');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setLoadingStatus('Asking GitHub for questions...');

    try {
        localStorage.setItem('gh_models_token', cleanToken);
    } catch (e) {
        console.warn("Could not save token to local storage");
    }

    try {
      // Always generate the max requested by user
      const result = await generateQuizWithGitHub(cleanToken, topic, difficulty, count, quizType);
      
      setGeneratedData(result);
      
      // Select all by default
      const allIndices = new Set<number>();
      result.questions.forEach((_, i) => allIndices.add(i));
      setSelectedIndices(allIndices);

      setStep('review');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate quiz. Check your token and try again.");
    } finally {
      setIsGenerating(false);
      setLoadingStatus('');
    }
  };

  const handleToggleQuestion = (index: number) => {
      const newSelected = new Set(selectedIndices);
      if (newSelected.has(index)) {
          newSelected.delete(index);
      } else {
          newSelected.add(index);
      }
      setSelectedIndices(newSelected);
  };

  const handleSelectAll = () => {
      if (!generatedData) return;
      if (selectedIndices.size === generatedData.questions.length) {
          setSelectedIndices(new Set());
      } else {
          const all = new Set<number>();
          generatedData.questions.forEach((_, i) => all.add(i));
          setSelectedIndices(all);
      }
  };

  const handleConfirmSelection = async () => {
      if (!generatedData) return;
      
      const finalQuestions = generatedData.questions.filter((_, i) => selectedIndices.has(i));
      
      if (finalQuestions.length === 0) {
          setError("Please select at least one question.");
          return;
      }

      setIsGenerating(true);
      
      let processedQuestions = finalQuestions;

      if (autoImages) {
        setLoadingStatus(`Creating visuals (0/${finalQuestions.length})...`);
        
        processedQuestions = await Promise.all(finalQuestions.map(async (q, idx) => {
            try {
                // Stagger requests slightly
                await new Promise(r => setTimeout(r, idx * 300)); 
                const imageUrl = await generateImageForQuestion(q.question);
                if (imageUrl) {
                    const compressedUrl = await compressImage(imageUrl);
                    setLoadingStatus(prev => prev.replace(/\(\d+\//, `(${idx + 1}/`));
                    return { ...q, image: compressedUrl };
                }
                return q;
            } catch (e) {
                console.error("Failed image for q", idx, e);
                return q;
            }
        }));
      }

      onAiUsed();
      onGenerate(processedQuestions, generatedData.title);
      onClose();
      setIsGenerating(false);
  };

  // Helper View for Token Help (Same as before)
  if (showHelp) {
     return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in zoom-in duration-200 h-[85vh]">
            {/* Header */}
            <div className="bg-slate-900 p-6 flex justify-between items-center border-b border-slate-800">
                <div>
                    <h2 className="text-2xl font-black text-white flex items-center gap-2">
                        <Key className="text-yellow-400" />
                        Get Your GitHub Token
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">Follow these steps to enable AI powers (Free!)</p>
                </div>
                <button 
                onClick={() => setShowHelp(false)} 
                className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                >
                <ArrowLeft size={18} />
                Back
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50 custom-scrollbar">
                <div className="space-y-8 max-w-xl mx-auto">
                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xl">1</div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Sign in to GitHub</h3>
                        <p className="text-slate-600 mb-2">You need a GitHub account to access their free AI models.</p>
                        <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline">Create Account / Sign In <ExternalLink size={14} /></a>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-black text-xl">2</div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Go to Token Settings</h3>
                        <p className="text-slate-600 mb-3">Navigate to the Personal Access Tokens page.</p>
                        <a href="https://github.com/settings/tokens?type=beta" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl">Open Token Page <ExternalLink size={16} /></a>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-black text-xl">3</div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Generate Token</h3>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 mt-2 shadow-sm space-y-3 text-sm">
                            <div className="flex items-center gap-2"><span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Name</span><span>Give it a name (e.g., "QuizWhiz")</span></div>
                            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg"><span className="font-bold text-yellow-800 block mb-1">⚠️ Required Permission:</span><span>Scroll down to <b>"Account permissions"</b>. You MUST select the <b>"Models"</b> permission (Read & Write).</span></div>
                            <div className="flex items-center gap-2"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold uppercase">Final</span><span>Click "Generate token" at the bottom</span></div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-black text-xl">4</div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">Copy & Paste</h3>
                        <p className="text-slate-600 mb-2">Copy the token starting with <code>github_pat_...</code> and paste it here.</p>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
     );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 h-[85vh]">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 flex justify-between items-center text-white flex-shrink-0">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sparkles size={20} className="text-yellow-400" />
            AI Quiz Generator
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 rounded p-1">
            <X size={20} />
          </button>
        </div>

        {step === 'config' ? (
            <div className="p-6 space-y-5 bg-white overflow-y-auto flex-1">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5" />
                <span>{error}</span>
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Key size={16} className="text-gray-600" />
                GitHub Token
                </label>
                <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="github_pat_..."
                className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800 font-mono text-sm shadow-sm"
                />
                <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                    Token is saved locally.
                </p>
                <button 
                    onClick={() => setShowHelp(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
                >
                    <HelpCircle size={12} />
                    Get Token Help
                </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen size={16} className="text-gray-600" />
                Topic
                </label>
                <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Ancient Rome, Cyberpunk 2077"
                className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800"
                />
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <Hash size={16} className="text-gray-600" />
                    Count (Max 20)
                </label>
                <select
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800"
                >
                    <option value={5}>5 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={15}>15 Questions</option>
                    <option value={20}>20 Questions</option>
                </select>
                </div>
                <div className="flex-1">
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <BarChart size={16} className="text-gray-600" />
                    Difficulty
                </label>
                <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-800"
                >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-4 bg-gradient-to-r from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70"
            >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} className="text-yellow-400" />}
                {isGenerating ? (loadingStatus || 'Generating...') : 'Review Questions'}
            </button>
            </div>
        ) : (
            <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
                {/* Review Header */}
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
                    <h3 className="font-bold text-slate-800">Select Questions to Add</h3>
                    <button 
                        onClick={handleSelectAll}
                        className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        {generatedData && selectedIndices.size === generatedData.questions.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                {/* Question List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {generatedData?.questions.map((q, idx) => {
                        const isSelected = selectedIndices.has(idx);
                        return (
                            <div 
                                key={idx} 
                                onClick={() => handleToggleQuestion(idx)}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                                    isSelected 
                                    ? 'bg-blue-50 border-blue-500 shadow-md' 
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className={`flex-shrink-0 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`}>
                                    {isSelected ? <CheckSquare size={24} /> : <Square size={24} />}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm sm:text-base ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>{q.question}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {q.options.map((opt, i) => (
                                            <span key={i} className={`text-xs px-2 py-1 rounded border ${
                                                i === q.correctAnswer 
                                                ? 'bg-green-100 border-green-200 text-green-800 font-bold' 
                                                : 'bg-slate-100 border-slate-200 text-slate-500'
                                            }`}>
                                                {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-white border-t border-slate-200 space-y-3 flex-shrink-0">
                     <div className="bg-violet-50 p-3 rounded-xl border border-violet-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-violet-200 p-2 rounded-lg text-violet-700">
                                <Layers size={18} />
                            </div>
                            <div>
                                <div className="font-bold text-violet-900 text-sm">Generate Visuals</div>
                                <div className="text-violet-600 text-xs">Create unique images</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setAutoImages(!autoImages)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                                autoImages ? 'bg-violet-600' : 'bg-gray-300'
                            }`}
                        >
                            <div 
                                className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                                    autoImages ? 'translate-x-6' : 'translate-x-0'
                                }`} 
                            />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep('config')}
                            className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleConfirmSelection}
                            disabled={isGenerating || selectedIndices.size === 0}
                            className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" /> : <PlusCircle size={20} />}
                            {isGenerating ? loadingStatus : `Add ${selectedIndices.size} Questions`}
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};