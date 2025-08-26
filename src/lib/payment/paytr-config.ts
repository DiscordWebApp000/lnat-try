// PayTR Konfigürasyonu - iFrame Sistemi (Environment Variables)
export const PAYTR_CONFIG = {
  // Client-side (public) konfigürasyon
  CLIENT: {
    TEST_MODE: process.env.NEXT_PUBLIC_PAYTR_TEST_MODE === 'true',
    CURRENCY: process.env.NEXT_PUBLIC_PAYTR_CURRENCY || 'TRY',
    API_URL: process.env.NEXT_PUBLIC_PAYTR_API_URL || 'https://www.paytr.com/odeme/api',
    IFRAME_URL: process.env.NEXT_PUBLIC_PAYTR_IFRAME_URL || 'https://www.paytr.com/odeme/guvenli'
  },
  
  // Server-side (private) konfigürasyon
  SERVER: {
    MERCHANT_ID: process.env.PAYTR_MERCHANT_ID,
    MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY,
    MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT,
    PAYTR_CALLBACK_URL: process.env.PAYTR_CALLBACK_URL,
    API_URL: process.env.PAYTR_API_URL || 'https://www.paytr.com/odeme/api',
    TEST_MODE: process.env.PAYTR_TEST_MODE === 'true',
    APP_URL: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL,
    // iFrame için yeni alanlar
    GET_TOKEN_URL: process.env.PAYTR_GET_TOKEN_URL || 'https://www.paytr.com/odeme/api/get-token',
    TIMEOUT_LIMIT: parseInt(process.env.PAYTR_TIMEOUT_LIMIT || '30'),
    DEBUG_ON: process.env.PAYTR_DEBUG_ON === 'true' ? 1 : 0,
    NO_INSTALLMENT: parseInt(process.env.PAYTR_NO_INSTALLMENT || '0'),
    MAX_INSTALLMENT: parseInt(process.env.PAYTR_MAX_INSTALLMENT || '0'),
    LANG: process.env.PAYTR_LANG || 'tr'
  }
};

// Environment variables kontrolü ve logging
export function validatePayTRConfig() {
  const required = [
    'PAYTR_MERCHANT_ID',
    'PAYTR_MERCHANT_KEY', 
    'PAYTR_MERCHANT_SALT'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required PayTR environment variables:', missing);
    return false;
  }
  
  if (!process.env.PAYTR_CALLBACK_URL) {
    console.warn('⚠️ PAYTR_CALLBACK_URL not set, using default');
  }
  
  if (!process.env.APP_URL) {
    console.warn('⚠️ APP_URL not set, using localhost:3000');
  }
  
  console.log('✅ PayTR iFrame configuration validated successfully');
  console.log('🔗 Callback URL:', process.env.PAYTR_CALLBACK_URL || 'default');
  console.log('🌐 App URL:', process.env.APP_URL || 'localhost:3000');
  console.log('🔧 Environment:', process.env.NODE_ENV);
  console.log('🎯 Payment Method: iFrame (Token-based)');
  console.log('🚫 Link API: Removed (Deprecated)');
  
  return true;
}

// Production'da environment variables kontrolü
if (process.env.NODE_ENV === 'production') {
  if (!process.env.PAYTR_MERCHANT_ID || !process.env.PAYTR_MERCHANT_KEY || !process.env.PAYTR_MERCHANT_SALT) {
    throw new Error('PayTR environment variables are required in production');
  }
}
