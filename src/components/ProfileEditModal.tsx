'use client';

import React, { useState } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserProfile, updatePassword } from '@/store/slices/authSlice';
import { User as UserType } from '@/types/user';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

export default function ProfileEditModal({ isOpen, onClose, user, onUpdate }: ProfileEditModalProps) {
  const dispatch = useAppDispatch();
  const { error: authError } = useAppSelector((state: any) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user starts typing
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error('First name and last name are required');
      }

      if (!formData.email.trim()) {
        throw new Error('Email is required');
      }

      // Check if password change is requested
      const isPasswordChange = formData.currentPassword && formData.newPassword;

      if (isPasswordChange) {
        if (formData.newPassword.length < 6) {
          throw new Error('New password must be at least 6 characters');
        }

        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('New passwords do not match');
        }
      }

      // Update user profile
      const updatedUserData: Partial<UserType> = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim()
      };

      // If password change is requested, update password
      if (isPasswordChange) {
        await dispatch(updatePassword({ 
          currentPassword: formData.currentPassword, 
          newPassword: formData.newPassword 
        })).unwrap();
      }

      // Update user profile in database
      await dispatch(updateUserProfile({ 
        uid: user.uid, 
        profile: updatedUserData 
      })).unwrap();

      // Update local user object
      const updatedUser = {
        ...user,
        ...updatedUserData
      };

      onUpdate(updatedUser);
      setSuccess('Profile updated successfully!');
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Profile update error:', error);
      // Redux error handling
      if (error?.message) {
        setError(error.message);
      } else if (authError) {
        setError(authError);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // Reset form to original values
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
      setSuccess('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Edit Profile</h2>
              <p className="text-xs sm:text-sm text-gray-600">Update your personal information</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <p className="text-green-800 font-medium text-sm sm:text-base">{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black text-sm sm:text-base"
                  placeholder="First name"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black text-sm sm:text-base"
                  placeholder="Last name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black text-sm sm:text-base"
                  placeholder="email@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Change Password (Optional)</h3>
            <p className="text-xs sm:text-sm text-gray-600">Leave blank if you dont want to change your password</p>
            
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black text-sm sm:text-base"
                  placeholder="Current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-black"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black text-sm sm:text-base"
                  placeholder="New password (min 6 characters)"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-black"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black text-sm sm:text-base"
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-black"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 