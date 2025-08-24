'use client';

import { useState, useEffect } from 'react';
import { Question } from '@/lib/gpt-ai';
import { X, Flag, CheckCircle, XCircle, Grid3X3 } from 'lucide-react';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: Question[];
  currentQuestionId: number;
  existingAnswers: Record<number, string>;
  flaggedQuestions: Set<number>;
  onGoToQuestion: (questionId: number) => void;
  onToggleFlag?: (questionId: number) => void;
}

export default function QuestionModal({
  isOpen,
  onClose,
  questions,
  currentQuestionId,
  existingAnswers,
  flaggedQuestions,
  onGoToQuestion,
  onToggleFlag
}: QuestionModalProps) {
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered' | 'flagged'>('all');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleGoToQuestion = (questionId: number) => {
    onGoToQuestion(questionId);
    onClose();
  };

  const getQuestionStats = () => {
    const total = questions.length;
    const answered = questions.filter(q => existingAnswers[q.id]).length;
    const unanswered = total - answered;
    const flagged = questions.filter(q => flaggedQuestions.has(q.id)).length;
    return { total, answered, unanswered, flagged };
  };

  const getFilteredQuestions = () => {
    switch (filter) {
      case 'answered':
        return questions.filter(q => existingAnswers[q.id]);
      case 'unanswered':
        return questions.filter(q => !existingAnswers[q.id]);
      case 'flagged':
        return questions.filter(q => flaggedQuestions.has(q.id));
      default:
        return questions;
    }
  };

  const getSectionFromId = (questionId: number) => {
    return Math.floor(questionId / 100);
  };

  const getQuestionNumberFromId = (questionId: number) => {
    return questionId % 100;
  };

  const stats = getQuestionStats();
  const filteredQuestions = getFilteredQuestions();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Simple Header */}
        <div className="bg-white border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Grid3X3 className="w-5 h-5 text-green-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Questions Overview</h2>
                <p className="text-sm text-gray-600">
                  {stats.answered} of {stats.total} completed
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Simple Filter */}
        <div className="border-b px-4 py-3">
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'All', count: stats.total },
              { key: 'answered', label: 'Answered', count: stats.answered },
              { key: 'unanswered', label: 'Unanswered', count: stats.unanswered },
              { key: 'flagged', label: 'Flagged', count: stats.flagged },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'answered' | 'unanswered' | 'flagged')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  filter === tab.key
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Questions Grid */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredQuestions.map((question) => {
              const isAnswered = !!existingAnswers[question.id];
              const isFlagged = flaggedQuestions.has(question.id);
              const isCurrent = question.id === currentQuestionId;
              const section = getSectionFromId(question.id);
              const questionNum = getQuestionNumberFromId(question.id);
              const userAnswer = existingAnswers[question.id];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div
                  key={question.id}
                  className={`relative p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 group ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50'
                      : isAnswered
                        ? isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white'
                  } ${isFlagged ? 'ring-1 ring-orange-300' : ''}`}
                  onClick={() => handleGoToQuestion(question.id)}
                >
                  {/* Question Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        S{section} Q{questionNum}
                      </span>
                      {isCurrent && (
                        <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded text-xs">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {isFlagged && (
                        <Flag className="w-3 h-3 text-orange-500 fill-current" />
                      )}
                      {isAnswered ? (
                        <CheckCircle className={`w-4 h-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`} />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Answer Info */}
                  {isAnswered ? (
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Your:</span>
                        <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {userAnswer}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Correct:</span>
                        <span className="font-medium text-green-600">
                          {question.correctAnswer}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic">Not answered</div>
                  )}

                  {/* Quick Flag Toggle */}
                  {!isFlagged && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFlag?.(question.id);
                      }}
                      className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-orange-100 rounded"
                    >
                      <Flag className="w-3 h-3 text-gray-400 hover:text-orange-600" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <Grid3X3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">
                {filter === 'answered' && 'No questions answered yet.'}
                {filter === 'unanswered' && 'All questions answered!'}
                {filter === 'flagged' && 'No questions flagged.'}
              </p>
            </div>
          )}
        </div>

        {/* Simple Footer */}
        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {filteredQuestions.length} of {stats.total} questions
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}