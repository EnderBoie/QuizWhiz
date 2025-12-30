
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, Save, Trash2, Database, Shield, User as UserIcon, Mail, AlertTriangle, Check, Loader2, Download, Eye, EyeOff } from 'lucide-react';

interface SettingsPageProps {
  user: User;
  onBack: () => void;
  onUpdateProfile: (updates: Partial<User>) => void;
  onClearHistory: () => void;
  onDeleteAccount: () => void;
  onExportAll: () => void; // New prop
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
  user, onBack, onUpdateProfile, onClearHistory, onDeleteAccount, onExportAll 
}) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState(user.password || '');
  const [confirmPassword, setConfirmPassword] = useState(user.password || '');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [storageUsage, setStorageUsage] = useState<string>('0');

  useEffect(() => {
    calculateStorage();
  }, []);

  const calculateStorage = () => {
    let total = 0;
    for (let x in localStorage) {
        if (!localStorage.hasOwnProperty(x)) continue;
        total += ((localStorage[x].length + x.length) * 2);
    }
    // Convert to MB
    setStorageUsage((total / 1024 / 1024).toFixed(2));
  };

  const handleSave = () => {
    setMessage(null);
    
    if (!username.trim() || !email.trim()) {
        setMessage({ type: 'error', text: 'Username and Email are required.' });
        return;
    }

    if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
        return;
    }

    setIsSaving(true);
    
    // Simulate network delay for UX
    setTimeout(() => {
        try {
            onUpdateProfile({ username, email, password });
            setMessage({ type: 'success', text: 'Settings saved successfully!' });
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to save settings.' });
        } finally {
            setIsSaving(false);
        }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50">
       <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-3 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <h1 className="text-2xl font-black text-slate-800">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        
        {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
                {message.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
                <span className="font-bold">{message.text}</span>
            </div>
        )}

        {/* Profile Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <UserIcon size={24} className="text-violet-500" />
                Profile Information
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-white font-medium"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:bg-white font-medium"
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* Security Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Shield size={24} className="text-indigo-500" />
                Security
            </h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full px-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                    <div className="relative">
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full px-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-3 text-slate-400 hover:text-indigo-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Changes
        </button>

        {/* Storage Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 mt-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Database size={24} className="text-blue-500" />
                Data & Storage
            </h2>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-slate-600">Storage Used</span>
                    <span className="text-2xl font-black text-slate-800">{storageUsage} <span className="text-sm text-slate-500 font-medium">MB</span></span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${Number(storageUsage) > 4 ? 'bg-red-500' : Number(storageUsage) > 2.5 ? 'bg-yellow-500' : 'bg-blue-500'}`} 
                        style={{ width: `${Math.min((Number(storageUsage) / 5) * 100, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-slate-400 mt-2">Browser local storage is limited to ~5MB. If it gets full, you won't be able to save new quizzes.</p>
            </div>
            
            <div className="space-y-3">
                 <button 
                    onClick={onExportAll}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <Download size={20} />
                    Export All Quizzes (ZIP)
                </button>

                <button 
                    onClick={() => {
                        if(window.confirm("Clear quiz history? This will delete your past results but keep your quizzes and stats.")) {
                            onClearHistory();
                            calculateStorage();
                            setMessage({ type: 'success', text: 'History cleared!' });
                        }
                    }}
                    className="w-full border-2 border-slate-200 hover:bg-slate-50 text-slate-600 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    <Database size={18} />
                    Clear Quiz History
                </button>
            </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-red-50 rounded-3xl p-6 sm:p-8 border border-red-100 mt-8">
            <h2 className="text-xl font-bold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle size={24} />
                Danger Zone
            </h2>
            <p className="text-red-600 mb-6">Once you delete your account, there is no going back. All your quizzes and data will be permanently removed.</p>
            
            <button 
                onClick={() => {
                    if (window.confirm("Are you sure? This will delete your account and all your quizzes permanently. This cannot be undone.")) {
                        onDeleteAccount();
                    }
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-red-200"
            >
                <Trash2 size={20} />
                Delete Account
            </button>
        </section>

      </div>
    </div>
  );
};
