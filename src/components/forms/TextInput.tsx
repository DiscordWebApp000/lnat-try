'use client';

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface TextInputProps {
  onGenerate: (text: string, questionCount: number) => void;
  isLoading: boolean;
}

export default function TextInput({ onGenerate, isLoading }: TextInputProps) {
  const [text, setText] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && questionCount > 0) {
      onGenerate(text.trim(), questionCount);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Text Input</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Text
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste text to generate LNAT questions..."
            className="w-full h-40 sm:h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-black text-sm sm:text-base"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-2">
            Question Count
          </label>
          <select
            id="questionCount"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm sm:text-base"
            disabled={isLoading}
          >
            <option value={5}>5 Question</option>
            <option value={10}>10 Question</option>
            <option value={15}>15 Question</option>
            <option value={20}>20 Question</option>
            <option value={25}>25 Question</option>
            <option value={30}>30 Question</option>
            <option value={35}>35 Question</option>
            <option value={40}>40 Question</option>
            <option value={45}>45 Question</option>
            <option value={50}>50 Question</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Questions are being generated...
            </>
          ) : (
            'Generate Questions'
          )}
        </button>
      </form>

      {text && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Text Length:</strong> {text.length} characters
          </p>
          <p className="text-sm text-gray-600">
            <strong>Estimated Time:</strong> {Math.ceil(text.length / 100) + questionCount * 2} minutes
          </p>
        </div>
      )}
    </div>
  );
} 