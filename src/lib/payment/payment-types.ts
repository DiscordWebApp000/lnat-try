export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: 'TRY' | 'USD';
  planType: 'premium';
  userEmail: string;
  userName: string;
  userPhone?: string;
  userAddress?: string;
}

export interface PaytrPaymentData {
  merchant_id: string;
  user_ip: string;
  merchant_oid: string;
  email: string;
  payment_amount: number;
  currency: string;
  test_mode: number;
  no_installment: number;
  max_installment: number;
  user_name: string;
  user_address?: string;
  user_phone?: string;
  merchant_ok_url: string;
  merchant_fail_url: string;
  timeout_limit: number;
  debug_on: number;
  lang: string;
  hash: string;
}

// PayTR Link API için yeni interface
export interface PaytrLinkData {
  merchant_id: string;
  name: string;
  price: string; // Kuruş cinsinden string
  currency: string;
  max_installment: string;
  link_type: 'product' | 'collection';
  lang: string;
  min_count: string;
  max_count: string;
  expiry_date: string;
  callback_link: string; // Zorunlu - callback URL (PayTR Link API gereksinimi)
  callback_id: string; // Zorunlu - callback ID (PayTR Link API gereksinimi)
  debug_on: string;
  test_mode?: string; // Opsiyonel - test mode
  user_name?: string;
  user_email?: string;
}

export interface PaymentResponse {
  success: boolean;
  token?: string;
  error?: string;
  message?: string;
  paymentUrl?: string; // Link API için ödeme URL'i
}

export interface WebhookData {
  merchant_oid: string;
  status: 'success' | 'failed';
  total_amount: number;
  hash: string;
  // Diğer Paytr webhook alanları
}

// PayTR Link API webhook data
export interface LinkWebhookData {
  id: string; // Link ID
  merchant_oid: string;
  status: 'success' | 'failed';
  total_amount: number;
  payment_amount: number;
  payment_type: string;
  currency: string;
  callback_id?: string;
  merchant_id: string;
  test_mode: number;
  hash: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'trial' | 'premium';
  price: number;
  currency: 'TRY' | 'USD';
  duration: number; // days
  features: string[];
  maxUsage: number;
  isActive: boolean;
}
