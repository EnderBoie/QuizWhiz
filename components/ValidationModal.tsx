import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationModalProps {
  errors: string[];
  onClose: () => void;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({ errors, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle size={32} />
          <h3 className="text-2xl font-bold">Action Required</h3>
        </div>
        
        <p className="text-gray-700 mb-4 font-medium">Please address the following items before saving:</p>
        
        <ul className="space-y-2 mb-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {errors.map((error, index) => (
            <li key={index} className="flex items-start gap-2 text-gray-600 bg-red-50 p-3 rounded-lg text-sm font-medium">
              <span className="text-red-500 mt-0.5">•</span>
              <span>{error.replace(/^• /, '')}</span>
            </li>
          ))}
        </ul>
        
        <button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg hover:shadow-xl"
        >
          I'll Fix It
        </button>
      </div>
    </div>
  );
};