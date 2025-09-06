'use client';

import { useState, useCallback,  } from 'react';
import { Question, EvaluationResult, geminiAI } from '@/lib/gemini-ai';
import QuestionDisplay from '@/components/ui/QuestionDisplay';
import EvaluationResults from '@/components/ui/EvaluationResults';
import TextQuestionsInput from '@/components/forms/TextQuestionsInput';
import { Brain, AlertCircle, RefreshCw, Flag, CheckCircle, XCircle, List, Lock, Shield } from 'lucide-react';
import { PulseLoader, RingLoader } from 'react-spinners';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { saveExamResult } from '@/store/slices/examResultsSlice';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { ToolAccessGuard } from '@/components/ui/ToolAccessGuard';

type AppState = 'input' | 'questions' | 'review' | 'evaluation' | 'summary' | 'error';

export default function MetinSoruAnalizi() {
  return (
    <ToolAccessGuard toolName="text-question-analysis">
      <MetinSoruAnaliziContent />
    </ToolAccessGuard>
  );
}

function MetinSoruAnaliziContent() {
  const { currentUser, loading, hasPermission, permissionsLoading } = useAuth();
  const dispatch = useAppDispatch();
  
  const [appState, setAppState] = useState<AppState>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [allSections, setAllSections] = useState<{passage: string; questions: Question[]}[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [targetQuestionIndex, setTargetQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [allAnswers, setAllAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [timeStats, setTimeStats] = useState<{questionTimes: Record<number, number>; totalTime: number; averageTime: number} | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>('');

  const [analyzedText, setAnalyzedText] = useState('');

  const handleTimeUpdate = useCallback((questionTimes: Record<number, number>, totalTime: number) => {
    console.log('🕐 handleTimeUpdate called with:', { questionTimes, totalTime });
    
    // Global timeStats'i güncelle
    setTimeStats((prev: {questionTimes: Record<number, number>; totalTime: number; averageTime: number} | null) => {
      if (!prev) {
        const newStats = {
          questionTimes: questionTimes,
          totalTime: totalTime,
          averageTime: Object.keys(questionTimes).length > 0 
            ? Math.round(Object.values(questionTimes).reduce((a, b) => a + b, 0) / Object.keys(questionTimes).length)
            : 0
        };
        console.log('🕐 First time stats:', newStats);
        return newStats;
      }
      
      const updatedQuestionTimes = { ...prev.questionTimes, ...questionTimes };
      // Calculate total time by summing all question times
      const updatedTotalTime = Object.values(updatedQuestionTimes).reduce((sum, time) => sum + time, 0);
      const updatedAverageTime = Object.keys(updatedQuestionTimes).length > 0 
        ? Math.round(updatedTotalTime / Object.keys(updatedQuestionTimes).length)
        : 0;
      
      const newStats = {
        questionTimes: updatedQuestionTimes,
        totalTime: updatedTotalTime,
        averageTime: updatedAverageTime
      };
      
      console.log('🕐 Updated time stats:', newStats);
      return newStats;
    });
  }, []);

  // Yetki kontrolü - loading veya yetki yoksa erken return
  if (loading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-600 mb-4">You need to login to use this tool.</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
            Login →
          </Link>
        </div>
      </div>
    );
  }

  if (!hasPermission('text-question-analysis')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Permission Required</h1>
          <p className="text-gray-600 mb-4">You need to be granted permission to use this tool.</p>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleAnalyzeContent = async (combinedText: string) => {
    setIsLoading(true);
    setLoadingMessage('🧠 AI is analyzing your content...');
    setErrorMessage('');
    
    try {
      let sections = [];
      
      // Eğer combinedText birden fazla bölüm içeriyorsa, manuel olarak ayır
      if (combinedText.includes('--- YENİ BÖLÜM ---')) {
        console.log('Manuel bölüm ayrıştırması yapılıyor...');
        const textParts = combinedText.split('--- YENİ BÖLÜM ---');
        console.log('Bulunan bölüm sayısı:', textParts.length);
        
        // Loading progress'i başlat
        setLoadingProgress({ current: 0, total: textParts.length });
        setLoadingMessage(`Bölüm 1/${textParts.length} analiz ediliyor...`);
        
        sections = textParts.map((part, index) => {
          // Her bölümü AI ile analiz et
          console.log(`Bölüm ${index + 1} analiz ediliyor...`);
          return {
            passage: part.trim(),
            questions: [] as Question[] // Explicit type annotation
          };
        });
        
        // Her bölüm için AI analizi yap
        for (let i = 0; i < sections.length; i++) {
          try {
            // Progress güncelle
            setLoadingProgress({ current: i + 1, total: sections.length });
            setLoadingMessage(`Section ${i + 1}/${sections.length} - Gemini AI analizi...`);
            
            const result = await geminiAI.analyzeTextAndQuestions(sections[i].passage, '');
            console.log(`Section ${i + 1} AI sonucu:`, result);
            
            if (result.sections && result.sections[0]) {
              // Question ID'lerini unique yap (bölüm numarası * 100 + soru numarası)
              const uniqueQuestions = result.sections[0].questions.map((question, index) => ({
                ...question,
                id: (i + 1) * 100 + (index + 1) // Örn: Bölüm 1: 101,102,103... Bölüm 2: 201,202,203...
              }));
              
              sections[i] = {
                passage: result.sections[0].passage,
                questions: uniqueQuestions
              };
              console.log(`Bölüm ${i + 1} questions:`, uniqueQuestions);
            }
          } catch (error) {
            console.error(`Bölüm ${i + 1} analiz hatası:`, error);
          }
        }
      } else {
        // Tek bölüm için normal AI analizi
        console.log('Single section analyzing...');
        setLoadingProgress({ current: 1, total: 1 });
        setLoadingMessage('Single section - AI is analyzing your content...');
        
        const result = await geminiAI.analyzeTextAndQuestions(combinedText, '');
        console.log('AI result:', result);
        console.log('Sections count:', result.sections?.length || 0);
        
        sections = result.sections?.map(section => ({
          passage: section.passage,
          questions: section.questions
        })) || [];
      }
      
      console.log('Final sections:', sections);
      console.log('Sections length:', sections.length);
      
      console.log('✅ Questions ready for navigation');
      setAllSections(sections);
      setCurrentSectionIndex(0);
      
      // İlk bölümü göster
      if (sections.length > 0) {
        setAnalyzedText(sections[0].passage || '');
        setQuestions(sections[0].questions || []);
        setTargetQuestionIndex(0);
        console.log('First section questions:', sections[0].questions);
      } else {
        console.log('No sections found!');
        setQuestions([]);
      }
      
      setAppState('questions');
    } catch (error: unknown) {
      console.error('Analysis error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred while analyzing the content. Please try again.');
      setAppState('error');
    } finally {
      setIsLoading(false);
      setLoadingProgress({ current: 0, total: 0 });
      setLoadingMessage('');
    }
  };

  const handleCompleteQuiz = async (userAnswers: Record<number, string>, timeStatsData?: {questionTimes: Record<number, number>; totalTime: number; averageTime: number}) => {
    console.log('handleCompleteQuiz çağrıldı');
    console.log('currentSectionIndex:', currentSectionIndex);
    console.log('allSections.length:', allSections.length);
    console.log('allSections:', allSections);
    
    // Mevcut bölümün cevaplarını kaydet
    const updatedAnswers = { ...allAnswers, ...userAnswers };
    setAllAnswers(updatedAnswers);
    
    // Eğer son bölüm değilse, sonraki bölüme geç
    if (currentSectionIndex < allSections.length - 1) {
      console.log('Next section loading...');
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      setAnalyzedText(allSections[nextIndex].passage);
      setQuestions(allSections[nextIndex].questions);
      // Yeni bölüme geçerken ilk sorudan başla
      setTargetQuestionIndex(0);
      
      // Progress mesajı göster
      setLoadingMessage(`Section ${nextIndex + 1}/${allSections.length} loading...`);
      setTimeout(() => setLoadingMessage(''), 1000);
    } else {
      console.log('All sections completed, evaluating results...');
      
      // Zaman istatistiklerini birleştir
      let finalTimeStats = timeStatsData;
      if (timeStatsData) {
        console.log('🕐 handleCompleteQuiz - timeStatsData:', timeStatsData);
        setTimeStats((prev: {questionTimes: Record<number, number>; totalTime: number; averageTime: number} | null) => {
          if (!prev) {
            finalTimeStats = timeStatsData;
            console.log('🕐 handleCompleteQuiz - First time stats:', finalTimeStats);
            return timeStatsData;
          }
          
          console.log('🕐 handleCompleteQuiz - Previous stats:', prev);
          const combinedQuestionTimes = { ...prev.questionTimes, ...timeStatsData.questionTimes };
          // Calculate total time by summing all question times
          const combinedTotalTime = Object.values(combinedQuestionTimes).reduce((sum, time) => sum + time, 0);
          const combinedAverageTime = Object.keys(combinedQuestionTimes).length > 0 
            ? Math.round(combinedTotalTime / Object.keys(combinedQuestionTimes).length)
            : 0;
          
          finalTimeStats = {
            questionTimes: combinedQuestionTimes,
            totalTime: combinedTotalTime,
            averageTime: combinedAverageTime
          };
          
          console.log('🕐 handleCompleteQuiz - Combined time stats:', finalTimeStats);
          return finalTimeStats;
        });
      }

      // Review sayfasına git (AI analizi öncesi)
      setAppState('review');
    }
  };

  const handleStartAnalysis = async () => {
    setIsLoading(true);
    setLoadingMessage('AI analyzing your performance...');
    
    try {
      const allQuestions = allSections.flatMap(section => section.questions);
      const correctAnswers = allQuestions.filter(q => allAnswers[q.id] === q.correctAnswer).length;
      const wrongAnswers = allQuestions.filter(q => allAnswers[q.id] && allAnswers[q.id] !== q.correctAnswer).length;
      const unansweredQuestions = allQuestions.filter(q => !allAnswers[q.id]).length;
      const score = Math.round((correctAnswers / allQuestions.length) * 100);

      // Firebase'e kaydet
      if (currentUser) {
        const examResult = {
          userId: currentUser.uid,
          examType: 'text-question-analysis' as const,
          examDate: new Date(),
          totalQuestions: allQuestions.length,
          correctAnswers,
          wrongAnswers,
          unansweredQuestions,
          totalTime: timeStats?.totalTime || 0,
          averageTime: timeStats?.averageTime || 0,
          score,
          answers: allAnswers,
          questionTimes: timeStats?.questionTimes || {}
        };

        console.log('Saving exam result:', examResult);
        try {
          const resultId = await dispatch(saveExamResult(examResult)).unwrap();
          console.log('Exam result saved to Firebase with ID:', resultId);
        } catch (error) {
          console.error('Error saving exam result:', error);
        }
      }

      // AI değerlendirme yap
      const evaluationResult = await geminiAI.evaluatePerformance(
        allQuestions.length,
        correctAnswers,
        wrongAnswers
      );
      
      setEvaluation(evaluationResult);
      setAppState('evaluation');
    } catch (error) {
      console.error('Error during analysis:', error);
      setErrorMessage('Analysis failed. Please try again.');
      setAppState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setAppState('input');
    setQuestions([]);
    setEvaluation(null);
    setAllAnswers({});
    setFlaggedQuestions(new Set());
    setAllSections([]);
    setCurrentSectionIndex(0);
    setTargetQuestionIndex(0);
    setTimeStats(null);
    setErrorMessage('');
    setLoadingMessage('');
    setLoadingProgress({ current: 0, total: 0 });

    setAnalyzedText('');
  };

  const handleRetry = () => {
    setAppState('input');
    setErrorMessage('');
    setLoadingMessage('');
  };

  // Bayrak sistemi fonksiyonları
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

  // Soru özeti oluşturma
  const generateQuestionSummary = () => {
    const allQuestions = allSections.flatMap(section => section.questions);
    const answeredQuestions = allQuestions.filter(q => allAnswers[q.id]);
    const unansweredQuestions = allQuestions.filter(q => !allAnswers[q.id]);
    const flaggedQuestionsList = allQuestions.filter(q => flaggedQuestions.has(q.id));
    
    return {
      total: allQuestions.length,
      answered: answeredQuestions.length,
      unanswered: unansweredQuestions.length,
      flagged: flaggedQuestionsList.length,
      questions: allQuestions.map(q => ({
        id: q.id,
        text: q.text,
        section: Math.floor(q.id / 100),
        isAnswered: !!allAnswers[q.id],
        isFlagged: flaggedQuestions.has(q.id),
        userAnswer: allAnswers[q.id] || null,
        correctAnswer: q.correctAnswer
      }))
    };
  };

  // Belirli bir soruya git
  const goToQuestion = (questionId: number) => {
    console.log('🎯 Going to question ID:', questionId);
    
    // Soru ID'sinden bölüm ve soru numarasını çıkar
    const sectionNum = Math.floor(questionId / 100);
    const questionNum = questionId % 100;
    const sectionIndex = sectionNum - 1; // 0-based index
    const questionIndex = questionNum - 1; // 0-based index
    
    console.log(`📍 Calculated: Section ${sectionNum}, Question ${questionNum}`);
    
    if (sectionIndex >= 0 && sectionIndex < allSections.length) {
      const section = allSections[sectionIndex];
      if (questionIndex >= 0 && questionIndex < section.questions.length) {
        console.log(`✅ Valid question: Section ${sectionIndex + 1}, Question ${questionIndex + 1}`);
        setCurrentSectionIndex(sectionIndex);
        setAnalyzedText(allSections[sectionIndex].passage);
        setQuestions(allSections[sectionIndex].questions);
        setTargetQuestionIndex(questionIndex);
        setAppState('questions');
        return;
      }
    }
    
    console.log('❌ Invalid question:', questionId);
  };



  // Soru navigasyonu için yeni fonksiyonlar
  const handleAnswerSelect = (questionId: number, answer: string) => {
    console.log('🎯 Answer selected:', questionId, answer);
    setAllAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    console.log('➡️ Next clicked');
    console.log(`📍 Current state: Section ${currentSectionIndex + 1}, Question ${targetQuestionIndex + 1}`);
    console.log(`📊 Current section has ${questions.length} questions`);
    
    // Basit ve güvenilir navigasyon
    if (targetQuestionIndex < questions.length - 1) {
      // Aynı bölümde sonraki soru
      const nextQuestionIndex = targetQuestionIndex + 1;
      console.log(`➡️ Same section, moving to question ${nextQuestionIndex + 1}`);
      setTargetQuestionIndex(nextQuestionIndex);
    } else {
      // Sonraki bölüme geç
      if (currentSectionIndex < allSections.length - 1) {
        const nextSectionIndex = currentSectionIndex + 1;
        console.log(`🔄 Moving to section ${nextSectionIndex + 1}, question 1`);
        
        // State updates'leri atomic olarak yap
        const nextSection = allSections[nextSectionIndex];
        
        // Batch update kullanarak race condition'ı önle
        setTimeout(() => {
          setCurrentSectionIndex(nextSectionIndex);
          setAnalyzedText(nextSection.passage);
          setQuestions(nextSection.questions);
          setTargetQuestionIndex(0);
          console.log(`✅ Updated to section ${nextSectionIndex + 1}, question 1`);
        }, 0);
      } else {
        console.log('🏁 Last question reached');
      }
    }
  };

  const handlePrevious = () => {
    console.log('⬅️ Previous clicked');
    
    // Aynı bölümde önceki soru var mı?
    if (targetQuestionIndex > 0) {
      // Aynı bölümde önceki soru
      console.log('⬅️ Previous question in same section');
      setTargetQuestionIndex(prev => prev - 1);
    } else {
      // Önceki bölüme geç
      if (currentSectionIndex > 0) {
        console.log('🔄 Moving to previous section');
        const prevSectionIndex = currentSectionIndex - 1;
        setCurrentSectionIndex(prevSectionIndex);
        setAnalyzedText(allSections[prevSectionIndex].passage);
        setQuestions(allSections[prevSectionIndex].questions);
        setTargetQuestionIndex(allSections[prevSectionIndex].questions.length - 1); // Son soru
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <Navbar 
        showBackButton={true}
        backUrl="/"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            <div className={`flex items-center gap-2 ${appState === 'input' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'input' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className="font-medium text-sm sm:text-base">Text Input</span>
            </div>
            
            <div className={`hidden sm:block w-16 h-1 ${appState === 'questions' || appState === 'review' || appState === 'evaluation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-2 ${appState === 'questions' ? 'text-green-600' : appState === 'review' || appState === 'evaluation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'questions' ? 'bg-green-600 text-white' : appState === 'review' || appState === 'evaluation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className="font-medium text-sm sm:text-base">Questions</span>
            </div>
            
            <div className={`hidden sm:block w-16 h-1 ${appState === 'review' || appState === 'evaluation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-2 ${appState === 'review' ? 'text-green-600' : appState === 'evaluation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'review' ? 'bg-green-600 text-white' : appState === 'evaluation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className="font-medium text-sm sm:text-base">Review</span>
            </div>
            
            <div className={`hidden sm:block w-16 h-1 ${appState === 'evaluation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
            
            <div className={`flex items-center gap-2 ${appState === 'evaluation' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                appState === 'evaluation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                4
              </div>
              <span className="font-medium text-sm sm:text-base">Results</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {appState === 'input' && (
          <TextQuestionsInput 
            onAnalyze={handleAnalyzeContent}
            isLoading={isLoading}
          />
        )}

        {appState === 'questions' && questions.length > 0 && (
          <div>
            {/* Progress Bar */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Section {currentSectionIndex + 1} / {allSections.length}
                </h3>
                <span className="text-sm text-gray-600">
                  {Math.round(((currentSectionIndex + 1) / allSections.length) * 100)}% Completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentSectionIndex + 1) / allSections.length) * 100}%` }}
                ></div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {allSections.length > 1 && (
                  <span>
                    This section has {questions.length} questions.   
                    {currentSectionIndex < allSections.length - 1 && ` Next section has ${allSections[currentSectionIndex + 1]?.questions.length || 0} questions.`}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 text-black">
              {/* Original Text */}
              <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-8 order-2 lg:order-1">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Section {currentSectionIndex + 1} - Text
                </h3>
                <div className="prose max-w-none text-black text-sm lg:text-base">
                  {analyzedText}
                </div>
              </div>

              {/* Questions */}
              <div className="order-1 lg:order-2">
                <QuestionDisplay 
                  key={`section-${currentSectionIndex}-question-${targetQuestionIndex}-${questions[targetQuestionIndex]?.id || 'none'}`}
                  questions={questions}
                  currentQuestion={questions[targetQuestionIndex]}
                  onComplete={handleCompleteQuiz}
                  isLastSection={currentSectionIndex === allSections.length - 1}
                  totalSections={allSections.length}
                  currentSection={currentSectionIndex + 1}
                  onToggleFlag={toggleFlag}
                  isFlagged={isFlagged}
                  existingAnswers={allAnswers}
                  onAnswerSelect={handleAnswerSelect}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isLastQuestion={
                    currentSectionIndex === allSections.length - 1 && 
                    targetQuestionIndex === questions.length - 1
                  }
                  onGoToQuestion={goToQuestion}
                  allQuestions={allSections.flatMap(section => section.questions)}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>
            </div>
          </div>
        )}

        {appState === 'evaluation' && evaluation && (
          <EvaluationResults 
            evaluation={evaluation}
            questions={allSections.flatMap(section => section.questions)}
            answers={allAnswers}
            timeStats={timeStats}
            onRestart={handleRestart}
          />
        )}

        {/* Review State */}
        {appState === 'review' && (() => {
          const summary = generateQuestionSummary();
          
          return (
            <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Exam Review</h2>
                <p className="text-gray-600">Review your answers before submitting for AI analysis</p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">{summary.total}</div>
                  <div className="text-xs md:text-sm text-blue-700">Total Questions</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-green-600">{summary.answered}</div>
                  <div className="text-xs md:text-sm text-green-700">Answered</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-red-600">{summary.unanswered}</div>
                  <div className="text-xs md:text-sm text-red-700">Unanswered</div>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-orange-600">{summary.flagged}</div>
                  <div className="text-xs md:text-sm text-orange-700">Flagged</div>
                </div>
              </div>

              {/* Unanswered Questions Warning */}
              {summary.unanswered > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-red-800">
                      {summary.unanswered} Unanswered Question{summary.unanswered > 1 ? 's' : ''}
                    </h3>
                  </div>
                  <p className="text-red-700 mb-4">
                    These questions will be marked as incorrect in the analysis. Consider answering them before proceeding.
                  </p>
                  <div className="space-y-2">
                    {summary.questions.filter(q => !q.isAnswered).slice(0, 5).map((question) => (
                      <div
                        key={question.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-red-200 cursor-pointer hover:bg-red-25"
                        onClick={() => {
                          setAppState('questions');
                          setTimeout(() => goToQuestion(question.id), 100);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-700">
                            Section {question.section} • Question {question.id % 100}
                          </span>
                          {question.isFlagged && (
                            <Flag className="w-4 h-4 text-orange-600 fill-current" />
                          )}
                        </div>
                        <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                          Answer Now
                        </button>
                      </div>
                    ))}
                    {summary.questions.filter(q => !q.isAnswered).length > 5 && (
                      <div className="text-center text-sm text-gray-500">
                        ... and {summary.questions.filter(q => !q.isAnswered).length - 5} more unanswered questions
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Flagged Questions */}
              {summary.flagged > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Flag className="w-6 h-6 text-orange-600 fill-current" />
                    <h3 className="text-lg font-semibold text-orange-800">
                      {summary.flagged} Flagged Question{summary.flagged > 1 ? 's' : ''}
                    </h3>
                  </div>
                  <p className="text-orange-700 mb-4">
                    Questions you marked for review. Consider reviewing these before final submission.
                  </p>
                  <div className="space-y-2">
                    {summary.questions.filter(q => q.isFlagged).map((question) => (
                      <div
                        key={question.id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-orange-200 cursor-pointer hover:bg-orange-25"
                        onClick={() => {
                          setAppState('questions');
                          setTimeout(() => goToQuestion(question.id), 100);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-orange-700">
                            Section {question.section} • Question {question.id % 100}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            question.isAnswered 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {question.isAnswered ? 'Answered' : 'Unanswered'}
                          </span>
                        </div>
                        <button className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700">
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-6 border-t">
                <button
                  onClick={handleStartAnalysis}
                  className={`px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    summary.unanswered > 0
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {summary.unanswered > 0 ? (
                    <>⚠️ Start AI Analysis ({summary.unanswered} unanswered)</>
                  ) : (
                    '🤖 Start AI Analysis'
                  )}
                </button>
                <button
                  onClick={() => setAppState('questions')}
                  className="px-6 sm:px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Continue Answering
                </button>
              </div>
            </div>
          );
        })()}

        {/* Question Summary State */}
        {appState === 'summary' && (
          <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">📋 Question Summary</h2>
              <p className="text-gray-600">Review your answers and flagged questions before final evaluation</p>
            </div>

            {(() => {
              const summary = generateQuestionSummary();
              return (
                <div className="space-y-6">
                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                    <div className="bg-blue-50 p-3 md:p-4 rounded-lg text-center">
                      <div className="text-xl md:text-2xl font-bold text-blue-600">{summary.total}</div>
                      <div className="text-xs md:text-sm text-blue-600">Total Questions</div>
                    </div>
                    <div className="bg-green-50 p-3 md:p-4 rounded-lg text-center">
                      <div className="text-xl md:text-2xl font-bold text-green-600">{summary.answered}</div>
                      <div className="text-xs md:text-sm text-green-600">Answered</div>
                    </div>
                    <div className="bg-red-50 p-3 md:p-4 rounded-lg text-center">
                      <div className="text-xl md:text-2xl font-bold text-red-600">{summary.unanswered}</div>
                      <div className="text-xs md:text-sm text-red-600">Unanswered</div>
                    </div>
                    <div className="bg-orange-50 p-3 md:p-4 rounded-lg text-center">
                      <div className="text-xl md:text-2xl font-bold text-orange-600">{summary.flagged}</div>
                      <div className="text-xs md:text-sm text-orange-600">Flagged</div>
                    </div>
                  </div>

                  {/* Unanswered Questions Warning */}
                  {summary.unanswered > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <XCircle className="w-6 h-6 text-red-600" />
                        <h3 className="text-lg font-semibold text-red-800">
                          {summary.unanswered} Unanswered Question{summary.unanswered > 1 ? 's' : ''}
                        </h3>
                      </div>
                      <p className="text-red-700 mb-4">
                        You have unanswered questions. These will be marked as incorrect in the evaluation.
                      </p>
                      <div className="space-y-2">
                        {summary.questions.filter(q => !q.isAnswered).map((question) => (
                          <div
                            key={question.id}
                            className="flex items-center justify-between p-2 bg-white rounded border border-red-200 cursor-pointer hover:bg-red-25"
                            onClick={() => goToQuestion(question.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-red-700">
                                Section {question.section} • Question {question.id % 100}
                              </span>
                              {question.isFlagged && (
                                <Flag className="w-4 h-4 text-orange-600 fill-current" />
                              )}
                            </div>
                            <button className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                              Answer Now
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flagged Questions */}
                  {summary.flagged > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Flag className="w-6 h-6 text-orange-600 fill-current" />
                        <h3 className="text-lg font-semibold text-orange-800">
                          {summary.flagged} Flagged Question{summary.flagged > 1 ? 's' : ''}
                        </h3>
                      </div>
                      <p className="text-orange-700 mb-4">
                        Questions you marked for review. Consider reviewing these before final submission.
                      </p>
                      <div className="space-y-2">
                        {summary.questions.filter(q => q.isFlagged).map((question) => (
                          <div
                            key={question.id}
                            className="flex items-center justify-between p-2 bg-white rounded border border-orange-200 cursor-pointer hover:bg-orange-25"
                            onClick={() => goToQuestion(question.id)}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-orange-700">
                                Section {question.section} • Question {question.id % 100}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                question.isAnswered 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {question.isAnswered ? 'Answered' : 'Unanswered'}
                              </span>
                            </div>
                            <button className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700">
                              Review
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All Questions Grid */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">All Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {summary.questions.map((question) => (
                        <div
                          key={question.id}
                          className={`p-3 rounded-lg border-2 transition-all hover:shadow-md cursor-pointer ${
                            question.isAnswered
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          } ${question.isFlagged ? 'ring-2 ring-orange-300' : ''}`}
                          onClick={() => goToQuestion(question.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-700">
                                S{question.section} • Q{question.id % 100}
                              </span>
                              {question.isFlagged && (
                                <Flag className="w-4 h-4 text-orange-600 fill-current" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {question.isAnswered ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                          </div>
                          
                          <div className="text-xs text-gray-600 mb-2">
                            {question.isAnswered ? (
                              <span className="text-green-700 font-medium">✓ Answered</span>
                            ) : (
                              <span className="text-red-700 font-medium">○ Unanswered</span>
                            )}
                          </div>

                          {question.isAnswered && (
                            <div className="text-xs text-gray-500">
                              Your: {question.userAnswer} • Correct: {question.correctAnswer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-6 border-t">
                    <button
                      onClick={async () => {
                        // Check for unanswered questions and show warning
                        if (summary.unanswered > 0) {
                          const confirmed = window.confirm(
                            `⚠️ Warning: You have ${summary.unanswered} unanswered question${summary.unanswered > 1 ? 's' : ''}.\n\n` +
                            `These will be marked as incorrect in the evaluation.\n\n` +
                            `Do you want to proceed with the evaluation anyway?`
                          );
                          
                          if (!confirmed) {
                            return; // User chose not to proceed
                          }
                        }

                        setIsLoading(true);
                        setLoadingMessage('Evaluating performance...');
                        try {
                          const allQuestions = allSections.flatMap(section => section.questions);
                          const totalQuestions = allQuestions.length;
                          const correctAnswers = allQuestions.filter(q => allAnswers[q.id] === q.correctAnswer).length;
                          const wrongAnswers = allQuestions.filter(q => allAnswers[q.id] && allAnswers[q.id] !== q.correctAnswer).length;
                          
                          const evaluationResult = await geminiAI.evaluatePerformance(
                            totalQuestions,
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
                      }}
                      className={`px-6 sm:px-8 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                        summary.unanswered > 0
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {summary.unanswered > 0 ? (
                        <>
                          ⚠️ Proceed to Evaluation ({summary.unanswered} unanswered)
                        </>
                      ) : (
                        'Proceed to Evaluation'
                      )}
                    </button>
                    <button
                      onClick={() => setAppState('questions')}
                      className="px-6 sm:px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                      Continue Answering
                    </button>
                    
                    {/* Quick Overview Button */}
                    <button
                      onClick={() => {
                        // Open modal with all questions - we'll need to add state for this
                        // For now, just navigate back to questions
                        setAppState('questions');
                      }}
                      className="px-6 sm:px-8 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors inline-flex items-center gap-2 text-sm sm:text-base"
                    >
                      <List className="w-4 h-4" />
                      Quick Overview
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Error State */}
        {appState === 'error' && (
          <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bir Hata Oluştu</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">{errorMessage}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <RefreshCw className="w-5 h-5" />
                  Tekrar Dene
                </button>
                <button
                  onClick={handleRestart}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Yeni Başla
                </button>
              </div>

              {/* AI Model Status */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Current AI Model:</strong> {geminiAI.getCurrentModelName()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Eğer sorun devam ederse, lütfen birkaç dakika bekleyip tekrar deneyin.
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
                {/* Professional Spinner */}
                <div className="mb-6 flex justify-center">
                  <RingLoader 
                    color="#3B82F6" 
                    size={80} 
                    speedMultiplier={0.8}
                  />
                </div>

                {/* Title with Icon */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Brain className="w-6 h-6 text-blue-600 animate-pulse" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI Processing
                  </h3>
                </div>
                
                {/* Dynamic Message */}
                <p className="text-gray-600 mb-4 font-medium">
                  {loadingMessage || 'Lütfen bekleyin...'}
                </p>

                {/* Professional Pulse Loader */}
                <div className="flex justify-center mb-4">
                  <PulseLoader 
                    color="#3B82F6" 
                    size={8} 
                    margin={6}
                    speedMultiplier={0.7}
                  />
                </div>

                {/* Processing Steps */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${loadingMessage.includes('analiz') ? 'bg-blue-500 animate-pulse' : 'bg-blue-500'}`}></div>
                      Content analyzing
                    </span>
                    {!loadingMessage.includes('analiz') && <span>✓</span>}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${loadingMessage.includes('değerlendiriliyor') ? 'bg-blue-500 animate-pulse' : loadingMessage.includes('analiz') ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                      {loadingMessage.includes('analiz') ? 'Content analyzing' : 'Answers evaluating'}
                    </span>
                    {!loadingMessage.includes('analiz') && !loadingMessage.includes('değerlendiriliyor') && <span>✓</span>}
                  </div>
                </div>

                {/* AI Model Info Card */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
                    <p className="text-sm text-blue-700 font-semibold">
                      🚀 {geminiAI.getCurrentModelName()}
                    </p>
                  </div>
                  <p className="text-xs text-blue-600">
                    Powered by OpenAI
                  </p>
                </div>

                {/* Dynamic Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-300 h-2 rounded-full transition-all duration-1000 ease-out " 
                      style={{
                        width: loadingProgress.total > 0 ? `${(loadingProgress.current / loadingProgress.total) * 100}%` :
                               loadingMessage.includes('analiz') ? '35%' : 
                               loadingMessage.includes('değerlendiriliyor') ? '75%' : '90%'
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-400">
                      {loadingProgress.total > 0 ? `${loadingProgress.current}/${loadingProgress.total} section` : 'Processing...'}
                    </p>
                    <p className="text-xs text-blue-400">
                      {loadingProgress.total > 0 ? `${Math.round((loadingProgress.current / loadingProgress.total) * 100)}%` : ''}
                    </p>
                  </div>
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