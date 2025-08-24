// PayTR Konfigürasyonu
export const PAYTR_CONFIG = {
  // Client-side (public) konfigürasyon
  CLIENT: {
    TEST_MODE: process.env.NEXT_PUBLIC_PAYTR_TEST_MODE === 'true',
    CURRENCY: process.env.NEXT_PUBLIC_PAYTR_CURRENCY || 'TRY',
    API_URL: process.env.NEXT_PUBLIC_PAYTR_API_URL || 'https://www.paytr.com/odeme/api'
  },
  
  // Server-side (private) konfigürasyon
  SERVER: {
    MERCHANT_ID: process.env.PAYTR_MERCHANT_ID,
    MERCHANT_KEY: process.env.PAYTR_MERCHANT_KEY,
    MERCHANT_SALT: process.env.PAYTR_MERCHANT_SALT,
    PAYTR_CALLBACK_URL: process.env.PAYTR_CALLBACK_URL,
    API_URL: 'https://www.paytr.com/odeme/api',
    TEST_MODE: process.env.NODE_ENV !== 'production',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
};

// Production'da environment variables kontrolü
if (process.env.NODE_ENV === 'production') {
  if (!process.env.PAYTR_MERCHANT_ID || !process.env.PAYTR_MERCHANT_KEY || !process.env.PAYTR_MERCHANT_SALT) {
    throw new Error('PayTR environment variables are required in production');
  }
}
