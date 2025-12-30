
import React, { useState, useEffect } from 'react';
import { Quiz, User } from '../types';
import { ArrowLeft, Search, Heart, Globe, Trophy, Play, Share2, Users, Star, Flame } from 'lucide-react';
import { Logo } from './Logo';

// Expanded Mock Data to simulate a backend community
const MOCK_COMMUNITY_QUIZZES: (Quiz & { likes: number, plays: number, author: string })[] = [
  {
    id: 9901,
    userId: 'community_1',
    author: 'ScienceGeek',
    title: 'The Wonders of Space',
    createdAt: new Date().toISOString(),
    theme: 'cyberpunk',
    likes: 1240,
    plays: 5400,
    questions: [
        { question: 'Which planet is known as the Red Planet?', image: '', type: 'multiple-choice', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 1, timeLimit: 20 },
        { question: 'What is the largest planet in our solar system?', image: '', type: 'multiple-choice', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], correctAnswer: 2, timeLimit: 20 },
        { question: 'True or False: The sun is a star.', image: '', type: 'true-false', options: ['True', 'False'], correctAnswer: 0, timeLimit: 15 }
    ]
  },
  {
    id: 9902,
    userId: 'community_2',
    author: 'HistoryBuff',
    title: 'Ancient Civilizations',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 856,
    plays: 3200,
    questions: [{ question: 'Who built the Pyramids?', image: '', type: 'text-input', options: [''], correctAnswer: 'Egyptians', timeLimit: 30 }]
  },
  {
    id: 9903,
    userId: 'community_3',
    author: 'PopCulture',
    title: '2000s Music Trivia',
    createdAt: new Date().toISOString(),
    theme: 'ocean',
    likes: 2100,
    plays: 8900,
    questions: [{ question: 'Who sang "Toxic"?', image: '', type: 'multiple-choice', options: ['Madonna', 'Britney Spears', 'Beyonce', 'Rihanna'], correctAnswer: 1, timeLimit: 15 }]
  },
  {
    id: 9904,
    userId: 'community_4',
    author: 'RetroKing',
    title: 'Ultimate 80s Trivia',
    createdAt: new Date().toISOString(),
    theme: 'cyberpunk',
    likes: 3400,
    plays: 12500,
    questions: [{ question: 'Who you gonna call?', image: '', type: 'text-input', options: [''], correctAnswer: 'Ghostbusters', timeLimit: 20 }]
  },
  {
    id: 9905,
    userId: 'community_5',
    author: 'GeoMaster',
    title: 'World Capitals Challenge',
    createdAt: new Date().toISOString(),
    theme: 'nature',
    likes: 920,
    plays: 4100,
    questions: [{ question: 'Capital of Australia?', image: '', type: 'multiple-choice', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctAnswer: 2, timeLimit: 20 }]
  },
  {
    id: 9906,
    userId: 'community_6',
    author: 'CodeWizard',
    title: 'Python for Beginners',
    createdAt: new Date().toISOString(),
    theme: 'cyberpunk',
    likes: 5600,
    plays: 18000,
    questions: [{ question: 'What is the output of print(2**3)?', image: '', type: 'multiple-choice', options: ['6', '8', '9', 'Error'], correctAnswer: 1, timeLimit: 30 }]
  },
  {
    id: 9907,
    userId: 'community_7',
    author: 'StanTheMan',
    title: 'Marvel Cinematic Universe',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 4500,
    plays: 22000,
    questions: [{ question: 'What is Iron Man\'s real name?', image: '', type: 'text-input', options: [''], correctAnswer: 'Tony Stark', timeLimit: 15 }]
  },
  {
    id: 9908,
    userId: 'community_8',
    author: 'DumbledoreFan',
    title: 'Harry Potter Spells',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 3800,
    plays: 15600,
    questions: [{ question: 'Spell to unlock doors?', image: '', type: 'text-input', options: [''], correctAnswer: 'Alohomora', timeLimit: 20 }]
  },
  {
    id: 9909,
    userId: 'community_9',
    author: 'HoopDreams',
    title: 'NBA Legends',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 1200,
    plays: 5600,
    questions: [{ question: 'Who is MJ?', image: '', type: 'multiple-choice', options: ['Michael Jackson', 'Michael Jordan', 'Magic Johnson', 'Mick Jagger'], correctAnswer: 1, timeLimit: 15 }]
  },
  {
    id: 9910,
    userId: 'community_10',
    author: 'DrHouse',
    title: 'Human Anatomy 101',
    createdAt: new Date().toISOString(),
    theme: 'nature',
    likes: 2100,
    plays: 6700,
    questions: [{ question: 'Largest organ in the body?', image: '', type: 'text-input', options: [''], correctAnswer: 'Skin', timeLimit: 20 }]
  },
  {
    id: 9911,
    userId: 'community_11',
    author: 'ArtVandelay',
    title: 'Famous Art Heists',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 750,
    plays: 2300,
    questions: [{ question: 'Which museum was the Mona Lisa stolen from?', image: '', type: 'multiple-choice', options: ['The Met', 'The Louvre', 'British Museum', 'Uffizi'], correctAnswer: 1, timeLimit: 25 }]
  },
  {
    id: 9912,
    userId: 'community_12',
    author: 'Heisenberg',
    title: 'Breaking Bad Trivia',
    createdAt: new Date().toISOString(),
    theme: 'nature',
    likes: 5100,
    plays: 19500,
    questions: [{ question: 'Walter White\'s alias?', image: '', type: 'text-input', options: [''], correctAnswer: 'Heisenberg', timeLimit: 15 }]
  },
  {
    id: 9913,
    userId: 'community_13',
    author: 'ParisLover',
    title: 'Basic French Phrases',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 1800,
    plays: 7200,
    questions: [{ question: 'Translate "Hello"', image: '', type: 'text-input', options: [''], correctAnswer: 'Bonjour', timeLimit: 20 }]
  },
  {
    id: 9914,
    userId: 'community_14',
    author: 'ChemNerd',
    title: 'The Periodic Table',
    createdAt: new Date().toISOString(),
    theme: 'nature',
    likes: 3200,
    plays: 9800,
    questions: [{ question: 'Symbol for Gold?', image: '', type: 'text-input', options: [''], correctAnswer: 'Au', timeLimit: 15 }]
  },
  {
    id: 9915,
    userId: 'community_15',
    author: 'JonSnow',
    title: 'Game of Thrones Lore',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 6700,
    plays: 28000,
    questions: [{ question: 'House Stark words?', image: '', type: 'multiple-choice', options: ['Hear Me Roar', 'Winter is Coming', 'Fire and Blood', 'Ours is the Fury'], correctAnswer: 1, timeLimit: 20 }]
  },
  {
    id: 9916,
    userId: 'community_16',
    author: 'FullStackDev',
    title: 'JavaScript Quirks',
    createdAt: new Date().toISOString(),
    theme: 'cyberpunk',
    likes: 4200,
    plays: 11000,
    questions: [{ question: 'typeof NaN?', image: '', type: 'multiple-choice', options: ['number', 'NaN', 'undefined', 'object'], correctAnswer: 0, timeLimit: 25 }]
  },
  {
    id: 9917,
    userId: 'community_17',
    author: 'Caesar',
    title: 'Ancient Rome',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 1500,
    plays: 5400,
    questions: [{ question: 'First Emperor?', image: '', type: 'multiple-choice', options: ['Julius Caesar', 'Augustus', 'Nero', 'Trajan'], correctAnswer: 1, timeLimit: 20 }]
  },
  {
    id: 9918,
    userId: 'community_18',
    author: 'JediMaster',
    title: 'Star Wars: Clone Wars',
    createdAt: new Date().toISOString(),
    theme: 'cyberpunk',
    likes: 5900,
    plays: 21000,
    questions: [{ question: 'Anakin\'s Padawan?', image: '', type: 'text-input', options: [''], correctAnswer: 'Ahsoka Tano', timeLimit: 20 }]
  },
  {
    id: 9919,
    userId: 'community_19',
    author: 'CentralPerk',
    title: 'Friends TV Show',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 7200,
    plays: 35000,
    questions: [{ question: 'Joey doesn\'t share ___?', image: '', type: 'text-input', options: [''], correctAnswer: 'food', timeLimit: 15 }]
  },
  {
    id: 9920,
    userId: 'community_20',
    author: 'HistoryBuff',
    title: 'World War II Timeline',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 2900,
    plays: 9100,
    questions: [{ question: 'Year WWII ended?', image: '', type: 'text-input', options: [''], correctAnswer: '1945', timeLimit: 15 }]
  },
  {
    id: 9921,
    userId: 'community_21',
    author: 'BrandExpert',
    title: 'Guess the Logo',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 1900,
    plays: 8500,
    questions: [{ question: 'Golden Arches belong to?', image: '', type: 'text-input', options: [''], correctAnswer: 'McDonalds', timeLimit: 15 }]
  },
  {
    id: 9922,
    userId: 'community_22',
    author: 'OtakuLife',
    title: 'Anime Openings',
    createdAt: new Date().toISOString(),
    theme: 'cyberpunk',
    likes: 4800,
    plays: 16500,
    questions: [{ question: 'Song from Evangelion?', image: '', type: 'multiple-choice', options: ['Unravel', 'Blue Bird', 'Cruel Angel\'s Thesis', 'Tank!'], correctAnswer: 2, timeLimit: 20 }]
  },
  {
    id: 9923,
    userId: 'community_23',
    author: 'Swiftie',
    title: 'Taylor Swift Lyrics',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 8100,
    plays: 42000,
    questions: [{ question: 'Finish the lyric: "Shake it ___"', image: '', type: 'text-input', options: [''], correctAnswer: 'off', timeLimit: 10 }]
  },
  {
    id: 9924,
    userId: 'community_24',
    author: 'DanTheMan',
    title: 'React Hooks Mastery',
    createdAt: new Date().toISOString(),
    theme: 'cyberpunk',
    likes: 3100,
    plays: 9800,
    questions: [{ question: 'Hook for side effects?', image: '', type: 'text-input', options: [''], correctAnswer: 'useEffect', timeLimit: 20 }]
  },
  {
    id: 9925,
    userId: 'community_25',
    author: 'BookWorm',
    title: 'Classic Literature',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 1400,
    plays: 4800,
    questions: [{ question: 'Who wrote Pride and Prejudice?', image: '', type: 'multiple-choice', options: ['Charlotte Bronte', 'Jane Austen', 'Emily Dickinson', 'Virginia Woolf'], correctAnswer: 1, timeLimit: 20 }]
  },
  {
    id: 9926,
    userId: 'community_26',
    author: 'ToonSquad',
    title: '90s Cartoons',
    createdAt: new Date().toISOString(),
    theme: 'ocean',
    likes: 2600,
    plays: 11200,
    questions: [{ question: 'Hey Arnold\'s nickname?', image: '', type: 'text-input', options: [''], correctAnswer: 'Football Head', timeLimit: 20 }]
  },
  {
    id: 9927,
    userId: 'community_27',
    author: 'GoalScorer',
    title: 'FIFA World Cup History',
    createdAt: new Date().toISOString(),
    theme: 'nature',
    likes: 3300,
    plays: 13400,
    questions: [{ question: 'Most World Cup wins?', image: '', type: 'multiple-choice', options: ['Germany', 'Italy', 'Argentina', 'Brazil'], correctAnswer: 3, timeLimit: 20 }]
  },
  {
    id: 9928,
    userId: 'community_28',
    author: 'ChefRamsey',
    title: 'Culinary Terms',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 900,
    plays: 3100,
    questions: [{ question: 'What is a "Julienne"?', image: '', type: 'multiple-choice', options: ['Dice', 'Thin Strips', 'Mince', 'Puree'], correctAnswer: 1, timeLimit: 25 }]
  },
  {
    id: 9929,
    userId: 'community_29',
    author: 'Satoshi',
    title: 'Cryptocurrency Basics',
    createdAt: new Date().toISOString(),
    theme: 'cyberpunk',
    likes: 2200,
    plays: 7500,
    questions: [{ question: 'Who created Bitcoin?', image: '', type: 'text-input', options: [''], correctAnswer: 'Satoshi Nakamoto', timeLimit: 20 }]
  },
  {
    id: 9930,
    userId: 'community_30',
    author: 'Zeus',
    title: 'Mythology: Greek Gods',
    createdAt: new Date().toISOString(),
    theme: 'classic',
    likes: 3900,
    plays: 14500,
    questions: [{ question: 'God of War?', image: '', type: 'text-input', options: [''], correctAnswer: 'Ares', timeLimit: 15 }]
  }
];

interface CommunityPageProps {
  user: User;
  onBack: () => void;
  onPlayQuiz: (quiz: Quiz) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ user, onBack, onPlayQuiz }) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'new' | 'leaderboard'>('trending');
  const [likedQuizzes, setLikedQuizzes] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load local likes
    const storedLikes = localStorage.getItem('quizwhiz_likes');
    if (storedLikes) {
        setLikedQuizzes(JSON.parse(storedLikes));
    }
  }, []);

  const toggleLike = (quizId: number) => {
    let newLikes;
    if (likedQuizzes.includes(quizId)) {
        newLikes = likedQuizzes.filter(id => id !== quizId);
    } else {
        newLikes = [...likedQuizzes, quizId];
    }
    setLikedQuizzes(newLikes);
    localStorage.setItem('quizwhiz_likes', JSON.stringify(newLikes));
  };

  const handleChallenge = (quizTitle: string) => {
    // Simulate copying a link
    const dummyLink = `https://quizwhiz.app/challenge/${Math.random().toString(36).substr(2, 9)}`;
    navigator.clipboard.writeText(`I challenge you to beat my score on "${quizTitle}"! Play here: ${dummyLink}`);
    alert("Challenge link copied to clipboard! Send it to a friend.");
  };

  const filteredQuizzes = MOCK_COMMUNITY_QUIZZES.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ArrowLeft size={24} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
                <Globe className="text-indigo-500" size={24} />
                <h1 className="text-xl sm:text-2xl font-black text-slate-800">Community Hub</h1>
            </div>
          </div>
          
          <div className="relative hidden sm:block w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search quizzes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium text-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl p-8 text-white mb-8 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-black mb-2">Weekly Challenge</h2>
                <p className="text-indigo-100 mb-6 max-w-lg">Beat the high score on "The Wonders of Space" to win the exclusive Astronaut badge!</p>
                <button 
                    onClick={() => onPlayQuiz(MOCK_COMMUNITY_QUIZZES[0])}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg flex items-center gap-2"
                >
                    <Flame size={20} /> Accept Challenge
                </button>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 transform translate-x-12"></div>
            <Trophy size={140} className="absolute -bottom-6 -right-6 text-white/20 rotate-12" />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {[
                { id: 'trending', label: 'Trending Now', icon: Flame },
                { id: 'new', label: 'Newest', icon: Star },
                { id: 'leaderboard', label: 'Global Leaderboard', icon: Trophy },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                        activeTab === tab.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
        </div>

        {activeTab === 'leaderboard' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                    <h3 className="font-black text-xl text-slate-800">Top Players This Week</h3>
                </div>
                {[
                    { rank: 1, name: 'QuizMaster99', score: 15400, avatar: '👑' },
                    { rank: 2, name: 'Brainiac_X', score: 14200, avatar: '🧠' },
                    { rank: 3, name: 'TriviaQueen', score: 13800, avatar: '⭐' },
                    { rank: 4, name: 'SpeedRunner', score: 12100, avatar: '⚡' },
                    { rank: 5, name: user.username, score: user.stats.questionsAnswered * 100, avatar: '👤' }, // Show current user
                ].map((player, idx) => (
                    <div key={idx} className={`p-4 flex items-center gap-4 ${player.name === user.username ? 'bg-indigo-50 border-l-4 border-indigo-500' : 'border-b border-slate-100'}`}>
                        <div className={`w-8 h-8 flex items-center justify-center font-black ${idx < 3 ? 'text-yellow-500 text-xl' : 'text-slate-400'}`}>
                            {player.rank}
                        </div>
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-lg shadow-inner">
                            {player.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="font-bold text-slate-800">{player.name}</div>
                            <div className="text-xs text-slate-500 font-medium">Level {Math.floor(player.score / 1000)}</div>
                        </div>
                        <div className="font-mono font-bold text-indigo-600">{player.score.toLocaleString()} pts</div>
                    </div>
                ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map(quiz => (
                    <div key={quiz.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                        <div className="h-32 bg-slate-800 relative overflow-hidden">
                             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 opacity-80"></div>
                             <div className="absolute bottom-0 left-0 p-6">
                                <h3 className="text-white font-black text-xl leading-tight shadow-black drop-shadow-md line-clamp-2">{quiz.title}</h3>
                                <p className="text-indigo-100 text-xs font-bold mt-1">by @{quiz.author}</p>
                             </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                                <span className="flex items-center gap-1"><Users size={14} /> {quiz.plays.toLocaleString()} plays</span>
                                <span className="flex items-center gap-1"><Heart size={14} className={likedQuizzes.includes(quiz.id) ? "fill-red-500 text-red-500" : ""} /> {quiz.likes + (likedQuizzes.includes(quiz.id) ? 1 : 0)}</span>
                            </div>
                            
                            <div className="mt-auto space-y-2">
                                <button 
                                    onClick={() => onPlayQuiz(quiz)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Play size={18} className="fill-current" /> Play Now
                                </button>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => toggleLike(quiz.id)}
                                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border ${
                                            likedQuizzes.includes(quiz.id) 
                                            ? 'bg-red-50 text-red-600 border-red-100' 
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <Heart size={18} className={likedQuizzes.includes(quiz.id) ? "fill-current" : ""} /> 
                                        {likedQuizzes.includes(quiz.id) ? 'Liked' : 'Like'}
                                    </button>
                                    <button 
                                        onClick={() => handleChallenge(quiz.title)}
                                        className="flex-1 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                    >
                                        <Share2 size={18} /> Challenge
                                    </button>
                                </div>
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
