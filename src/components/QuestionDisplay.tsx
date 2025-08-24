'use client';

import { useState, useEffect, useRef } from 'react';
import { Question } from '@/lib/gpt-ai';
import { CheckCircle, Clock, BookOpen, Timer, Flag, Grid3X3 } from 'lucide-react';
import QuestionModal from './QuestionModal';

interface QuestionDisplayProps {
  questions: Question[];
  currentQuestion: Question;
  onComplete: (answers: Record<number, string>, timeStats?: {
    questionTimes: Record<number, number>;
    totalTime: number;
    averageTime: number;
  }) => void;
  isLastSection?: boolean;
  totalSections?: number;
  currentSection?: number;
  onToggleFlag?: (questionId: number) => void;
  isFlagged?: (questionId: number) => boolean;

  existingAnswers?: Record<number, string>;
  onAnswerSelect: (questionId: number, answer: string) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLastQuestion: boolean;
  onGoToQuestion?: (questionId: number) => void;
  allQuestions?: Question[]; // Tüm section'ların soruları için
  onTimeUpdate?: (questionTimes: Record<number, number>, totalTime: number) => void; // Zaman güncellemesi için
}

export default function QuestionDisplay({ 
  questions,
  currentQuestion,
  onComplete, 
  isLastSection = true, 
  totalSections = 1, 
  currentSection = 1,
  onToggleFlag,
  isFlagged,
  existingAnswers = {},
  onAnswerSelect,
  onNext,
  onPrevious,
  isLastQuestion,
  onGoToQuestion,
  allQuestions,
  onTimeUpdate
}: QuestionDisplayProps) {
  const [showResults, setShowResults] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log('QuestionDisplay render edildi:');
  console.log('isLastSection:', isLastSection);
  console.log('totalSections:', totalSections);
  console.log('currentSection:', currentSection);
  console.log('questions count:', questions?.length);
  console.log('questions IDs:', questions?.map(q => q.id));

  // Timer states
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());

  // Timer effects
  useEffect(() => {
    // Save time for previous question when switching
    if (questionStartTimeRef.current > 0) {
      const timeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
      setQuestionTimes(prev => ({
        ...prev,
        [currentQuestion.id]: timeSpent
      }));
      setTotalTime(prev => prev + timeSpent);
    }

    // Start timer for current question
    questionStartTimeRef.current = Date.now();
    setTimeElapsed(0);
    
    intervalRef.current = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentQuestion.id]);

  useEffect(() => {
    // Cleanup timer when component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Notify parent about time updates
  useEffect(() => {
    onTimeUpdate?.(questionTimes, totalTime);
  }, [questionTimes, totalTime, onTimeUpdate]);

  // Current question güvenlik kontrolü
  if (!currentQuestion) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Question Not Loaded</h2>
          <p className="text-gray-600">No questions found. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: string) => {
    onAnswerSelect(currentQuestion.id, answer);
  };

  const handleNextWithTimer = () => {
    // Save time for the current question before proceeding
    const currentTimeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    const updatedQuestionTimes = {
      ...questionTimes,
      [currentQuestion.id]: currentTimeSpent
    };
    const updatedTotalTime = totalTime + currentTimeSpent;
    
    if (isLastQuestion) {
      // Clear the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Calculate final time stats
      const finalAverageTime = Object.keys(updatedQuestionTimes).length > 0 
        ? Math.round(Object.values(updatedQuestionTimes).reduce((a, b) => a + b, 0) / Object.keys(updatedQuestionTimes).length)
        : 0;
      
      // If it's the last section, showResults, otherwise only call onComplete
      if (isLastSection) {
        setShowResults(true);
      }
      
      onComplete(existingAnswers, {
        questionTimes: updatedQuestionTimes,
        totalTime: updatedTotalTime,
        averageTime: finalAverageTime
      });
    } else {
      // Update local state before moving to next question
      setQuestionTimes(updatedQuestionTimes);
      setTotalTime(updatedTotalTime);
      
      // Notify parent about time update
      onTimeUpdate?.(updatedQuestionTimes, updatedTotalTime);
      
      onNext();
    }
  };

  const handlePreviousWithTimer = () => {
    // Save time for the current question before proceeding
    const currentTimeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
    const updatedQuestionTimes = {
      ...questionTimes,
      [currentQuestion.id]: currentTimeSpent
    };
    const updatedTotalTime = totalTime + currentTimeSpent;
    
    // Update local state before moving to previous question
    setQuestionTimes(updatedQuestionTimes);
    setTotalTime(updatedTotalTime);
    
    // Notify parent about time update
    onTimeUpdate?.(updatedQuestionTimes, updatedTotalTime);
    
    onPrevious();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'medium': return 'Medium';
      case 'hard': return 'Hard';
      default: return difficulty;
    }
  };

  if (showResults) {
    const averageTime = questionTimes && Object.keys(questionTimes).length > 0 
      ? Math.round(Object.values(questionTimes).reduce((a, b) => a + b, 0) / Object.keys(questionTimes).length)
      : 0;
    
    return (
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              {isLastSection ? 'Exam Finished! 🎉' : 'Section Finished! ✅'}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            {isLastSection ? 'Evaluation in progress...' : `Next section loading... (${currentSection}/${totalSections})`}
          </p>
        </div>

        {/* Time Statistics */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Time Statistics
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Time */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-100">
              <div className="text-center">
                <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Time</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">{formatTime(totalTime)}</p>
              </div>
            </div>

            {/* Average Time per Question */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-green-100">
              <div className="text-center">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Average Time per Question</p>
                <p className="text-lg sm:text-xl font-bold text-green-600">{formatTime(averageTime)}</p>
              </div>
            </div>

            {/* Speed Rating */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-purple-100">
              <div className="text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 flex items-center justify-center">
                  {averageTime <= 60 ? '🚀' : averageTime <= 120 ? '⚡' : '🐌'}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Speed Evaluation</p>
                <p className="text-lg sm:text-xl font-bold text-purple-600">
                  {averageTime <= 60 ? 'Very Fast' : averageTime <= 120 ? 'Ideal' : 'Careful'}
                </p>
              </div>
            </div>
          </div>

          {/* Individual Question Times */}
          {questionTimes && Object.keys(questionTimes).length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm sm:text-md font-medium text-gray-700 mb-3">Question-Based Times:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(questionTimes).map(([questionId, time]) => (
                  <div key={questionId} className="bg-white rounded-lg p-2 text-center border border-gray-200">
                    <p className="text-xs text-gray-500">Question {questionId}</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-700">{formatTime(time || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      {/* Progress Bar with Timer */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
          <span className="text-sm font-medium text-gray-700">
              Question {questions.findIndex(q => q.id === currentQuestion.id) + 1} / {questions.length}
          </span>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 text-blue-600">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-mono font-semibold">
                {formatTime(timeElapsed)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {Math.round(((questions.findIndex(q => q.id === currentQuestion.id) + 1) / questions.length) * 100)}% completed
            </span>
          </div>
        </div>
        
        {/* Main Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((questions.findIndex(q => q.id === currentQuestion.id) + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Time Progress Bar (grows over 60 seconds) */}
        <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
          <div 
            className={`h-1 rounded-full transition-all duration-1000 ${
              timeElapsed <= 30 ? 'bg-green-500' : 
              timeElapsed <= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min((timeElapsed / 90) * 100, 100)}%`,
              transition: 'width 1s ease-out, background-color 0.5s ease'
            }}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1 gap-1">
          <span className="text-xs text-gray-400">
            Average time per question: {Object.keys(questionTimes).length > 0 
              ? formatTime(Math.round(Object.values(questionTimes).reduce((a, b) => a + b, 0) / Object.keys(questionTimes).length))
              : '0:00'
            }
          </span>
          <span className="text-xs text-gray-400">
            Total time: {formatTime(totalTime + timeElapsed)}
          </span>
        </div>
      </div>

      {/* Question Info with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(currentQuestion.difficulty || 'medium')}`}>
            {getDifficultyText(currentQuestion.difficulty || 'medium')}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">{currentQuestion.category || 'General'}</span>
          </div>
        </div>
        
        {/* Action Icons */}
        <div className="flex items-center gap-2">
          {/* Flag Button */}
          {onToggleFlag && isFlagged && (
            <button
              onClick={() => onToggleFlag(currentQuestion.id)}
              className={`p-2 rounded-lg transition-colors ${
                isFlagged(currentQuestion.id)
                  ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isFlagged(currentQuestion.id) ? 'Unmark for review' : 'Mark for review'}
            >
              <Flag className={`w-4 h-4 ${isFlagged(currentQuestion.id) ? 'fill-current' : ''}`} />
            </button>
          )}
          
          {/* Overview Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
            title="View all questions"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div className="mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">
          {currentQuestion.text}
        </h3>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6 sm:mb-8">
        {currentQuestion.options && currentQuestion.options.length > 0 ? (
          currentQuestion.options.map((option, index) => {
            const optionLetter = String.fromCharCode(65 + index); // A, B, C, D, E
            const isSelected = existingAnswers[currentQuestion.id] === optionLetter;
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(optionLetter)}
                className={`w-full p-3 sm:p-4 text-left border-2 rounded-lg transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500 text-white' 
                      : 'border-gray-300 text-gray-600'
                  }`}>
                    {optionLetter}
                  </div>
                  <span className="text-gray-800 text-sm sm:text-base">{option}</span>
                </div>
              </button>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No options found for this question.</p>
            <p className="text-sm mt-2">Checking question format...</p>
          </div>
        )}
      </div>

      {/* Flag Button and Navigation */}
      <div className="space-y-4">
        

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <button
            onClick={handlePreviousWithTimer}
            disabled={currentQuestion.id === questions[0]?.id}
            className="px-4 sm:px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            Previous
          </button>
        
          <button
            onClick={handleNextWithTimer}
            disabled={!existingAnswers[currentQuestion.id]}
            className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
          >
            {isLastQuestion ? (isLastSection ? 'Finish Exam' : 'Next Section') : 'Next'}
          </button>
        </div>
      </div>

      {/* Question Navigation */}
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {questions && questions.map((question, index) => {
            const isCurrentQuestion = question.id === currentQuestion.id;
            const isAnswered = !!existingAnswers[question.id];
            const isFlaggedQuestion = isFlagged ? isFlagged(question.id) : false;
            
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => {
                    if (onGoToQuestion) {
                      // Save time for current question before going to another question
                      const currentTimeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
                      const updatedQuestionTimes = {
                        ...questionTimes,
                        [currentQuestion.id]: currentTimeSpent
                      };
                      const updatedTotalTime = totalTime + currentTimeSpent;
                      
                      setQuestionTimes(updatedQuestionTimes);
                      setTotalTime(updatedTotalTime);
                      onTimeUpdate?.(updatedQuestionTimes, updatedTotalTime);
                      
                      onGoToQuestion(question.id);
                    } else {
                      onAnswerSelect(question.id, existingAnswers[question.id] || '');
                    }
                  }}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                    isCurrentQuestion
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${isFlaggedQuestion ? 'ring-2 ring-orange-400' : ''}`}
                >
                  {index + 1}
                </button>
                {/* Flag indicator */}
                {isFlaggedQuestion && (
                  <div className="absolute -top-1 -right-1">
                    <Flag className="w-3 h-3 text-orange-500 fill-current" />
                  </div>
                )}
                {/* Unanswered indicator */}
                {!isAnswered && !isCurrentQuestion && (
                  <div className="absolute -bottom-1 -right-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        
      </div>

      {/* Question Modal */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        questions={allQuestions || questions}
        currentQuestionId={currentQuestion.id}
        existingAnswers={existingAnswers}
        flaggedQuestions={isFlagged ? new Set((allQuestions || questions).filter(q => isFlagged(q.id)).map(q => q.id)) : new Set()}
        onGoToQuestion={(questionId: number) => {
          if (onGoToQuestion) {
            // Save time for current question before going to another question
            const currentTimeSpent = Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
            const updatedQuestionTimes = {
              ...questionTimes,
              [currentQuestion.id]: currentTimeSpent
            };
            const updatedTotalTime = totalTime + currentTimeSpent;
            
            setQuestionTimes(updatedQuestionTimes);
            setTotalTime(updatedTotalTime);
            onTimeUpdate?.(updatedQuestionTimes, updatedTotalTime);
            
            onGoToQuestion(questionId);
          }
        }}
        onToggleFlag={onToggleFlag}
      />
    </div>
  );
} 