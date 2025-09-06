'use client';

import { EvaluationResult, Question } from '@/lib/gpt-ai';
import { Trophy, Target, Lightbulb, BookOpen, RefreshCw, Clock, Timer } from 'lucide-react';

interface EvaluationResultsProps {
  evaluation: EvaluationResult;
  questions: Question[];
  answers: Record<number, string>;
  onRestart: () => void;
  timeStats?: {questionTimes: Record<number, number>; totalTime: number; averageTime: number} | null;
}

export default function EvaluationResults({ 
  evaluation, 
  questions, 
  answers, 
  onRestart,
  timeStats
}: EvaluationResultsProps) {
  const correctAnswers = questions.filter(q => answers[q.id] === q.correctAnswer).length;
  const wrongAnswers = questions.filter(q => answers[q.id] && answers[q.id] !== q.correctAnswer).length;
  const skippedQuestions = questions.filter(q => !answers[q.id]).length;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '💪';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{getScoreEmoji(evaluation.overallScore)}</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Exam Result</h2>
        <div className={`text-4xl font-bold ${getScoreColor(evaluation.overallScore)}`}>
          %{evaluation.overallScore}
        </div>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
          <div className="text-sm text-green-700">Correct</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
          <div className="text-sm text-red-700">Wrong</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">{skippedQuestions}</div>
          <div className="text-sm text-gray-700">Skipped</div>
        </div>
      </div>

      {/* Time Statistics */}
      {timeStats && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Time Performance</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Total Time */}
            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
              <Timer className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{formatTime(timeStats.totalTime)}</div>
              <div className="text-sm text-blue-700">Total Time</div>
            </div>

            {/* Average Time */}
            <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
              <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{formatTime(timeStats.averageTime)}</div>
              <div className="text-sm text-green-700">Average Time per Question</div>
            </div>

            {/* Speed Rating */}
            <div className="bg-purple-50 p-4 rounded-lg text-center border border-purple-100">
              <div className="text-3xl mb-2">
                {timeStats.averageTime <= 60 ? '🚀' : timeStats.averageTime <= 120 ? '⚡' : '🐌'}
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {timeStats.averageTime <= 60 ? 'Very Fast' : timeStats.averageTime <= 120 ? 'Ideal' : 'Careful'}
              </div>
              <div className="text-sm text-purple-700">Speed Evaluation</div>
            </div>
          </div>

          {/* Individual Question Times */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-700 mb-3">Question-by-Question Details:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {questions.map((question) => {
                const questionTime = timeStats.questionTimes[question.id] || 0;
                const isCorrect = answers[question.id] === question.correctAnswer;
                const isAnswered = !!answers[question.id];
                const section = Math.floor(question.id / 100);
                const questionNum = question.id % 100;
                
                return (
                  <div key={question.id} className={`p-3 rounded-lg text-center border-2 ${
                    !isAnswered 
                      ? 'bg-gray-50 border-gray-200' 
                      : isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <span className="text-xs text-gray-500">S{section}Q{questionNum}</span>
                      {!isAnswered ? (
                        <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                      ) : isCorrect ? (
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-700">{formatTime(questionTime)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Strengths */}
      {evaluation.strengths.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">Your Strengths</h3>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {evaluation.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-green-800">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {evaluation.weaknesses.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-800">Areas to Improve</h3>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {evaluation.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-red-800">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {evaluation.recommendations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800">Recommendations</h3>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="space-y-2">
              {evaluation.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-blue-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Study Plan */}
      {evaluation.studyPlan && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-800">Study Plan</h3>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="space-y-3">
              <div>
                <strong className="text-purple-800">Focus Areas:</strong>
                <ul className="mt-1 space-y-1">
                  {evaluation.studyPlan.focusAreas.map((area, index) => (
                    <li key={index} className="text-purple-700 ml-4">• {area}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong className="text-purple-800">Recommended Question Count:</strong>
                <span className="text-purple-700 ml-2">{evaluation.studyPlan.practiceQuestions} question</span>
              </div>
              <div>
                <strong className="text-purple-800">Estimated Improvement:</strong>
                <span className="text-purple-700 ml-2">{evaluation.studyPlan.estimatedImprovement}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Question Review */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Question Analysis</h3>
        <div className="space-y-3">
          {questions.map((question, index) => {
            const userAnswer = answers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = !!userAnswer;

            return (
              <div 
                key={question.id} 
                className={`p-4 rounded-lg border-2 ${
                  isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : isAnswered 
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-800">Question {index + 1}</span>
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <div className="text-green-600 text-sm font-medium">✓ Correct</div>
                    ) : isAnswered ? (
                      <div className="text-red-600 text-sm font-medium">✗ Wrong</div>
                    ) : (
                      <div className="text-gray-600 text-sm font-medium">○ Empty</div>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{question.text}</p>
                <div className="text-sm">
                  <span className="text-gray-600">Your answer: </span>
                  <span className="font-medium text-black">
                    {isAnswered ? userAnswer : 'Answer not provided'}
                  </span>
                  {isAnswered && (
                    <>
                      <span className="text-gray-600 ml-2">| Correct answer: </span>
                      <span className="font-medium text-green-600">{question.correctAnswer}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Restart Button */}
      <div className="text-center">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          New Exam
        </button>
      </div>
    </div>
  );
} 