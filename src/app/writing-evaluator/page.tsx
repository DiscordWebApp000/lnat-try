'use client';

import { useState } from 'react';
import { openaiAI } from '@/lib/gpt-ai';
import { Brain, AlertCircle, RefreshCw, PenTool, CheckCircle, XCircle, Lightbulb, Lock } from 'lucide-react';
import { PulseLoader, RingLoader } from 'react-spinners';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { saveExamResult } from '@/store/slices/examResultsSlice';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { ToolAccessGuard } from '@/components/ui/ToolAccessGuard';

type AppState = 'input' | 'evaluation' | 'error';

interface WritingEvaluation {
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  detailedAnalysis: {
    argumentStructure: string;
    evidenceUsage: string;
    languageQuality: string;
    logicalFlow: string;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export default function WritingEvaluator() {
  return (
    <ToolAccessGuard toolName="writing-evaluator">
      <WritingEvaluatorContent />
    </ToolAccessGuard>
  );
}

function WritingEvaluatorContent() {
  const { currentUser, loading } = useAuth();
  const dispatch = useAppDispatch();
  
  const [appState, setAppState] = useState<AppState>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [evaluation, setEvaluation] = useState<WritingEvaluation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userText, setUserText] = useState('');
  const [question, setQuestion] = useState('');



  // Yetki kontrolü - loading veya yetki yoksa erken return
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-4">You need to login to use this tool.</p>
          <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
            Login →
          </Link>
        </div>
      </div>
    );
  }


  const handleEvaluate = async (question: string, userText: string) => {
    setIsLoading(true);
    setLoadingMessage('AI analyzing your essay...');
    setErrorMessage('');
    
    try {
      const result = await openaiAI.evaluateWriting(question, userText);
      setEvaluation(result);
      
      // Firebase'e kaydet
      if (currentUser) {
        const examResult = {
          userId: currentUser.uid,
          examType: 'writing-evaluator' as const,
          examDate: new Date(),
          totalQuestions: 1, // Yazı değerlendirmesi tek soru olarak sayılır
          correctAnswers: 0, // Yazı değerlendirmesi için geçerli değil
          wrongAnswers: 0,   // Yazı değerlendirmesi için geçerli değil
          unansweredQuestions: 0,
          totalTime: 0,      // Yazı değerlendirmesi için zaman tutulmuyor
          averageTime: 0,
          score: result.score,
          answers: { 1: userText }, // Yazıyı cevap olarak kaydet
          questionTimes: {}
        };

        console.log('Saving writing evaluation:', examResult);
        try {
          const resultId = await dispatch(saveExamResult(examResult));
          console.log('Writing evaluation saved to Firebase with ID:', resultId);
        } catch (error) {
          console.error('Error saving writing evaluation:', error);
        }
      } else {
        console.log('No current user, skipping writing evaluation save');
      }
      
      setAppState('evaluation');
    } catch (error: unknown) {
      console.error('Eval uation error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while evaluating your essay. Please try again.');
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setAppState('input');
    setEvaluation(null);
    setUserText('');
    setQuestion('');
    setErrorMessage('');
    setLoadingMessage('');
  };

  const handleRetry = () => {
    setAppState('input');
    setErrorMessage('');
    setLoadingMessage('');
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      case 'F': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
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
            <div className={`flex items-center gap-2 ${appState === 'input' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'input' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium text-sm sm:text-base">Essay Input</span>
            </div>
            
            <div className={`hidden sm:block w-16 h-1 ${appState === 'evaluation' ? 'bg-purple-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-2 ${appState === 'evaluation' ? 'text-purple-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'evaluation' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium text-sm sm:text-base">AI Evaluation</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {appState === 'input' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PenTool className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Essay Evaluator</h2>
                <p className="text-gray-600 text-sm sm:text-base">AI will analyze your essay and provide detailed feedback</p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Question Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question or Topic *
                  </label>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Example: Should a democratic society tolerate speech that promotes hatred or incites violence?"
                    className="w-full h-16 sm:h-20 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-800 text-sm sm:text-base"
                    required
                  />
                </div>

                {/* User Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Essay *
                  </label>
                  <textarea
                    value={userText}
                    onChange={(e) => setUserText(e.target.value)}
                    placeholder="Write your essay here..."
                    className="w-full h-48 sm:h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-800 text-sm sm:text-base"
                    required
                  />
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 gap-1">
                    <span className="text-sm text-gray-500">
                      Minimum 100 words recommended
                    </span>
                    <span className="text-sm text-gray-500">
                      {userText.split(/\s+/).filter(word => word.length > 0).length} words
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => handleEvaluate(question, userText)}
                  disabled={!question.trim() || !userText.trim() || isLoading}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <PulseLoader color="#ffffff" size={8} />
                      Evaluating...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Brain className="w-5 h-5" />
                      Evaluate Essay
                    </div>
                  )}
                </button>
              </div>

              {/* Tips */}
              <div className="mt-6 sm:mt-8 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                  <Lightbulb className="w-4 h-4" />
                  Tips
                </h3>
                <ul className="text-xs sm:text-sm text-purple-700 space-y-1">
                  <li>• Present a clear thesis and support it</li>
                  <li>• Use concrete examples and evidence</li>
                  <li>• Address counterarguments</li>
                  <li>• Create a logical structure</li>
                  <li>• Use clear and understandable language</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {appState === 'evaluation' && evaluation && (
          <div className="max-w-6xl mx-auto">
            {/* Score Card */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 mb-6 sm:mb-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Evaluation Result</h2>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-6">
                  {/* Score */}
                  <div className="text-center">
                    <div className={`text-4xl sm:text-6xl font-bold ${getScoreColor(evaluation.score)} mb-2`}>
                      {evaluation.score}
                    </div>
                    <div className="text-base sm:text-lg text-gray-600">Score</div>
                  </div>
                  
                  {/* Grade */}
                  <div className="text-center">
                    <div className={`text-4xl sm:text-6xl font-bold px-4 py-2 rounded-lg ${getGradeColor(evaluation.grade)}`}>
                      {evaluation.grade}
                    </div>
                    <div className="text-base sm:text-lg text-gray-600 mt-2">Grade</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${evaluation.score}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
              {/* Strengths */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {evaluation.feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Weaknesses
                </h3>
                <ul className="space-y-2">
                  {evaluation.feedback.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700 text-sm sm:text-base">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Suggestions
              </h3>
              <ul className="space-y-3">
                {evaluation.feedback.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 text-sm sm:text-base">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mt-6 sm:mt-8">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Detailed Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Argument Structure</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">{evaluation.detailedAnalysis.argumentStructure}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Evidence Usage</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">{evaluation.detailedAnalysis.evidenceUsage}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Language Quality</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">{evaluation.detailedAnalysis.languageQuality}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">Logical Flow</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">{evaluation.detailedAnalysis.logicalFlow}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
              <button
                onClick={handleRestart}
                className="px-6 sm:px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-sm sm:text-base"
              >
                New Evaluation
              </button>
              <Link
                href="/"
                className="px-6 sm:px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base text-center"
              >
                Home
              </Link>
            </div>
          </div>
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
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                >
                  <RefreshCw className="w-5 h-5" />
                    Try Again
                </button>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  New Start
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Professional Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all animate-slideUp">
              <div className="text-center">
                {/* Professional Spinner */}
                <div className="mb-6 flex justify-center">
                  <RingLoader 
                    color="#9333EA" 
                    size={80} 
                    speedMultiplier={0.8}
                  />
                </div>

                {/* Title with Icon */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Brain className="w-6 h-6 text-purple-600 animate-pulse" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI Evaluating
                  </h3>
                </div>
                
                {/* Dynamic Message */}
                <p className="text-gray-600 mb-4 font-medium text-sm sm:text-base">
                  {loadingMessage || 'Please wait...'}
                </p>

                {/* Professional Pulse Loader */}
                <div className="flex justify-center mb-4">
                  <PulseLoader 
                    color="#9333EA" 
                    size={8} 
                    margin={6}
                    speedMultiplier={0.7}
                  />
                </div>

                {/* Processing Steps */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Essay analyzing
                    </span>
                    <span>✓</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 animate-pulse rounded-full"></div>
                      Evaluating
                    </span>
                  </div>
                </div>

                {/* AI Model Info Card */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></div>
                    <p className="text-sm text-purple-700 font-semibold">
                      🚀 {openaiAI.getCurrentModelName()}
                    </p>
                  </div>
                  <p className="text-xs text-purple-600">
                    Powered by Google AI
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