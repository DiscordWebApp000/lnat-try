'use client';

import { useState } from 'react';
import { User, Permission } from '@/types/user';
import { permissionService } from '@/lib/firebase-services';
import { 
  X, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Key,
  Crown,
  Save,
  AlertCircle
} from 'lucide-react';

interface UserPermissionModalProps {
  user: User;
  permissions: Permission[];
  userPermissions: string[]; // Active permissions from userPermissions collection
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  currentAdminUid: string;
}

export default function UserPermissionModal({
  user,
  permissions,
  userPermissions,
  isOpen,
  onClose,
  onUpdate,
  currentAdminUid
}: UserPermissionModalProps) {
  const [localPermissions, setLocalPermissions] = useState<string[]>(userPermissions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [permissionExpirations, setPermissionExpirations] = useState<{[key: string]: string}>({});

  if (!isOpen) return null;

  const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const togglePermission = (permissionId: string) => {
    setLocalPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(p => p !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const hasChanges = () => {
    const currentSet = new Set(userPermissions);
    const localSet = new Set(localPermissions);
    
    return currentSet.size !== localSet.size || 
           [...currentSet].some(p => !localSet.has(p));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Eski yetkileri kaldır
      for (const permission of userPermissions) {
        if (!localPermissions.includes(permission)) {
          await permissionService.revokePermission(user.uid, permission);
        }
      }

      // Yeni yetkileri ekle
      for (const permission of localPermissions) {
        if (!userPermissions.includes(permission)) {
          const expirationDate = permissionExpirations[permission];
          if (expirationDate) {
            // Expiration date ile yetki ver
            await permissionService.grantTemporaryPermission(
              user.uid, 
              permission, 
              currentAdminUid, 
              new Date(expirationDate)
            );
          } else {
            // Kalıcı yetki ver
            await permissionService.grantPermission(user.uid, permission, currentAdminUid);
          }
        }
      }

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating permissions:', error);
      setError('An error occurred while updating permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-red-100 text-xs sm:text-sm">Permission Management</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
          {/* User Info */}
          <div className="bg-gray-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-500">Email</p>
                  <p className="font-medium text-black text-sm sm:text-base truncate">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-black text-sm sm:text-base">{formatDate(user.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Last Login</p>
                  <p className="font-medium text-black text-sm sm:text-base">{formatDate(user.lastLoginAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Role</p>
                  <div className="flex items-center gap-2">
                    {user.role === 'admin' && <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />}
                    <p className="font-medium capitalize text-black text-sm sm:text-base">{user.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Trial Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-blue-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Subscription & Trial Status
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Trial Status */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Trial Status</p>
                  {user.trialEndsAt ? (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const now = new Date();
                        let trialEnd: Date;
                        
                        if (user.trialEndsAt instanceof Date) {
                          trialEnd = user.trialEndsAt;
                        } else if (user.trialEndsAt && typeof (user.trialEndsAt as any).toDate === 'function') {
                          trialEnd = (user.trialEndsAt as any).toDate();
                        } else {
                          trialEnd = new Date(user.trialEndsAt);
                        }
                        
                        if (isNaN(trialEnd.getTime())) {
                          return (
                            <span className="text-xs font-medium text-red-600">Invalid Date</span>
                          );
                        }
                        
                        const diffTime = trialEnd.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays > 0) {
                          return (
                            <>
                              <span className="text-xs font-medium text-green-600">Active ({diffDays} days left)</span>
                              <span className="text-xs text-gray-500">until {formatDate(trialEnd)}</span>
                            </>
                          );
                        } else {
                          return (
                            <span className="text-xs font-medium text-red-600">Expired ({Math.abs(diffDays)} days ago)</span>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-gray-600">No Trial</span>
                  )}
                </div>
              </div>

              {/* Subscription Status */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Subscription</p>
                  {user.subscription ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        user.subscription.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : user.subscription.status === 'trial'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.subscription.status === 'active' ? 'Premium' : 
                         user.subscription.status === 'trial' ? 'Trial' : 
                         user.subscription.status}
                      </span>
                      {user.subscription.planName && (
                        <span className="text-xs text-gray-500">({user.subscription.planName})</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-gray-600">No Subscription</span>
                  )}
                </div>
              </div>

              {/* Account Status */}
              <div className="flex items-center gap-2 sm:gap-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Account Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      user.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Access Level */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Access Level</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      if (user.role === 'admin') {
                        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">Admin Access</span>;
                      } else if (user.subscription?.status === 'active') {
                        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">Premium Access</span>;
                      } else if (user.trialEndsAt && new Date(user.trialEndsAt) > new Date()) {
                        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">Trial Access</span>;
                      } else {
                        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">No Access</span>;
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Abonelik Geçmişi */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-green-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Abonelik Geçmişi & İstatistikler
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Total Subscriptions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Abonelik Sayısı</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">
                      {user.subscription ? '1' : '0'}
                    </span>
                    <span className="text-xs text-gray-500">aktif abonelik</span>
                  </div>
                </div>
              </div>

              {/* Trial Count */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Trial Durumu</p>
                  <div className="flex items-center gap-2">
                    {user.trialEndsAt ? (
                      <>
                        <span className="text-lg font-bold text-blue-600">1</span>
                        <span className="text-xs text-gray-500">aktif trial</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-gray-600">0</span>
                        <span className="text-xs text-gray-500">trial yok</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Subscription Plan */}
              <div className="flex items-center gap-2 sm:gap-3">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Abonelik Planı</p>
                  <div className="flex items-center gap-2">
                    {user.subscription?.planName ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                        {user.subscription.planName === 'trial' ? 'Trial' : 
                         user.subscription.planName === 'premium' ? 'Premium' : 
                         user.subscription.planName}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-600">Plan yok</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto Renew */}
              <div className="flex items-center gap-2 sm:gap-3">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Otomatik Yenileme</p>
                  <div className="flex items-center gap-2">
                    {user.subscription?.autoRenew ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                        Pasif
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current vs New Permissions */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Current Permissions */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                Current Permissions
              </h3>
              <div className="space-y-2">
                {user.permissions.length === 0 ? (
                  <p className="text-gray-500 text-xs sm:text-sm">No permissions assigned yet</p>
                ) : (
                  user.permissions.map(permissionId => {
                    const permission = permissions.find(p => p.id === permissionId);
                    return (
                      <div
                        key={permissionId}
                        className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                        <span className="text-xs sm:text-sm font-medium text-blue-800">
                          {permission?.name || permissionId}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* New Permissions */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                New Permissions
                {hasChanges() && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                    Changes available
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {localPermissions.length === 0 ? (
                  <p className="text-gray-500 text-xs sm:text-sm">No permissions selected</p>
                ) : (
                  localPermissions.map(permissionId => {
                    const permission = permissions.find(p => p.id === permissionId);
                    return (
                      <div
                        key={permissionId}
                        className="flex items-center gap-2 p-2 bg-green-50 rounded-lg"
                      >
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        <span className="text-xs sm:text-sm font-medium text-green-800">
                          {permission?.name || permissionId}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Permission Selection */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Permissions</h3>
            {permissions.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <Key className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-gray-600 mb-2 text-sm sm:text-base">No permissions defined yet</p>
                <p className="text-xs sm:text-sm text-gray-500">No permissions defined in the system.</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {permissions.map(permission => {
                  const isSelected = localPermissions.includes(permission.id);
                  return (
                    <div
                      key={permission.id}
                      className={`p-3 sm:p-4 border-2 rounded-xl transition-all ${
                        isSelected
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div 
                        onClick={() => togglePermission(permission.id)}
                        className="cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                              isSelected ? 'bg-green-500' : 'bg-gray-200'
                            }`}>
                              {isSelected ? (
                                <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                              ) : (
                                <XCircle className="w-3 h-3 sm:w-5 sm:h-5 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm sm:text-base ${
                                isSelected ? 'text-green-900' : 'text-gray-900'
                              }`}>
                                {permission.name}
                              </h4>
                              <p className={`text-xs sm:text-sm ${
                                isSelected ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {permission.description}
                              </p>
                            </div>
                          </div>
                          <Key className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            isSelected ? 'text-green-600' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                      
                      {/* Expiration Date Input - Only show if permission is selected */}
                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <label className="block text-xs font-medium text-green-700 mb-2">
                            Expiration Date (Optional)
                          </label>
                          <input
                            type="datetime-local"
                            value={permissionExpirations[permission.id] || ''}
                            onChange={(e) => {
                              setPermissionExpirations(prev => ({
                                ...prev,
                                [permission.id]: e.target.value
                              }));
                            }}
                            className="w-full px-3 py-2 text-xs border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            placeholder="Leave empty for permanent permission"
                          />
                          <p className="text-xs text-green-600 mt-1">
                            Leave empty for permanent permission, or set a specific date/time
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                <p className="text-red-700 text-xs sm:text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="text-xs sm:text-sm text-gray-500">
              {hasChanges() && (
                <span className="flex items-center gap-2 text-orange-600">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  Unsaved changes available
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges() || saving}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {saving ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}