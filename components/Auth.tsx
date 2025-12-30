
import React, { useState } from 'react';
import { User } from '../types';
import { Lock, User as UserIcon, LogIn, UserPlus, Mail, KeyRound, ArrowLeft, Send, Eye, EyeOff } from 'lucide-react';
import { Logo } from './Logo';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState(''); // For login (username or email)
  const [showPassword, setShowPassword] = useState(false);
  
  // Reset Flow State
  const [resetCode, setResetCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearErrors = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    const users = JSON.parse(localStorage.getItem('quizmaster_users') || '[]');
    const user = users.find((u: any) => 
      (u.username === identifier || u.email === identifier) && u.password === password
    );

    if (user) {
      // In case stats are missing from legacy users in localStorage, App.tsx handles the merge,
      // but strictly speaking we pass 'any' here effectively.
      const safeUser = { ...user, hasSeenTutorial: user.hasSeenTutorial ?? true }; 
      onLogin(safeUser);
    } else {
      setError('Invalid username/email or password');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const users = JSON.parse(localStorage.getItem('quizmaster_users') || '[]');

    if (users.find((u: any) => u.username === username)) {
      setError('Username already taken');
      return;
    }
    if (users.find((u: any) => u.email === email)) {
      setError('Email already registered');
      return;
    }

    const newUser = { 
      id: Date.now().toString() + Math.random() * 1000, 
      username, 
      email,
      password,
      hasSeenTutorial: false,
      stats: {
        quizzesCreated: 0,
        quizzesPlayed: 0,
        questionsAnswered: 0,
        perfectScores: 0,
        studySessions: 0,
        aiQuizzesGenerated: 0,
        aiImagesGenerated: 0
      },
      achievements: [],
      history: []
    };
    
    localStorage.setItem('quizmaster_users', JSON.stringify([...users, newUser]));
    onLogin(newUser);
  };

  const handleForgotRequest = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const users = JSON.parse(localStorage.getItem('quizmaster_users') || '[]');
    const user = users.find((u: any) => u.email === resetEmail);

    if (!user) {
      // For UX we show error, in production consider vague message
      setError('No account found with this email');
      return;
    }

    // Generate random 6 digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    
    // Simulate Email Sending
    setTimeout(() => {
      alert(`[Simulation] Email sent to ${resetEmail}.\n\nYour Password Reset Code is: ${code}`);
      setSuccessMsg('Reset code sent! Check your "email" (the alert you just saw).');
      setMode('reset');
    }, 500);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (resetCode !== generatedCode) {
      setError('Invalid reset code');
      return;
    }

    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    const users = JSON.parse(localStorage.getItem('quizmaster_users') || '[]');
    const updatedUsers = users.map((u: any) => {
      if (u.email === resetEmail) {
        return { ...u, password: password };
      }
      return u;
    });

    localStorage.setItem('quizmaster_users', JSON.stringify(updatedUsers));
    
    setSuccessMsg('Password reset successfully! Please log in.');
    setMode('login');
    setIdentifier(resetEmail);
    setPassword('');
    // Reset temporary state
    setResetCode('');
    setGeneratedCode(null);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    clearErrors();
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-violet-900 to-slate-900 flex items-center justify-center p-4">
      {/* Abstract Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse delay-1000"></div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 max-w-md w-full animate-in fade-in zoom-in duration-300 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo variant="large" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">QuizWhiz</h1>
          <p className="text-slate-500 font-medium">
            {mode === 'login' && 'Welcome back, Whiz!'}
            {mode === 'signup' && 'Join the quiz revolution'}
            {mode === 'forgot' && 'Account Recovery'}
            {mode === 'reset' && 'Set New Password'}
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-600 p-4 mb-6 rounded-r-xl text-sm font-bold flex items-start gap-2 animate-in slide-in-from-top-2" role="alert">
            <AlertIcon />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-600 p-4 mb-6 rounded-r-xl text-sm font-bold flex items-start gap-2 animate-in slide-in-from-top-2" role="alert">
            <CheckIcon />
            <span>{successMsg}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username or Email</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-violet-600 focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter username or email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                <button 
                  type="button" 
                  onClick={() => switchMode('forgot')}
                  className="text-xs font-bold text-violet-600 hover:text-violet-800"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-100 rounded-xl focus:border-violet-600 focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-violet-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-violet-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <LogIn size={20} />
              Log In
            </button>

            <div className="text-center pt-6 border-t border-slate-100 mt-6">
              <p className="text-slate-500 text-sm mb-2">New to QuizWhiz?</p>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className="text-violet-600 hover:text-violet-800 font-bold transition-colors"
              >
                Create an account
              </button>
            </div>
          </form>
        )}

        {/* SIGNUP FORM */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-violet-600 focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-violet-600 focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-100 rounded-xl focus:border-violet-600 focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-violet-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-fuchsia-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <UserPlus size={20} />
              Sign Up
            </button>

            <div className="text-center pt-6 border-t border-slate-100 mt-6">
              <p className="text-slate-500 text-sm mb-2">Already have an account?</p>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-violet-600 hover:text-violet-800 font-bold transition-colors"
              >
                Log in here
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotRequest} className="space-y-5">
            <p className="text-slate-600 text-sm mb-4">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-violet-600 focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter your registered email"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-violet-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Send size={18} />
              Send Reset Code
            </button>

            <div className="text-center pt-4 mt-2">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-slate-500 hover:text-slate-700 font-bold transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-5">
             <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm mb-4">
                We sent a code to <b>{resetEmail}</b>. Check the browser alert if you missed it!
             </div>

             <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Reset Code</label>
              <div className="relative group">
                <KeyRound className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-100 rounded-xl focus:border-violet-600 focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 border-2 border-slate-100 rounded-xl focus:border-violet-600 focus:outline-none transition-all font-medium bg-slate-50 focus:bg-white focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-violet-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-green-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <UserIcon size={20} />
              Change Password
            </button>

             <div className="text-center pt-4 mt-2">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="text-slate-500 hover:text-slate-700 font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
