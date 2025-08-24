'use client';

import React from 'react';
import Link from 'next/link';
import { Brain } from 'lucide-react';

interface FooterProps {
  variant?: 'dark' | 'light' | 'minimal';
  className?: string;
}

export default function Footer({ variant = 'dark', className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={`bg-white border-t mt-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>© {currentYear} PREP AI Platform. Powered by AI</p>
          </div>
        </div>
      </footer>
    );
  }

  if (variant === 'light') {
    return (
      <footer className={`bg-white border-t mt-16 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600">
            <p>© {currentYear} PREP AI Platform. Powered by AI</p>
          </div>
        </div>
      </footer>
    );
  }

  // Dark variant (default)
  return (
    <footer className={`bg-gray-900 text-white py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold">PREP AI Platform</h3>
          </div>
          <p className="text-gray-400 mb-6">
            Prepare for the future with AI-powered learning platform
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400">
            <span>© {currentYear} PREP AI Platform</span>
            <span className="hidden sm:inline">•</span>
            <span>Powered by AI</span>
            <span className="hidden sm:inline">•</span>
            <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/cookie-policy" className="text-blue-400 hover:text-blue-300 transition-colors">
              Cookie Policy
            </Link>
            <span className="hidden sm:inline">•</span>
            <Link href="/terms-and-conditions" className="text-blue-400 hover:text-blue-300 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


