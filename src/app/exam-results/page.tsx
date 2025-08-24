'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserExamResults, deleteExamResult } from '@/store/slices/examResultsSlice';
import Navbar from '@/components/Navbar';
import { ExamResult } from '@/types/user';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  FileText,
  BookOpen,
  PenTool,
  Eye,
  Trash2,
  X
} from 'lucide-react';

function ExamResultsContent() {
  const { currentUser, loading } = useAuth();
  const dispatch = useAppDispatch();
  const { results: examResults, loading: loadingResults } = useAppSelector((state: any) => state.examResults);
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [loading, currentUser, router]);

  const loadExamResults = useCallback(async () => {
    if (!currentUser) return;
    dispatch(fetchUserExamResults(currentUser.uid));
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (currentUser) {
      loadExamResults();
    }
  }, [currentUser, loadExamResults]);

  useEffect(() => {
    // URL'de ID varsa modal açık
    if (resultId && examResults.length > 0) {
      const result = examResults.find((r: ExamResult) => r.id === resultId);
      if (result) {
        setSelectedResult(result);
        setIsModalOpen(true);
      }
    }
  }, [resultId, examResults]);

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam result?')) {
      return;
    }

    try {
      dispatch(deleteExamResult(examId));
      
      // Eğer silinen sonuç modal'da açıksa modal'ı kapat
      if (selectedResult?.id === examId) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting exam result:', error);
      alert('An error occurred while deleting the exam result.');
    }
  };

  const openModal = (result: ExamResult) => {
    setSelectedResult(result);
    setIsModalOpen(true);
    // URL'yi güncelle
    router.push(`/exam-results?id=${result.id}`, { scroll: false });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResult(null);
    // URL'den ID'yi kaldır
    router.push('/exam-results', { scroll: false });
  };

  const getToolInfo = (tool: string) => {
    switch (tool) {
      case 'text-question-analysis':
        return {
          name: 'Text-Question Analysis',
          description: 'Text analysis and question generation',
          icon: FileText,
          color: 'bg-blue-500'
        };
      case 'question-generator':
        return {
          name: 'Question Generator',
          description: 'Question generation and test creation',
          icon: BookOpen,
          color: 'bg-green-500'
        };
      case 'writing-evaluator':
        return {
          name: 'Writing Evaluator',
          description: 'Writing evaluation and analysis',
          icon: PenTool,
          color: 'bg-purple-500'
        };
      default:
        return {
          name: 'Unknown Tool',
            description: 'Unknown tool',
          icon: BookOpen,
          color: 'bg-gray-500'
        };
    }
  };

  const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

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
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <Navbar 
        title="Exam Results"
        description="Your complete exam history"
        showBackButton={true}
        backUrl="/dashboard"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Exams</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{examResults.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Average Score</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {examResults.length > 0 
                    ? Math.round(examResults.reduce((acc: number, result: ExamResult) => acc + result.score, 0) / examResults.length)
                    : 0}%
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-500 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Highest Score</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {examResults.length > 0 
                    ? Math.max(...examResults.map((r: ExamResult) => r.score))
                    : 0}%
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">All Exam Results</h3>

          {loadingResults ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Exam results are loading...</p>
            </div>
          ) : examResults.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-sm sm:text-base">No exam results found.</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">Start taking exams by using the tools!</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {examResults.map((result: ExamResult) => {
                const toolInfo = getToolInfo(result.examType);
                const Icon = toolInfo.icon;
                
                return (
                  <div key={result.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${toolInfo.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">{toolInfo.name}</h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(result.examDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(result.totalTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <div className="text-right">
                          <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {result.correctAnswers}/{result.totalQuestions} correct
                          </div>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => openModal(result)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteExam(result.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {isModalOpen && selectedResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getToolInfo(selectedResult.examType).color} rounded-lg flex items-center justify-center`}>
                  {React.createElement(getToolInfo(selectedResult.examType).icon, { className: "w-4 h-4 sm:w-5 sm:h-5 text-white" })}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    {getToolInfo(selectedResult.examType).name}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {formatDate(selectedResult.examDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {/* Score Overview */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <div className={`text-xl sm:text-2xl font-bold ${getScoreColor(selectedResult.score)}`}>
                    {selectedResult.score}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Score</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {selectedResult.correctAnswers}
                  </div>
                      <div className="text-xs sm:text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-red-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {selectedResult.wrongAnswers}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Wrong</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-gray-600">
                    {selectedResult.unansweredQuestions}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Empty</div>
                </div>
              </div>

              {/* Time Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span className="text-xs sm:text-sm font-medium text-purple-900">Total Time</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-purple-600">
                    {formatTime(selectedResult.totalTime)}
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-xs sm:text-sm font-medium text-orange-900">Average Time</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-orange-600">
                    {formatTime(selectedResult.averageTime)}
                  </div>
                </div>
              </div>

              {/* Answers Preview */}
              <div className="border-t pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Answer Summary</h3>
                <div className="space-y-2">
                  {Object.entries(selectedResult.answers).slice(0, 5).map(([questionId, answer]) => (
                    <div key={questionId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg gap-2 sm:gap-0">
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        Question {questionId}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-600 bg-white px-2 py-1 rounded">
                        {answer || 'Empty'}
                      </span>
                    </div>
                  ))}
                  {Object.keys(selectedResult.answers).length > 5 && (
                    <div className="text-center text-xs sm:text-sm text-gray-500 pt-2">
                        ... and {Object.keys(selectedResult.answers).length - 5} more questions
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExamResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ExamResultsContent />
    </Suspense>
  );
}