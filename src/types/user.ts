export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  permissions: string[];
  createdAt: Date;
  lastLoginAt: Date;
  isActive: boolean;
  subscription?: Subscription;
  trialEndsAt?: Date;
  
  // Subscription tracking
  currentSubscriptionPlanId?: string; // Aktif subscription plan ID'si
  subscriptionHistory?: SubscriptionPayment[]; // Abonelik geçmişi
  totalSubscriptions?: number; // Toplam kaç kez abonelik alındı
  lastSubscriptionDate?: Date; // Son abonelik tarihi
  subscriptionPermissions?: string[]; // Subscription'dan gelen permission'lar
  
  // YENİ: Cached permission status
  permissionStatus?: {
    permissions: string[];
    source: 'admin' | 'trial' | 'subscription' | 'none';
    trialActive: boolean;
    subscriptionActive: boolean;
    lastChecked: Date;
  };
}

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  institution?: string;
  studyLevel?: string;
}

export interface ExamResult {
  id: string;
  userId: string;
  examType: 'text-question-analysis' | 'question-generator' | 'writing-evaluator';
  examDate: Date;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unansweredQuestions: number;
  totalTime: number;
  averageTime: number;
  score: number;
  evaluation?: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    studyPlan: {
      focusAreas: string[];
      practiceQuestions: number;
      estimatedImprovement: string;
    };
  };
  answers: Record<number, string>;
  questionTimes: Record<number, number>;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  tool: 'text-question-analysis' | 'question-generator' | 'writing-evaluator' | 'all';
}

export interface UserPermission {
  userId: string;
  permissionId: string;
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  status: 'open' | 'in-progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
  isReadByAdmin: boolean;
  isReadByUser: boolean;
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin';
  message: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  planId: string; // SubscriptionPlan ID'si
  planName: 'trial' | 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate: Date;
  trialEndsAt?: Date;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
  permissions: string[]; // Bu subscription'da verilen tool permission'ları
  paymentHistory: SubscriptionPayment[]; // Ödeme geçmişi
  // Trial süresi eklendi bilgisi
  trialDaysAdded?: number; // Eklenen trial gün sayısı
  originalPlanDuration?: number; // Orijinal plan süresi
  totalDuration?: number; // Toplam süre (plan + trial)
}

export interface TrialPeriod {
  id: string;
  userId: string;
  grantedBy: string; // admin uid
  grantedAt: Date;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  reason?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'trial' | 'basic' | 'premium' | 'enterprise';
  displayName: string;
  description: string; // Açıklama alanı eklendi
  price: number;
  currency: 'TRY' | 'USD' | 'EUR';
  duration: number; // days
  features: string[];
  maxUsage: number;
  isActive: boolean;
  isDefault: boolean;
  permissions: string[]; // Tool permission ID'leri
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string; // admin uid
}

export interface AdminSubscriptionSettings {
  id: string;
  defaultCurrency: 'TRY' | 'USD' | 'EUR';
  trialDays: number;
  autoRenewal: boolean;
  gracePeriod: number; // days after expiration
  updatedAt: Date;
  updatedBy: string; // admin uid
}

// Subscription ödeme geçmişi
export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentId: string; // PayTR payment ID
  linkId: string; // PayTR link ID
  status: 'success' | 'failed' | 'pending';
  paymentDate: Date;
  planName: string;
  planDisplayName: string;
  permissions: string[]; // Bu ödemede verilen permission'lar
  createdAt: Date;
  updatedAt: Date;
} 