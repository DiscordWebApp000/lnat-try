'use client';

import { useState, useCallback } from 'react';
import { Question, EvaluationResult, openaiAI } from '@/lib/gpt-ai';
import TextInput from '@/components/forms/TextInput';
import QuestionDisplay from '@/components/ui/QuestionDisplay';
import EvaluationResults from '@/components/ui/EvaluationResults';
import { Brain, AlertCircle, RefreshCw, Lock } from 'lucide-react';
import { PulseLoader, ClipLoader, RingLoader } from 'react-spinners';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { saveExamResult } from '@/store/slices/examResultsSlice';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { ToolAccessGuard } from '@/components/ui/ToolAccessGuard';

type AppState = 'input' | 'questions' | 'evaluation' | 'error';

export default function SoruUretici() {
  return (
    <ToolAccessGuard toolName="question-generator">
      <SoruUreticiContent />
    </ToolAccessGuard>
  );
}

function SoruUreticiContent() {
  const { currentUser, loading } = useAuth();
  const dispatch = useAppDispatch();
  
  const [appState, setAppState] = useState<AppState>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeStats, setTimeStats] = useState<{questionTimes: Record<number, number>; totalTime: number; averageTime: number} | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [originalText, setOriginalText] = useState<string>('');

  const handleTimeUpdate = useCallback(() => {
    // Time stats are handled in the parent component
  }, []);

  // Yetki kontrolü - loading veya yetki yoksa erken return
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-4">You need to login to use this tool.</p>
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
            Login →
          </Link>
        </div>
      </div>
    );
  }


  const handleGenerateQuestions = async (text: string, questionCount: number) => {
    setIsLoading(true);
    setLoadingMessage('AI is generating questions...');
    setErrorMessage('');
    setAppState('input');
    
    try {
      const result = await openaiAI.generateQuestions(text, questionCount);
      const allQuestions = result.sections.flatMap(section => section.questions);
      setQuestions(allQuestions);
      setOriginalText(text); // Store the original text
      setCurrentQuestionIndex(0); // Reset to first question
      setAppState('questions');
    } catch (error: unknown) {
      console.error('Question generation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while generating questions. Please try again.');
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteQuiz = async (userAnswers: Record<number, string>, timeStatsData?: {questionTimes: Record<number, number>; totalTime: number; averageTime: number}) => {
    console.log('=== QUIZ COMPLETION STARTED ===');
    console.log('handleCompleteQuiz called with userAnswers:', userAnswers);
    console.log('Questions:', questions);
    console.log('TimeStatsData:', timeStatsData);
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
      console.error('❌ No current user found!');
      return;
    }
    
    if (!userAnswers || Object.keys(userAnswers).length === 0) {
      console.error('❌ No user answers found!');
      return;
    }
    
    if (!questions || questions.length === 0) {
      console.error('❌ No questions found!');
      return;
    }
    
    setIsLoading(true);
    setLoadingMessage('Your performance is being evaluated...');
    setErrorMessage('');
    setAnswers(userAnswers);
    setTimeStats(timeStatsData || null);
    
    try {
      const correctAnswers = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
      const wrongAnswers = questions.filter(q => userAnswers[q.id] && userAnswers[q.id] !== q.correctAnswer).length;
      const unansweredQuestions = questions.filter(q => !userAnswers[q.id]).length;
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      console.log('Score calculation:');
      console.log('  Total questions:', questions.length);
      console.log('  Correct answers:', correctAnswers);
      console.log('  Wrong answers:', wrongAnswers);
      console.log('  Unanswered questions:', unansweredQuestions);
      console.log('  Calculated score:', score);

      // Firebase'e kaydet
      if (currentUser) {
        const examResult = {
          userId: currentUser.uid,
          examType: 'question-generator' as const,
          examDate: new Date(),
          totalQuestions: questions.length,
          correctAnswers,
          wrongAnswers,
          unansweredQuestions,
          totalTime: timeStatsData?.totalTime || 0,
          averageTime: timeStatsData?.averageTime || 0,
          score,
          answers: userAnswers,
          questionTimes: timeStatsData?.questionTimes || {}
        };

        console.log('Saving exam result:', examResult);
        try {
          const resultId = await dispatch(saveExamResult(examResult)).unwrap();
          console.log('Exam result saved to Firebase with ID:', resultId);
        } catch (error) {
          console.error('Error saving exam result:', error);
        }
      } else {
        console.log('No current user, skipping exam result save');
      }
      
      const evaluationResult = await openaiAI.evaluatePerformance(
        questions.length,
        correctAnswers,
        wrongAnswers
      );
      
      setEvaluation(evaluationResult);
      setAppState('evaluation');
    } catch (error: unknown) {
      console.error('Evaluation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while evaluating. Please try again.');
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setAppState('input');
    setQuestions([]);
    setEvaluation(null);
    setAnswers({});
    setTimeStats(null);
    setErrorMessage('');
    setLoadingMessage('');
    setCurrentQuestionIndex(0);
    setFlaggedQuestions(new Set());
    setOriginalText('');
  };

  // Navigation functions for single section
  const handleAnswerSelect = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (questionId: number) => {
    const index = questions.findIndex(q => q.id === questionId);
    if (index !== -1) {
      setCurrentQuestionIndex(index);
    }
  };

  // Flag system functions
  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const isFlagged = (questionId: number) => {
    return flaggedQuestions.has(questionId);
  };

  const handleRetry = () => {
    setAppState('input');
    setErrorMessage('');
    setLoadingMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <Navbar 
        showBackButton={true}
        backUrl="/"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Progress Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className={`flex items-center gap-2 ${appState === 'input' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium text-sm sm:text-base">Text Input</span>
            </div>
            
            <div className={`hidden sm:block w-16 h-1 ${appState === 'questions' || appState === 'evaluation' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-2 ${appState === 'questions' ? 'text-blue-600' : appState === 'evaluation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'questions' ? 'bg-blue-600 text-white' : appState === 'evaluation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium text-sm sm:text-base">Question Solving</span>
            </div>
            
            <div className={`hidden sm:block w-16 h-1 ${appState === 'evaluation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-2 ${appState === 'evaluation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'evaluation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="font-medium text-sm sm:text-base">Evaluation</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {appState === 'input' && (
          <TextInput 
            onGenerate={handleGenerateQuestions} 
            isLoading={isLoading} 
          />
        )}

        {appState === 'questions' && questions.length > 0 && (
          <div>
            {/* Progress Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </h3>
                <span className="text-sm text-gray-600">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <span>
                  This exam has {questions.length} questions.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 text-black">
              {/* Original Text */}
              <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-8 order-2 lg:order-1">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Original Text
                </h3>
                <div className="prose max-w-none text-black text-sm lg:text-base">
                  {originalText}
                </div>
              </div>

              {/* Questions */}
              <div className="order-1 lg:order-2">
                <QuestionDisplay 
                  key={`question-${currentQuestionIndex}-${questions[currentQuestionIndex]?.id || 'none'}`}
                  questions={questions}
                  currentQuestion={questions[currentQuestionIndex]}
                  onComplete={handleCompleteQuiz}
                  existingAnswers={answers}
                  onAnswerSelect={handleAnswerSelect}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isLastQuestion={currentQuestionIndex === questions.length - 1}
                  onGoToQuestion={goToQuestion}
                  onToggleFlag={toggleFlag}
                  isFlagged={isFlagged}
                  allQuestions={questions}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
            </div>
          </div>
        )}

        {appState === 'evaluation' && evaluation && (
          <EvaluationResults 
            evaluation={evaluation}
            questions={questions}
            answers={answers}
            timeStats={timeStats}
            onRestart={handleRestart}
          />
        )}

        {/* Error State */}
        {appState === 'error' && (
          <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">An Error Occurred</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base">{errorMessage}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <RefreshCw className="w-5 h-5" />
                  Retry
                </button>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  New Start
                </button>
              </div>

              {/* AI Model Status */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Current AI Model:</strong> {openaiAI.getCurrentModelName()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  If the problem persists, please wait a few minutes and try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Professional Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-slideUp">
              <div className="text-center">
                {/* Professional Spinner - Different for each state */}
                <div className="mb-6 flex justify-center">
                  {loadingMessage.includes('generating') ? (
                    <RingLoader 
                      color="#2563eb" 
                      size={80} 
                      speedMultiplier={0.8}
                    />
                  ) : (
                    <ClipLoader 
                      color="#2563eb" 
                      size={60}
                      speedMultiplier={1.2}
                    />
                  )}
                </div>

                {/* Title with Icon */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI Processing
                  </h3>
                </div>
                
                {/* Dynamic Message */}
                <p className="text-gray-600 mb-4 font-medium text-sm sm:text-base">
                  {loadingMessage || 'Lütfen bekleyin...'}
                </p>

                {/* Professional Pulse Loader */}
                <div className="flex justify-center mb-4">
                  <PulseLoader 
                    color="#3b82f6" 
                    size={8} 
                    margin={6}
                    speedMultiplier={0.7}
                  />
                </div>

                {/* Processing Steps */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${loadingMessage.includes('oluşturuluyor') ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                      Text analyzing
                    </span>
                    {!loadingMessage.includes('oluşturuluyor') && <span>✓</span>}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${loadingMessage.includes('değerlendiriliyor') ? 'bg-blue-500 animate-pulse' : loadingMessage.includes('oluşturuluyor') ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                      {loadingMessage.includes('oluşturuluyor') ? 'Questions are being generated' : 'Answers are being evaluated'}
                    </span>
                    {!loadingMessage.includes('oluşturuluyor') && !loadingMessage.includes('değerlendiriliyor') && <span>✓</span>}
                  </div>
                </div>

                {/* AI Model Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <p className="text-sm text-blue-700 font-semibold">
                      🚀 {openaiAI.getCurrentModelName()}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600">
                    Powered by OpenAI
                  </p>
                </div>

                {/* Dynamic Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000 ease-out animate-shimmer" 
                      style={{
                        width: loadingMessage.includes('oluşturuluyor') ? '35%' : 
                               loadingMessage.includes('değerlendiriliyor') ? '75%' : '90%'
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    {loadingMessage.includes('oluşturuluyor') ? 'Processing started...' : 
                     loadingMessage.includes('değerlendiriliyor') ? 'Almost done...' : 'Processing...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer variant="light" />
    </div>
  );
}