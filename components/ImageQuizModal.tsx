import React, { useState } from 'react';
import { X, Upload, Sparkles, Loader2, Image as ImageIcon, BarChart, Hash, AlertCircle } from 'lucide-react';
import { Question } from '../types';
import { generateQuizFromImage, generateImageForQuestion } from '../services/genAI';
import { compressImage } from '../services/imageUtils';

interface ImageQuizModalProps {
  onGenerate: (questions: Question[], title: string) => void;
  onClose: () => void;
  onAiUsed: () => void;
}

export const ImageQuizModal: React.FC<ImageQuizModalProps> = ({ onGenerate, onClose, onAiUsed }) => {
  const [image, setImage] = useState<string | null>(null);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [autoImages, setAutoImages] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic validation
      if (file.size > 8 * 1024 * 1024) { // Increased to 8MB since we compress
        setError("Image size too large. Please use an image under 8MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
            const compressed = await compressImage(rawBase64);
            setImage(compressed);
            setError(null);
        } catch (e) {
            console.error("Compression failed", e);
            setImage(rawBase64); // Fallback
            setError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    setIsGenerating(true);
    setLoadingStatus('Analyzing image and questions...');
    setError(null);

    try {
      const result = await generateQuizFromImage(image, difficulty, count);
      
      let finalQuestions = result.questions;

      if (autoImages) {
        setLoadingStatus(`Creating visuals (0/${result.questions.length})...`);
        
        // Process images
        finalQuestions = await Promise.all(result.questions.map(async (q, idx) => {
            try {
                // Add a small delay
                await new Promise(r => setTimeout(r, idx * 500)); 
                const imageUrl = await generateImageForQuestion(q.question);
                if (imageUrl) {
                    const compressedUrl = await compressImage(imageUrl);
                    setLoadingStatus(prev => {
                        return prev.replace(/\(\d+\//, `(${idx + 1}/`);
                    });
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
      onGenerate(finalQuestions, result.title);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze image. Please try a clearer image or check your connection.");
    } finally {
      setIsGenerating(false);
      setLoadingStatus('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <ImageIcon size={24} className="text-white" />
            </div>
            <div>
                <h2 className="font-black text-xl leading-none">Image to Quiz</h2>
                <p className="text-pink-100 text-xs mt-1 font-medium">Upload a photo, get a quiz.</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-2 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Image Upload Area */}
          <div className="relative group">
            {image ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-slate-200 h-64 bg-slate-50">
                    <img src={image} alt="Upload" className="w-full h-full object-contain" />
                    <button 
                        onClick={() => setImage(null)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-lg transition-transform hover:scale-105"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center h-64 border-3 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all duration-300 group">
                    <div className="bg-slate-100 group-hover:bg-white p-4 rounded-full mb-4 transition-colors">
                        <Upload size={32} className="text-slate-400 group-hover:text-pink-500" />
                    </div>
                    <p className="font-bold text-slate-600 text-lg group-hover:text-pink-600">Click to Upload Image</p>
                    <p className="text-slate-400 text-sm mt-1">Diagrams, notes, or slides work best</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
            )}
          </div>

          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Hash size={14} /> Questions
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-bold text-slate-700 transition-colors"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <BarChart size={14} /> Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-pink-500 font-bold text-slate-700 transition-colors"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="bg-pink-200 p-2 rounded-lg text-pink-700">
                    <ImageIcon size={18} />
                </div>
                <div>
                    <div className="font-bold text-pink-900 text-sm">Auto-Generate Visuals</div>
                    <div className="text-pink-600 text-xs">Create unique images for each question</div>
                </div>
             </div>
             <button
                onClick={() => setAutoImages(!autoImages)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                    autoImages ? 'bg-pink-600' : 'bg-gray-300'
                }`}
            >
                <div 
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${
                        autoImages ? 'translate-x-6' : 'translate-x-0'
                    }`} 
                />
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !image}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0"
          >
            {isGenerating ? (
                <>
                    <Loader2 className="animate-spin" />
                    {loadingStatus || 'Analyzing Image...'}
                </>
            ) : (
                <>
                    <Sparkles size={20} className="text-yellow-300" />
                    Generate Quiz
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};