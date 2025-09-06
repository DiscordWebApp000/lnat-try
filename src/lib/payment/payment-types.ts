export interface PaymentRequest {
  userId: string;
  amount: number;
  currency: 'TRY' | 'USD';
  planType: string; // Plan tipi artık esnek
  userEmail: string;
  userName: string;
  userPhone?: string;
  userAddress?: string;
}

// iFrame Token API için yeni interface
export interface PaytrIframeData {
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
  user_basket: string; // Base64 encoded JSON
  paytr_token: string; // Hash ile oluşturulan token
}

// iFrame Token Response
export interface PaytrTokenResponse {
  status: 'success' | 'failed';
  token?: string;
  reason?: string;
}

// iFrame ödeme formu için
export interface IframePaymentForm {
  token: string;
  iframeUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  token?: string;
  error?: string;
  message?: string;
  iframeData?: IframePaymentForm; // iFrame için ödeme formu
}

export interface WebhookData {
  merchant_oid: string;
  status: 'success' | 'failed';
  total_amount: number;
  hash: string;
  // Diğer Paytr webhook alanları
}

// PayTR iFrame webhook data
export interface IframeWebhookData {
  merchant_oid: string;
  status: 'success' | 'failed';
  total_amount: number;
  payment_amount: number;
  payment_type: string;
  currency: string;
  merchant_id: string;
  test_mode: number;
  hash: string;
  failed_reason_code?: string;
  failed_reason_msg?: string;
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
