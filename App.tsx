
import React, { useState, useEffect } from 'react';
import { Quiz, QuizResult, User, UserStats } from './types';
import { QuizHome } from './components/QuizHome';
import { QuizCreator } from './components/QuizCreator';
import { QuizTaker } from './components/QuizTaker';
import { QuizResults } from './components/QuizResults';
import { FlashcardViewer } from './components/FlashcardViewer';
import { AchievementsPage } from './components/AchievementsPage';
import { HistoryPage } from './components/HistoryPage';
import { FocusMode } from './components/FocusMode';
import { SettingsPage } from './components/SettingsPage';
import { CommunityPage } from './components/CommunityPage'; // New Component
import { Auth } from './components/Auth';
import { ACHIEVEMENTS } from './constants';
import { NotificationToast } from './components/NotificationToast';
import { exportQuizToQZX, exportAllQuizzesToZip } from './services/exportService';

type ViewState = 'home' | 'create' | 'take' | 'results' | 'study' | 'achievements' | 'history' | 'focus' | 'settings' | 'community';

const DEFAULT_STATS: UserStats = {
  quizzesCreated: 0,
  quizzesPlayed: 0,
  questionsAnswered: 0,
  perfectScores: 0,
  studySessions: 0,
  aiQuizzesGenerated: 0,
  aiImagesGenerated: 0
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('home');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [lastResult, setLastResult] = useState<QuizResult | null>(null);
  const [startTutorial, setStartTutorial] = useState(false);
  
  // Notification State
  const [notification, setNotification] = useState<{title: string, message: string} | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Load user and quizzes from local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('quizmaster_current_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure stats and achievements exist for legacy users
      if (!parsedUser.stats) parsedUser.stats = { ...DEFAULT_STATS };
      if (!parsedUser.achievements) parsedUser.achievements = [];
      if (!parsedUser.history) parsedUser.history = [];
      setUser(parsedUser);
    }

    const storedQuizzes = localStorage.getItem('quizmaster_quizzes');
    if (storedQuizzes) {
      setQuizzes(JSON.parse(storedQuizzes));
    }
  }, []);

  const persistUser = (updatedUser: User) => {
    setUser(updatedUser);
    try {
        localStorage.setItem('quizmaster_current_user', JSON.stringify(updatedUser));
        
        // Update main user list
        const users = JSON.parse(localStorage.getItem('quizmaster_users') || '[]');
        const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
        localStorage.setItem('quizmaster_users', JSON.stringify(updatedUsers));
    } catch (error: any) {
        console.error("Storage failed:", error);
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            showAchievementNotification("⚠️ Storage Full", "Progress not saved! Storage limit reached. Clear History in Settings.");
        }
    }
  };

  const showAchievementNotification = (title: string, message: string) => {
    setNotification({ title, message });
    setShowNotification(true);
  };

  const checkAchievements = (currentUser: User) => {
    let newUnlocks = false;
    const updatedAchievements = [...currentUser.achievements];

    ACHIEVEMENTS.forEach(ach => {
      if (!updatedAchievements.includes(ach.id) && ach.condition(currentUser.stats)) {
        updatedAchievements.push(ach.id);
        newUnlocks = true;
        showAchievementNotification(ach.title, ach.description);
      }
    });

    if (newUnlocks) {
      const updatedUser = { ...currentUser, achievements: updatedAchievements };
      persistUser(updatedUser);
    }
  };

  const handleStatUpdate = (type: 'create' | 'play' | 'study' | 'ai_img' | 'ai_quiz', count: number = 1) => {
    if (!user) return;
    const newStats = { ...user.stats };
    
    if (type === 'create') newStats.quizzesCreated += count;
    if (type === 'play') newStats.quizzesPlayed += count;
    if (type === 'study') newStats.studySessions += count;
    if (type === 'ai_img') newStats.aiImagesGenerated += count;
    if (type === 'ai_quiz') newStats.aiQuizzesGenerated += count;

    const updatedUser = { ...user, stats: newStats };
    persistUser(updatedUser);
    checkAchievements(updatedUser);
  };

  const handleLogin = (loggedInUser: User) => {
    // Ensure stats/achievements for fresh login
    const safeUser = {
        ...loggedInUser,
        stats: loggedInUser.stats || { ...DEFAULT_STATS },
        achievements: loggedInUser.achievements || [],
        history: loggedInUser.history || []
    };
    persistUser(safeUser);
    
    // Removed automatic redirect to 'create' and tutorial trigger.
    // User will stay on 'home' view (default state).
  };

  const handleTutorialComplete = () => {
    if (user && user.hasSeenTutorial === false) {
      const updatedUser = { ...user, hasSeenTutorial: true };
      persistUser(updatedUser);
    }
    setStartTutorial(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('quizmaster_current_user');
    setView('home');
    setEditingQuiz(null);
    setActiveQuiz(null);
    setStartTutorial(false);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setView('take');
  };

  const handleStartStudy = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    handleStatUpdate('study');
    setView('study');
  };

  const handleCreateNew = () => {
    setEditingQuiz(null);
    
    // Check if this is the user's first time creating a quiz
    if (user && user.hasSeenTutorial === false) {
        setStartTutorial(true);
    } else {
        setStartTutorial(false);
    }
    
    setView('create');
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setStartTutorial(false);
    setView('create');
  };

  const handleDeleteQuiz = (id: number) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      const updatedQuizzes = quizzes.filter(q => q.id !== id);
      setQuizzes(updatedQuizzes);
      try {
        localStorage.setItem('quizmaster_quizzes', JSON.stringify(updatedQuizzes));
      } catch (error) {
        console.error("Failed to sync delete to storage", error);
      }
    }
  };

  const handleSaveQuiz = (savedQuiz: Quiz) => {
    let updatedQuizzes;
    if (editingQuiz) {
      updatedQuizzes = quizzes.map(q => q.id === savedQuiz.id ? savedQuiz : q);
    } else {
      updatedQuizzes = [...quizzes, savedQuiz];
    }
    
    try {
        localStorage.setItem('quizmaster_quizzes', JSON.stringify(updatedQuizzes));
        setQuizzes(updatedQuizzes);
        setEditingQuiz(null);
        setView('home');
    } catch (error: any) {
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            alert("Storage Full! 💾\n\nWe couldn't save this quiz because your browser storage is full.\n\nGo to Settings > Storage to clear old history and free up space.");
        } else {
            alert("Failed to save quiz: " + error.message);
        }
    }
  };

  const handleQuizComplete = (answers: (number | string | number[])[], score: number) => {
    if (activeQuiz && user) {
      const result: QuizResult = {
          id: Date.now().toString(),
          quizId: activeQuiz.id,
          quizTitle: activeQuiz.title,
          date: new Date().toISOString(),
          score: score,
          totalQuestions: activeQuiz.questions.length,
          answers: answers
      };

      setLastResult(result);
      
      // Calculate new stats
      const newStats = { ...user.stats };
      newStats.quizzesPlayed += 1;
      newStats.questionsAnswered += activeQuiz.questions.length;
      if (score === activeQuiz.questions.length) {
          newStats.perfectScores += 1;
      }

      // Update User History AND Stats in one operation to avoid stale state issues
      const updatedHistory = [...(user.history || []), result];
      const updatedUser = { 
          ...user, 
          history: updatedHistory,
          stats: newStats
      };
      
      persistUser(updatedUser);
      checkAchievements(updatedUser);

      setView('results');
    }
  };

  const handlePlayAgain = () => {
    if (lastResult) {
        // Find fresh copy of quiz in case it was modified
       const freshQuiz = quizzes.find(q => q.id === lastResult.quizId) || activeQuiz;
       if (freshQuiz) {
            setActiveQuiz(freshQuiz);
            setView('take');
       }
    }
  };

  const handleViewTutorial = () => {
    setEditingQuiz(null);
    setStartTutorial(true);
    setView('create');
  }

  // Settings Handlers
  const handleUpdateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    persistUser(updatedUser);
  };

  const handleClearHistory = () => {
    if (!user) return;
    const updatedUser = { ...user, history: [] };
    persistUser(updatedUser);
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    
    // Delete user's quizzes
    const allQuizzes = JSON.parse(localStorage.getItem('quizmaster_quizzes') || '[]');
    const remainingQuizzes = allQuizzes.filter((q: Quiz) => q.userId !== user.id);
    localStorage.setItem('quizmaster_quizzes', JSON.stringify(remainingQuizzes));

    // Delete user from users list
    const users = JSON.parse(localStorage.getItem('quizmaster_users') || '[]');
    const remainingUsers = users.filter((u: User) => u.id !== user.id);
    localStorage.setItem('quizmaster_users', JSON.stringify(remainingUsers));

    handleLogout();
  };
  
  // Export Handlers
  const handleExportQuiz = (quiz: Quiz) => {
    exportQuizToQZX(quiz);
  };
  
  const handleExportAll = () => {
    // Only export the current user's quizzes
    if(user) {
        const userQuizzes = quizzes.filter(q => q.userId === user.id);
        if(userQuizzes.length > 0) {
            exportAllQuizzesToZip(userQuizzes);
        } else {
            alert("No quizzes to export!");
        }
    }
  };

  const handleImportQuiz = (file: File) => {
    if (!user) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const importedQuiz = JSON.parse(content) as Quiz;
            
            // Basic validation
            if (!importedQuiz.title || !Array.isArray(importedQuiz.questions)) {
                throw new Error("Invalid file format");
            }
            
            // Assign new ID to avoid collisions and set owner to current user
            const newQuiz = {
                ...importedQuiz,
                id: Date.now(),
                userId: user.id,
                title: importedQuiz.title + ' (Imported)'
            };
            
            const updatedQuizzes = [...quizzes, newQuiz];
            localStorage.setItem('quizmaster_quizzes', JSON.stringify(updatedQuizzes));
            setQuizzes(updatedQuizzes);
            
            showAchievementNotification("Quiz Imported!", `Successfully added "${newQuiz.title}"`);
        } catch (error) {
            console.error(error);
            alert("Failed to import quiz. The file might be corrupted or invalid.");
        }
    };
    reader.readAsText(file);
  };


  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // Filter quizzes for the logged-in user
  const userQuizzes = quizzes.filter(q => q.userId === user.id);

  return (
    <>
      <NotificationToast 
        title={notification?.title || ''} 
        message={notification?.message || ''} 
        isVisible={showNotification} 
        onClose={() => setShowNotification(false)} 
      />

      {view === 'home' && (
        <QuizHome
          quizzes={userQuizzes}
          user={user}
          onStartQuiz={handleStartQuiz}
          onStartStudy={handleStartStudy}
          onCreateNew={handleCreateNew}
          onEditQuiz={handleEditQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          onViewTutorial={handleViewTutorial}
          onLogout={handleLogout}
          onViewAchievements={() => setView('achievements')}
          onViewHistory={() => setView('history')}
          onStartFocus={() => setView('focus')}
          onViewSettings={() => setView('settings')}
          onExportQuiz={handleExportQuiz}
          onImportQuiz={handleImportQuiz}
          onViewCommunity={() => setView('community')}
        />
      )}

      {view === 'create' && (
        <QuizCreator
          initialQuiz={editingQuiz}
          currentUser={user}
          onSave={handleSaveQuiz}
          onExit={() => setView('home')}
          startWithTutorial={startTutorial}
          onTutorialComplete={handleTutorialComplete}
          onStatUpdate={handleStatUpdate}
        />
      )}

      {view === 'take' && activeQuiz && (
        <QuizTaker
          quiz={activeQuiz}
          onComplete={handleQuizComplete}
          onExit={() => setView('home')}
        />
      )}

      {view === 'study' && activeQuiz && (
        <FlashcardViewer
          quiz={activeQuiz}
          onExit={() => setView('home')}
        />
      )}

      {view === 'results' && lastResult && activeQuiz && (
        <QuizResults
          quiz={activeQuiz}
          userAnswers={lastResult.answers}
          score={lastResult.score}
          onPlayAgain={handlePlayAgain}
          onHome={() => setView('home')}
        />
      )}

      {view === 'achievements' && (
          <AchievementsPage user={user} onBack={() => setView('home')} />
      )}

      {view === 'history' && (
          <HistoryPage user={user} onBack={() => setView('home')} />
      )}

      {view === 'focus' && (
          <FocusMode 
            user={user} 
            quizzes={quizzes} 
            onBack={() => setView('home')} 
            onStartQuiz={handleStartQuiz}
          />
      )}

      {view === 'settings' && user && (
          <SettingsPage 
            user={user} 
            onBack={() => setView('home')} 
            onUpdateProfile={handleUpdateUser}
            onClearHistory={handleClearHistory}
            onDeleteAccount={handleDeleteAccount}
            onExportAll={handleExportAll}
          />
      )}

      {view === 'community' && (
          <CommunityPage 
            user={user} 
            onBack={() => setView('home')} 
            onPlayQuiz={handleStartQuiz}
          />
      )}
    </>
  );
}
