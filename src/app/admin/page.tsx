'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchAllPermissions } from '@/store/slices/permissionsSlice';
import { fetchAllUsers } from '@/store/slices/authSlice';
import Navbar from '@/components/Navbar';
import { User, Permission } from '@/types/user';
import { 
  Users, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Crown,
  Clock,
  Mail,
  Calendar,
  Edit,
  AlertCircle,
} from 'lucide-react';
import UserPermissionModal from '@/components/UserPermissionModal';
import AdminSupportPanel from '@/components/AdminSupportPanel';
import AdminSubscriptionPanel from '@/components/AdminSubscriptionPanel';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminPage() {
  const { currentUser, loading } = useAuth();
  const dispatch = useAppDispatch();
  const { users, loading: loadingUsers } = useAppSelector((state: any) => state.auth);
  const { permissions } = useAppSelector((state: any) => state.permissions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const [filterTrial, setFilterTrial] = useState<'all' | 'active' | 'expired' | 'expiring' | 'premium' | 'no-trial'>('all');
  const [filterLastLogin, setFilterLastLogin] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDays, setCustomDays] = useState<number>(7);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'support' | 'subscription'>('users');
  const [grantingTrials, setGrantingTrials] = useState<Set<string>>(new Set());
  const router = useRouter();

  const loadAdminData = useCallback(async () => {
    try {
      // Use Redux actions instead of direct service calls
      await Promise.all([
        dispatch(fetchAllUsers()),
        dispatch(fetchAllPermissions())
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  }, [dispatch]);

  const getTrialStatus = (user: User) => {
    if (!user.trialEndsAt) {
      return {
        status: 'no-trial',
        message: 'Trial yok',
        daysLeft: 0,
        className: 'bg-gray-100 text-gray-600'
      };
    }

    const now = new Date();
    let trialEnd: Date;
    
    // Handle different date types - same logic as formatDate
    if (user.trialEndsAt instanceof Date) {
      trialEnd = user.trialEndsAt;
    } else if (user.trialEndsAt && typeof (user.trialEndsAt as any).toDate === 'function') {
      trialEnd = (user.trialEndsAt as any).toDate();
    } else if (typeof user.trialEndsAt === 'string' || typeof user.trialEndsAt === 'number') {
      trialEnd = new Date(user.trialEndsAt);
    } else {
      return {
        status: 'invalid',
        message: 'Geçersiz tarih',
        daysLeft: 0,
        className: 'bg-red-100 text-red-600'
      };
    }
    
    if (isNaN(trialEnd.getTime())) {
      return {
        status: 'invalid',
        message: 'Geçersiz tarih',
        daysLeft: 0,
        className: 'bg-red-100 text-red-600'
      };
    }
    
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 7) {
      return {
        status: 'long-active',
        message: `${diffDays} gün kaldı`,
        daysLeft: diffDays,
        className: 'bg-blue-100 text-blue-700'
      };
    } else if (diffDays > 3) {
      return {
        status: 'active',
        message: `${diffDays} gün kaldı`,
        daysLeft: diffDays,
        className: 'bg-green-100 text-green-700'
      };
    } else if (diffDays > 0) {
      return {
        status: 'expiring',
        message: `${diffDays} gün kaldı`,
        daysLeft: diffDays,
        className: 'bg-orange-100 text-orange-700'
      };
    } else if (diffHours > 0) {
      return {
        status: 'expiring-hours',
        message: `${diffHours} saat kaldı`,
        daysLeft: 0,
        className: 'bg-orange-100 text-orange-700'
      };
    } else {
      return {
        status: 'expired',
        message: `${Math.abs(diffDays)} gün önce sona erdi`,
        daysLeft: diffDays,
        className: 'bg-red-100 text-red-700'
      };
    }
  };

  useEffect(() => {
    if (!loading && (!currentUser || currentUser.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [loading, currentUser, router]);

  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      loadAdminData();
    }
  }, [currentUser, loadAdminData]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handlePermissionsUpdate = async () => {
    await loadAdminData();
  };



  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    // Trial filter
    let matchesTrial = true;
    if (filterTrial !== 'all') {
      const trialStatus = getTrialStatus(user);
      
      switch (filterTrial) {
        case 'active':
          // Aktif trial (4+ gün kaldı)
          matchesTrial = trialStatus.status === 'active' || trialStatus.status === 'long-active';
          break;
        case 'expired':
          // Süresi dolmuş trial
          matchesTrial = trialStatus.status === 'expired';
          break;
        case 'expiring':
          // Yakında sona erecek (1-3 gün)
          matchesTrial = trialStatus.status === 'expiring';
          break;
        case 'premium':
          // Premium abone (subscription status active)
          matchesTrial = user.subscription?.status === 'active';
          break;
        case 'no-trial':
          // Trial yok ve premium da değil
          matchesTrial = !user.trialEndsAt && user.subscription?.status !== 'active';
          break;
        default:
          matchesTrial = true;
      }
    }

    // Last login filter
    let matchesLastLogin = true;
    if (filterLastLogin !== 'all' && user.lastLoginAt) {
      const now = new Date();
      let lastLogin: Date | null = null;
      
      // Handle different date types
      if (user.lastLoginAt instanceof Date) {
        lastLogin = user.lastLoginAt;
      } else if (user.lastLoginAt && typeof (user.lastLoginAt as any).toDate === 'function') {
        lastLogin = (user.lastLoginAt as any).toDate();
      } else if (typeof user.lastLoginAt === 'string' || typeof user.lastLoginAt === 'number') {
        lastLogin = new Date(user.lastLoginAt);
      } else {
        matchesLastLogin = false;
      }
      
      if (matchesLastLogin && lastLogin && !isNaN(lastLogin.getTime())) {
        const diffTime = now.getTime() - lastLogin.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filterLastLogin) {
          case 'today':
            matchesLastLogin = diffDays === 0;
            break;
          case 'week':
            matchesLastLogin = diffDays <= 7;
            break;
          case 'month':
            matchesLastLogin = diffDays <= 30;
            break;
          case 'custom':
            matchesLastLogin = diffDays <= customDays;
            break;
          default:
            matchesLastLogin = true;
        }
      }
    } else if (filterLastLogin !== 'all') {
      matchesLastLogin = false;
    }
    
    return matchesSearch && matchesRole && matchesTrial && matchesLastLogin;
  });

  const formatDate = (date: Date | any | undefined) => {
    if (!date) {
      return 'Invalid Date';
    }
    
    let validDate: Date;
    
    // Handle different date types
    if (date instanceof Date) {
      validDate = date;
    } else if (date && typeof date.toDate === 'function') {
      // Firestore Timestamp
      validDate = date.toDate();
    } else if (typeof date === 'string' || typeof date === 'number') {
      // String or number timestamp
      validDate = new Date(date);
    } else {
      return 'Invalid Date';
    }
    
    // Check if the resulting date is valid
    if (isNaN(validDate.getTime())) {
      return 'Invalid Date';
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(validDate);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Admin permission required to access this page.</p>
          <Link href="/dashboard" className="text-red-600 hover:text-red-700 font-medium">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      {/* Header */}
      <Navbar 
        showBackButton={true}
        backUrl="/dashboard"
      />

      {/* Admin Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <AdminSidebar 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {activeTab === 'users' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Active Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {users.filter((u: User) => u.isActive).length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-red-500 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Admin Count</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {users.filter((u: User) => u.role === 'admin').length}
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Trial Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {users.filter((u: User) => {
                    const trialStatus = getTrialStatus(u);
                    return trialStatus.status === 'active' || trialStatus.status === 'long-active';
                  }).length}
                </p>
                <p className="text-xs text-gray-500">
                  {users.filter((u: User) => getTrialStatus(u).status === 'expired').length} expired
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-xs sm:text-sm font-medium">Premium Users</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {users.filter((u: User) => u.subscription?.status === 'active').length}
                </p>
                <p className="text-xs text-gray-500">
                  {users.filter((u: User) => !u.trialEndsAt && u.subscription?.status !== 'active').length} no access
                </p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="User search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base text-black"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as 'all' | 'user' | 'admin')}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none text-sm sm:text-base text-black  "
                >
                  <option value="all">Tüm Roller</option>
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:w-5" />
                <select
                  value={filterTrial}
                  onChange={(e) => setFilterTrial(e.target.value as 'all' | 'active' | 'expired' | 'expiring' | 'premium' | 'no-trial')}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none text-sm sm:text-base text-black"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif Trial (4+ gün)</option>
                  <option value="expiring">Yakında Sona Erecek (1-3 gün)</option>
                  <option value="expired">Süresi Dolmuş</option>
                  <option value="premium">Premium Abone</option>
                  <option value="no-trial">Trial Yok</option>
                </select>
              </div>
            </div>

            <div className="sm:w-48">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <select
                  value={filterLastLogin}
                  onChange={(e) => setFilterLastLogin(e.target.value as 'all' | 'today' | 'week' | 'month' | 'custom')}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent appearance-none text-sm sm:text-base text-black"
                >
                  <option value="all">Tüm Giriş Zamanları</option>
                  <option value="today">Bugün Giriş Yapan</option>
                  <option value="week">Son 7 Günde Giriş</option>
                  <option value="month">Son 30 Günde Giriş</option>
                  <option value="custom">Özel Gün Sayısı</option>
                </select>
              </div>
            </div>

            {/* Custom Days Input */}
            {filterLastLogin === 'custom' && (
              <div className="sm:w-32">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={customDays}
                  onChange={(e) => setCustomDays(parseInt(e.target.value) || 1)}
                  placeholder="Gün"
                  className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base text-black"
                />
              </div>
            )}
            
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              User List ({filteredUsers.length})
            </h2>
          </div>

          {loadingUsers ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Users loading...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-sm sm:text-base">User not found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((user: User) => (
                <div 
                  key={user.uid} 
                  className={`p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-all group ${
                    user.subscription?.status === 'active' 
                      ? 'border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-white shadow-md' 
                      : 'border-l-4 border-transparent'
                  }`}
                  onClick={() => handleUserClick(user)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {user.role === 'admin' && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                <Crown className="w-3 h-3" />
                                <span>Admin</span>
                              </div>
                            )}
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              user.isActive 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.isActive ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                            </div>
                            {/* Premium Status Badge */}
                            {user.subscription?.status === 'active' && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                <Crown className="w-3 h-3" />
                                <span>Premium</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Member: {formatDate(user.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Last login: {formatDate(user.lastLoginAt)}</span>
                          </div>
                        </div>

                        {/* Trial Period Information */}
                        {user.trialEndsAt && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-gray-700">Trial Period:</span>
                            </div>
                            <div className="ml-6">
                              {(() => {
                                const trialStatus = getTrialStatus(user);
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${trialStatus.className}`}>
                                      {trialStatus.message}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Bitiş: {formatDate(user.trialEndsAt)}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Trial Expiry Warning */}
                        {user.trialEndsAt && (() => {
                          const now = new Date();
                          let trialEnd: Date;
                          
                          // Handle different date types - same logic as formatDate
                          if (user.trialEndsAt instanceof Date) {
                            trialEnd = user.trialEndsAt;
                          } else if (user.trialEndsAt && typeof (user.trialEndsAt as any).toDate === 'function') {
                            trialEnd = (user.trialEndsAt as any).toDate();
                          } else if (typeof user.trialEndsAt === 'string' || typeof user.trialEndsAt === 'number') {
                            trialEnd = new Date(user.trialEndsAt);
                          } else {
                            return null; // Invalid date format
                          }
                          
                          if (isNaN(trialEnd.getTime())) {
                            return null; // Invalid date
                          }
                          
                          const diffTime = trialEnd.getTime() - now.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          
                          if (diffDays <= 3 && diffDays >= 0) {
                            return (
                              <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-orange-500" />
                                  <span className="text-xs text-orange-700 font-medium">
                                    Trial expires soon! ({diffDays === 0 ? 'Today' : `${diffDays} days`})
                                  </span>
                                </div>
                              </div>
                            );
                          } else if (diffDays < 0) {
                            return (
                              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-xs text-red-700 font-medium">
                                    Trial expired! ({Math.abs(diffDays)} days ago)
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">
                              Permissions: {user.permissions.length}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {user.permissions.slice(0, 3).map((permissionId: string) => {
                                const permission = permissions.find((p: Permission) => p.id === permissionId);
                                return (
                                  <span
                                    key={permissionId}
                                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                  >
                                    {permission?.name || permissionId}
                                  </span>
                                );
                              })}
                              {user.permissions.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                  +{user.permissions.length - 3}
                                </span>
                              )}
                              {user.permissions.length === 0 && (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                  No permissions
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit className="w-4 h-4 text-gray-500" />
                            <span className="text-xs sm:text-sm text-gray-500">Edit</span>
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                
                                // Prevent multiple clicks
                                if (grantingTrials.has(user.uid)) {
                                  console.log('🔒 Trial already being granted for user:', user.uid);
                                  return;
                                }
                                
                                try {
                                  // Set loading state
                                  setGrantingTrials(prev => new Set(prev).add(user.uid));
                                  console.log('🔍 Granting trial to user:', user.uid);
                                  
                                  const response = await fetch('/api/admin/grant-trial', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      userId: user.uid,
                                      grantedBy: currentUser.uid,
                                      reason: 'Admin tarafından 1 hafta trial verildi'
                                    })
                                  });
                                  
                                  const result = await response.json();
                                  console.log('🔍 Grant trial result:', result);
                                  
                                  if (result.success) {
                                    const endDate = new Date(result.data.newEndDate);
                                    const formattedDate = endDate.toLocaleDateString('tr-TR', {
                                      year: 'numeric',
                                      month: 'long', 
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    });
                                    
                                    alert(`✅ ${user.firstName} ${user.lastName} kullanıcısına 1 haftalık trial süresi verildi!\n\n📅 Yeni bitiş tarihi: ${formattedDate}\n⏰ Eklenen süre: ${result.data.daysAdded} gün`);
                                    await loadAdminData();
                                  } else {
                                    alert('❌ Hata: ' + result.error);
                                  }
                                } catch (error) {
                                  console.error('Error granting trial period:', error);
                                  alert('Trial süresi verirken hata oluştu.');
                                } finally {
                                  // Clear loading state
                                  setGrantingTrials(prev => {
                                    const newSet = new Set(prev);
                                    newSet.delete(user.uid);
                                    return newSet;
                                  });
                                }
                              }}
                              disabled={grantingTrials.has(user.uid)}
                              className={`px-2 py-1 rounded text-xs transition-all flex items-center gap-1 ${
                                grantingTrials.has(user.uid)
                                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                  : 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                              }`}
                              title={(() => {
                                if (grantingTrials.has(user.uid)) {
                                  return 'Trial veriliyor...';
                                }
                                const trialStatus = getTrialStatus(user);
                                if (trialStatus.status === 'no-trial') {
                                  return 'Yeni 7 günlük trial ver';
                                } else if (trialStatus.status === 'expired') {
                                  return 'Yeni 7 günlük trial ver';
                                } else {
                                  return `Mevcut trial'ı 7 gün uzat (${trialStatus.daysLeft} gün kaldı)`;
                                }
                              })()}
                            >
                              {grantingTrials.has(user.uid) ? (
                                <>
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                  İşleniyor...
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3" />
                                  +1 Week
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
              </div>
            </>
          )}

          {activeTab === 'support' && (
            <div className="h-full">
              <AdminSupportPanel />
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="h-full">
              <AdminSubscriptionPanel />
            </div>
          )}
        </main>
      </div>

      {/* User Permission Modal */}
      {selectedUser && (
        <UserPermissionModal
          user={selectedUser}
          permissions={permissions}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onUpdate={handlePermissionsUpdate}
          currentAdminUid={currentUser.uid}
        />
      )}
    </div>
  );
}