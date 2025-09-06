'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { 
  LogOut, 
  BookOpen, 
  PenTool, 
  SplitSquareVertical,
  Brain,
  BarChart3,
  Shield,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  variant?: 'default' | 'tool';
}

export default function Navbar({ 
  title, 
  description, 
  showBackButton = false, 
}: NavbarProps) {
  const { currentUser } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser());
      router.push('/');
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get page-specific info if not provided
  const getPageInfo = () => {
    if (title && description) {
      return { title, description, icon: getPageIcon() };
    }

    switch (pathname) {
      case '/':
        return { 
          title: 'PREP AI Platform', 
          description: 'AI-Powered Law Exam Preparation', 
          icon: BookOpen 
        };
      case '/dashboard':
        return { 
          title: 'PREP AI Platform', 
          description: `Welcome, ${currentUser?.firstName || 'User'}!`, 
          icon: BarChart3 
        };
      case '/text-question-analysis':
        return { 
          title: 'Text-Question Analysis', 
          description: 'AI-Supported Text-Question Analysis', 
          icon: SplitSquareVertical 
        };
      case '/question-generator':
        return { 
          title: 'PREP AI Platform', 
          description: 'AI-Supported Law Exam Preparation', 
          icon: Brain 
        };
      case '/writing-evaluator':
        return { 
          title: 'Essay Evaluator', 
          description: 'AI-Supported Essay Analysis', 
          icon: PenTool 
        };
      case '/exam-results':
        return { 
          title: 'Exam Results', 
          description: 'Your complete exam history', 
          icon: BarChart3 
        };
      case '/admin':
        return { 
          title: 'Admin Panel', 
          description: 'User and permission management', 
          icon: Shield 
        };
      default:
        return { 
          title: 'PREP AI Platform', 
          description: 'AI-Powered Law Exam Preparation', 
          icon: BookOpen 
        };
    }
  };

  const getPageIcon = () => {
    switch (pathname) {
      case '/text-question-analysis':
        return SplitSquareVertical;
      case '/question-generator':
        return Brain;
      case '/writing-evaluator':
        return PenTool;
      case '/dashboard':
        return BarChart3;
      case '/exam-results':
        return BarChart3;
      case '/admin':
        return Shield;
      default:
        return BookOpen;
    }
  };

  const getPageColor = () => {
    switch (pathname) {
      case '/text-question-analysis':
        return 'bg-green-600';
      case '/question-generator':
        return 'bg-blue-600';
      case '/writing-evaluator':
        return 'bg-purple-600';
      case '/dashboard':
        return 'bg-green-600';
      case '/exam-results':
        return 'bg-green-600';
      case '/admin':
        return 'bg-red-600';
      default:
        return 'bg-indigo-600';
    }
  };

  const pageInfo = getPageInfo();
  const Icon = pageInfo.icon;
  const colorClass = getPageColor();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`w-10 h-10 ${colorClass} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-200 ${showBackButton ? 'ml-2' : ''}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900 group-hover:text-gray-700 transition-colors">{pageInfo.title}</h1>
                <p className="text-xs text-gray-500">{pageInfo.description}</p>
              </div>
            </Link>
          </div>
          
          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Navigation Links - Desktop */}
            {currentUser && (
              <nav className="hidden md:flex items-center gap-1">
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === '/dashboard' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
                
                {currentUser.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      pathname === '/admin' 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </nav>
            )}

            {/* User Section */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {/* User Info - Desktop */}
                <Link 
                  href="/dashboard"
                  className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{currentUser.firstName}</span>
                    <span className="text-xs text-gray-500 ml-1">• {currentUser.role}</span>
                  </div>
                </Link>

                {/* Logout Button - Desktop */}
                {pathname !== '/' && (
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                )}

                {/* Mobile Menu Button */}
                {currentUser && (
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200"
                  >
                    {isMobileMenuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/login?mode=register" 
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && currentUser && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <div className="px-4 py-3 space-y-2">
              {/* User Info - Mobile */}
              <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {currentUser.firstName.charAt(0)}{currentUser.lastName.charAt(0)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{currentUser.firstName} {currentUser.lastName}</span>
                  <div className="text-xs text-gray-500">{currentUser.role}</div>
                </div>
              </div>

              {/* Navigation Links - Mobile */}
              <nav className="space-y-1">
                <Link 
                  href="/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    pathname === '/dashboard' 
                      ? 'text-green-600 bg-green-50' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Link>
                
                {currentUser.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      pathname === '/admin' 
                        ? 'text-red-600 bg-red-50' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </nav>

              {/* Logout Button - Mobile */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}