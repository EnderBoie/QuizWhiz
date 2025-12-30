import React from 'react';
import { Achievement, User } from '../types';
import { ACHIEVEMENTS } from '../constants';
import { ArrowLeft, Trophy, Lock } from 'lucide-react';

interface AchievementsPageProps {
  user: User;
  onBack: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ user, onBack }) => {
  const unlockedCount = user.achievements.length;
  const progress = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={28} />
            <h1 className="text-2xl font-black text-slate-800">Achievements</h1>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Stats Summary */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 text-white mb-8 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h2 className="text-3xl font-black mb-2">Your Progress</h2>
              <p className="text-indigo-100 font-medium">Keep playing and creating to unlock more!</p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <div className="text-4xl font-black">{unlockedCount}</div>
              <div className="text-sm font-bold opacity-80 uppercase tracking-wide text-indigo-200">
                Of {ACHIEVEMENTS.length}<br/>Unlocked
              </div>
            </div>
          </div>
          <div className="w-full bg-black/20 h-4 rounded-full mt-6 overflow-hidden">
            <div 
              className="bg-yellow-400 h-full transition-all duration-1000 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = user.achievements.includes(ach.id);
            return (
              <div 
                key={ach.id} 
                className={`
                  relative overflow-hidden rounded-2xl p-6 border transition-all duration-300
                  ${isUnlocked 
                    ? 'bg-white border-violet-100 shadow-md hover:shadow-lg transform hover:-translate-y-1' 
                    : 'bg-slate-100 border-slate-200 opacity-70 grayscale'}
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner
                    ${isUnlocked ? 'bg-violet-50' : 'bg-slate-200'}
                  `}>
                    {isUnlocked ? ach.icon : <Lock size={20} className="text-slate-400" />}
                  </div>
                  <div>
                    <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-slate-800' : 'text-slate-500'}`}>
                      {ach.title}
                    </h3>
                    <p className={`text-sm ${isUnlocked ? 'text-slate-600' : 'text-slate-400'}`}>
                      {ach.description}
                    </p>
                  </div>
                </div>
                {isUnlocked && (
                    <div className="absolute top-0 right-0 p-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};