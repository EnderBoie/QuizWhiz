
import React, { useRef } from 'react';
import { PlusCircle, Play, Edit2, Trash2, LogOut, User, BookOpen, Trophy, History, Brain, Settings, Download, Upload, Globe } from 'lucide-react';
import { Quiz, User as UserType } from '../types';
import { Logo } from './Logo';

interface QuizHomeProps {
  quizzes: Quiz[];
  user: UserType;
  onStartQuiz: (quiz: Quiz) => void;
  onStartStudy: (quiz: Quiz) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onDeleteQuiz: (id: number) => void;
  onCreateNew: () => void;
  onViewTutorial: () => void;
  onLogout: () => void;
  onViewAchievements: () => void;
  onViewHistory: () => void;
  onStartFocus: () => void;
  onViewSettings?: () => void;
  onExportQuiz: (quiz: Quiz) => void;
  onImportQuiz: (file: File) => void;
  onViewCommunity: () => void;
}

export const QuizHome: React.FC<QuizHomeProps> = ({
  quizzes,
  user,
  onStartQuiz,
  onStartStudy,
  onEditQuiz,
  onDeleteQuiz,
  onCreateNew,
  onViewTutorial,
  onLogout,
  onViewAchievements,
  onViewHistory,
  onStartFocus,
  onViewSettings,
  onExportQuiz,
  onImportQuiz,
  onViewCommunity
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (!file.name.toLowerCase().endsWith('.qzx')) {
            alert("Invalid file format. Please select a .qzx file.");
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }
        onImportQuiz(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-20 px-4 sm:px-8 py-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Logo variant="medium" className="transform hover:rotate-12 transition-transform duration-300" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">QuizWhiz</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-slate-200 shadow-sm">
              <User size={18} className="text-slate-500" />
              <span className="font-bold text-sm text-slate-700">{user.username}</span>
            </div>
            
            {onViewSettings && (
                <button
                    onClick={onViewSettings}
                    className="p-2.5 hover:bg-slate-100 rounded-xl transition-all duration-200 text-slate-500 hover:text-slate-800 active:scale-95"
                    title="Settings"
                >
                    <Settings size={22} />
                </button>
            )}

            <button 
              onClick={onLogout}
              className="p-2.5 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-bold active:scale-95"
              title="Logout"
            >
              <LogOut size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-8 animate-fade-in">
        <div className="sm:hidden mb-8 flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="bg-violet-100 p-2 rounded-full">
            <User size={20} className="text-violet-600" />
          </div>
          <span className="font-bold text-slate-700">Logged in as {user.username}</span>
        </div>

        {/* Dashboard Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            <button
            onClick={onCreateNew}
            className="col-span-2 md:col-span-2 lg:col-span-1 group relative overflow-hidden bg-slate-900 text-white font-bold p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-center gap-3 text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <PlusCircle size={32} className="relative z-10 text-violet-200 group-hover:text-white transition-colors" />
              <span className="relative z-10">New Quiz</span>
            </button>

            <button
            onClick={onViewCommunity}
            className="bg-white border border-slate-200 hover:border-pink-300 hover:bg-pink-50 text-slate-700 hover:text-pink-600 font-bold p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-3"
            >
              <Globe size={28} className="text-pink-500" />
              Community
            </button>

             <button
            onClick={onStartFocus}
            className="bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-3"
            >
              <Brain size={28} className="text-indigo-500" />
              Focus Mode
            </button>

            <button
            onClick={onViewAchievements}
            className="bg-white border border-slate-200 hover:border-yellow-300 hover:bg-yellow-50 text-slate-700 hover:text-yellow-700 font-bold p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-3"
            >
              <Trophy size={28} className="text-yellow-500" />
              Badges
            </button>

            <button
            onClick={onViewHistory}
            className="bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-3"
            >
              <History size={28} className="text-blue-500" />
              History
            </button>

            <div className="relative group h-full">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange} 
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full bg-white border border-slate-200 hover:border-green-300 hover:bg-green-50 text-slate-700 hover:text-green-700 font-bold p-6 rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 flex flex-col items-center justify-center gap-3"
                >
                  <Upload size={28} className="text-green-500" />
                  Import
                </button>
            </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-12 sm:p-20 text-center animate-fade-in">
            <div className="w-24 h-24 bg-violet-50 text-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusCircle size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">No quizzes yet</h2>
            <p className="text-slate-500 max-w-md mx-auto text-lg mb-8 font-medium">Create your first quiz or check out the community to get started!</p>
            <button 
                onClick={onViewCommunity}
                className="bg-slate-900 text-white hover:bg-slate-800 font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
                Browse Community
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {quizzes.map((quiz, idx) => (
              <div 
                key={quiz.id} 
                className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col h-full"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="h-36 sm:h-44 bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-violet-100 group-hover:to-fuchsia-100 transition-colors duration-500 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/40 to-transparent"></div>
                   <span className="text-6xl sm:text-7xl filter drop-shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">🎯</span>
                   
                   <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); onExportQuiz(quiz); }}
                        className="bg-white/90 p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-white shadow-sm"
                        title="Export"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteQuiz(quiz.id); }}
                        className="bg-white/90 p-2 rounded-xl text-slate-600 hover:text-red-600 hover:bg-white shadow-sm"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-xl font-black text-slate-800 mb-1 line-clamp-2 leading-tight group-hover:text-violet-700 transition-colors">{quiz.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="bg-slate-100 px-3 py-1 rounded-lg text-xs font-bold text-slate-600 uppercase tracking-wide">{quiz.questions.length} Questions</span>
                    </div>
                  </div>
                  
                  <div className="mt-auto space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                        onClick={() => onStartQuiz(quiz)}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                        >
                        <Play size={16} className="fill-current" />
                        Play
                        </button>
                        <button
                        onClick={() => onStartStudy(quiz)}
                        className="bg-white border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold py-3 px-4 rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
                        >
                        <BookOpen size={16} />
                        Study
                        </button>
                    </div>
                    <button
                      onClick={() => onEditQuiz(quiz)}
                      className="w-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 py-3 rounded-xl transition-colors font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-slate-100"
                    >
                      <Edit2 size={14} /> Edit Quiz
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
