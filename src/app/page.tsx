'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, BookOpen, FileText, ArrowRight, Star, Zap, Users, Target, PenTool } from 'lucide-react';
import PermissionModal from '@/components/forms/PermissionModal';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function Home() {
  const { currentUser,  hasPermission } = useAuth();
  const router = useRouter();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    toolName: string;
    toolDescription: string;
    toolPath: string;
  }>({
    isOpen: false,
    toolName: '',
    toolDescription: '',
    toolPath: ''
  });

  const handleToolClick = async (toolName: string, toolDescription: string, toolPath: string) => {
    // Eğer kullanıcı giriş yapmamışsa modal aç
    if (!currentUser) {
      setModalState({
        isOpen: true,
        toolName,
        toolDescription,
        toolPath
      });
      return;
    }

    // Eğer kullanıcı giriş yapmışsa yetki kontrolü yap
    const toolKey = toolPath.replace('/', '') as 'text-question-analysis' | 'question-generator' | 'writing-evaluator';
    
    try {
      const hasAccess = await hasPermission(toolKey);
      if (hasAccess) {
        // Yetki varsa direkt tool'a git
        router.push(toolPath);
      } else {
        // Yetki yoksa dashboard'a git
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      router.push('/dashboard');
    }
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <Navbar 
        title="PREP AI Platform"
        description="Smart Learning Assistant"
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200/50 px-4 py-2 rounded-full mb-8 shadow-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Learning Platform</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Prepare for
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-2">
                LNAT Exam
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Analyze texts, generate questions, and evaluate your performance with AI-powered tools. 
              Enhance your learning experience with modern technology.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">400+</div>
                <div className="text-sm text-gray-600 font-medium">Sample Questions</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">99%</div>
                <div className="text-sm text-gray-600 font-medium">Accuracy</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/50">
                <div className="text-2xl md:text-3xl font-bold text-indigo-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600 font-medium">Availability</div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-indigo-200 rounded-full opacity-10 animate-pulse delay-2000"></div>
      </section>

      {/* Tools Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              AI Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Choose the tool that fits your needs and accelerate your learning process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Tool 1: Soru Üretici */}
            <div 
              onClick={() => handleToolClick(
                'Question Generator',
                'Upload any text and AI will automatically generate questions based on that text.',
                '/question-generator'
              )}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Question Generator
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">Text → Questions</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed text-base">
                    Upload any text and AI will automatically generate questions based on that text. 
                    Improve your reading comprehension skills.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span>PDF and TXT file support</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span>Automatic question generation</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span>Difficulty level adjustment</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <span>{currentUser ? 'Get Started' : 'Login'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-700 font-medium">Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool 2: Metin-Soru Analizi */}
            <div 
              onClick={() => handleToolClick(
                'Text-Question Analysis',
                'Upload text and questions together, AI will automatically separate and present them in quiz format.',
                '/text-question-analysis'
              )}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        Text-Question Analysis
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">Text + Questions → Quiz</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed text-base">
                    Upload text and questions together, AI will automatically separate and present them in quiz format. 
                    Full exam experience with multi-section support.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span>Multi-section support</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span>Automatic text-question separation</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      <span>Real-time evaluation</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-green-600 font-semibold">
                      <span>{currentUser ? 'Get Started' : 'Login'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700 font-medium">New</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tool 3: Yazı Değerlendirici */}
            <div 
              onClick={() => handleToolClick(
                'Writing Evaluator',
                'Send your writing to AI and receive detailed analysis and feedback.',
                '/writing-evaluator'
              )}
              className="group cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                <div className="p-10">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <PenTool className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                        Writing Evaluator
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">Text → Analysis</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed text-base">
                    Send your writing to AI and receive detailed analysis and feedback. 
                    Scoring out of 100 and improvement suggestions.
                  </p>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span>Scoring out of 100</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span>Detailed feedback</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                      <span>Improvement suggestions</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-purple-600 font-semibold">
                      <span>{currentUser ? 'Get Started' : 'Login'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700 font-medium">Premium</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why PREP AI Platform?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our features supported by modern technology enhance your learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered</h3>
              <p className="text-gray-600 leading-relaxed">
                Powered by AI, continuously learning and evolving system
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Target-Focused</h3>
              <p className="text-gray-600 leading-relaxed">
                Specifically designed for PREP exam with real exam format questions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">User-Friendly</h3>
              <p className="text-gray-600 leading-relaxed">
                Simple and intuitive interface, suitable design for users of all levels
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Start Your Learning Journey
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start using for free now and prepare for the PREP exam
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={currentUser ? "/question-generator" : "/dashboard"} className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                <BookOpen className="w-5 h-5" />
                Question Generator
              </Link>
              <Link href={currentUser ? "/text-question-analysis" : "/dashboard"} className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30">
                <FileText className="w-5 h-5" />
                Text Analysis
              </Link>
              <Link href={currentUser ? "/writing-evaluator" : "/dashboard"} className="inline-flex items-center justify-center gap-2 bg-white/20 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30">
                <PenTool className="w-5 h-5" />
                Writing Evaluator
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer variant="dark" />

      {/* Permission Modal */}
      <PermissionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        toolName={modalState.toolName}
        toolDescription={modalState.toolDescription}
        isLoggedIn={!!currentUser}
        hasPermission={false}
        toolPath={modalState.toolPath}
      />
    </div>
  );
}