import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, Hash, BarChart } from 'lucide-react';
import { Question } from '../types';

interface AIQuizModalProps {
  onGenerate: (questions: Question[], title: string) => void;
  onClose: () => void;
}

export const AIQuizModal: React.FC<AIQuizModalProps> = ({ onGenerate, onClose }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsGenerating(true);

    try {
      // Dynamically import to prevent top-level await/load issues
      const { GoogleGenAI, Type } = await import("@google/genai");

      // Use the API key injected into process.env in index.html
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `Generate a quiz about "${topic}".
      Difficulty: ${difficulty}.
      Number of questions: ${count}.
      Provide a catchy title for the quiz.
      For each question, provide 4 options and the index of the correct answer (0-3).
      Set a reasonable time limit (in seconds) for each question.
      Include a mix of interesting facts.`;

      // gemini-3-flash-preview is efficient and suitable for basic text tasks
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              quizTitle: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.INTEGER },
                    timeLimit: { type: Type.INTEGER },
                    image: { type: Type.STRING } // Optional placeholder
                  },
                  required: ["question", "options", "correctAnswer", "timeLimit"]
                }
              }
            }
          }
        }
      });

      const json = JSON.parse(response.text || "{}");
      
      if (json.questions && json.questions.length > 0) {
        // Transform to match our Question type
        const formattedQuestions: Question[] = json.questions.map((q: any) => ({
          question: q.question,
          image: '', // AI text model doesn't generate images easily in same pass without complexity
          type: 'multiple-choice',
          options: q.options.slice(0, 4), // Ensure 4 options
          correctAnswer: q.correctAnswer,
          timeLimit: q.timeLimit || 20
        }));

        onGenerate(formattedQuestions, json.quizTitle || `Quiz: ${topic}`);
        onClose();
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Failed to generate quiz. Please check your API key or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sparkles size={20} />
            AI Quiz Generator
          </div>
          <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 rounded p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen size={16} className="text-blue-600" />
              What is the quiz about?
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Space Exploration, 1980s Music, JavaScript"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Hash size={16} className="text-blue-600" />
                Questions
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <BarChart size={16} className="text-blue-600" />
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70"
          >
            {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
            {isGenerating ? 'Dreaming up questions...' : 'Generate Magic Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
};