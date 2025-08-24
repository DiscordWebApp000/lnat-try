'use client';

import { X, Lock, User, LogIn, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  toolDescription: string;
  isLoggedIn: boolean;
  hasPermission: boolean;
  toolPath: string;
}

export default function PermissionModal({
  isOpen,
  onClose,
  toolName,
  toolDescription,
  isLoggedIn,
  hasPermission,
  toolPath
}: PermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{toolName}</h2>
                <p className="text-blue-100 text-sm">{toolDescription}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isLoggedIn ? (
            // Login gerekli
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                You need to login to use this tool.
              </h3>
              <p className="text-gray-600 mb-6">
                You need to login to use this tool.
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : !hasPermission ? (
            // Yetki yok
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Permission Required!
              </h3>
              <p className="text-gray-600 mb-6">
                You need to be granted permission to use this tool!
              </p>
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>Back to Dashboard!</span>
                </Link>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Yetki var - yönlendir
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                You have permission!
              </h3>
              <p className="text-gray-600 mb-6">
                You can now use this tool.
              </p>
              <div className="space-y-3">
                <Link
                  href={toolPath}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Start</span>
                </Link>
                <button
                  onClick={onClose}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 