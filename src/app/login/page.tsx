'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, registerUser, resetPassword } from '@/store/slices/authSlice';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

function LoginPageContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state: any) => state.auth);
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const searchParams = useSearchParams();

  // Check for mode parameter and set register mode if needed
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        await dispatch(loginUser({ email, password })).unwrap();
        setSuccess('Login successful! You are being redirected...');
        setTimeout(() => router.push('/dashboard'), 1000);
      } else {
        await dispatch(registerUser({ email, password, firstName, lastName })).unwrap();
        setSuccess('Registration successful! You can now login.');
        setIsLogin(true);
      }
    } catch (error: any) {
      // Redux error handling
      if (error?.message) {
        let errorMessage = error.message;
        if (errorMessage.includes('auth/email-already-in-use')) {
          errorMessage = 'This email address is already in use. Try logging in.';
        } else if (errorMessage.includes('auth/weak-password')) {
          errorMessage = 'Password is too weak. It should be at least 6 characters long.';
        } else if (errorMessage.includes('auth/invalid-email')) {
          errorMessage = 'Invalid email address.';
        } else if (errorMessage.includes('auth/user-not-found')) {
          errorMessage = 'User with this email address not found.';
        } else if (errorMessage.includes('auth/wrong-password')) {
          errorMessage = 'Wrong password.';
        } else if (errorMessage.includes('auth/too-many-requests')) {
          errorMessage = 'Too many attempts. Please try again later.';
        }
        setError(errorMessage);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Enter your email address to reset your password');
      return;
    }

    try {
      await dispatch(resetPassword(email)).unwrap();
      setSuccess('Password reset email sent!');
    } catch (error: any) {
      // Redux error handling
      if (error?.message) {
        let errorMessage = error.message;
        if (errorMessage.includes('auth/user-not-found')) {
          errorMessage = 'User with this email address not found.';
        } else if (errorMessage.includes('auth/invalid-email')) {
          errorMessage = 'Invalid email address.';
        }
        setError(errorMessage);
      } else {
        setError('Password reset error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Login' : 'Register'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Login to your account' : 'Create a new account'}
          </p>
        </div>

       

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        placeholder="Your First Name"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                        placeholder="Your Last Name"
                        required
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                  placeholder="example@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-black"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Forgot Password
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
                {error.includes('zaten kullanımda') && (
                  <p className="text-red-600 text-xs mt-2">
                    💡 Try logging in with this email or use a different email.
                  </p>
                )}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            )}
            
           

            <button
              type="submit"
              disabled={localLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {localLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isLogin ? 'Logging in...' : 'Registering...'}
                </div>
              ) : (
                isLogin ? 'Login' : 'Register'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="ml-1 text-green-600 hover:text-green-700 font-medium"
              >
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}