import { PAYTR_CONFIG } from './paytr-config';
import { PaymentRequest, PaymentResponse, PaytrIframeData, PaytrTokenResponse } from './payment-types';
import crypto from 'crypto';

export class PaytrIframeService {
  private config = PAYTR_CONFIG.SERVER;

  async createIframePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Check if required environment variables are set
      if (!this.config.MERCHANT_ID || !this.config.MERCHANT_KEY || !this.config.MERCHANT_SALT) {
        throw new Error('PayTR configuration is incomplete. Check environment variables.');
      }

      // Benzersiz sipariş numarası oluştur
      const merchantOid = this.generateMerchantOid(paymentRequest.userId);
      
      // Kullanıcı IP adresi (development'ta dış IP kullanılmalı)
      const userIp = await this.getUserIP();
      
      // Sepet içeriği oluştur (Base64 encoded)
      const userBasket = this.createUserBasket(paymentRequest);
      
      // Hash oluştur
      const paytrToken = this.generateHash(
        this.config.MERCHANT_ID + 
        userIp + 
        merchantOid + 
        paymentRequest.userEmail + 
        Math.round(paymentRequest.amount * 100) + 
        userBasket + 
        this.config.NO_INSTALLMENT + 
        this.config.MAX_INSTALLMENT + 
        paymentRequest.currency + 
        (this.config.TEST_MODE ? 1 : 0)
      );

      const iframeData: PaytrIframeData = {
        merchant_id: this.config.MERCHANT_ID,
        user_ip: userIp,
        merchant_oid: merchantOid,
        email: paymentRequest.userEmail,
        payment_amount: Math.round(paymentRequest.amount * 100), // Kuruş cinsinden
        currency: paymentRequest.currency,
        test_mode: this.config.TEST_MODE ? 1 : 0,
        no_installment: this.config.NO_INSTALLMENT,
        max_installment: this.config.MAX_INSTALLMENT,
        user_name: paymentRequest.userName,
        user_address: paymentRequest.userAddress,
        user_phone: paymentRequest.userPhone,
        merchant_ok_url: `${this.config.APP_URL}/payment/success?oid=${merchantOid}`,
        merchant_fail_url: `${this.config.APP_URL}/payment/failed?oid=${merchantOid}`,
        timeout_limit: this.config.TIMEOUT_LIMIT,
        debug_on: this.config.DEBUG_ON,
        lang: this.config.LANG,
        user_basket: userBasket,
        paytr_token: paytrToken
      };

      // PayTR Token API'ye istek gönder
      const tokenResponse = await this.getIframeToken(iframeData);
      
      if (tokenResponse.status === 'success' && tokenResponse.token) {
        return {
          success: true,
          token: tokenResponse.token,
          message: 'iFrame ödeme formu hazırlandı',
          iframeData: {
            token: tokenResponse.token,
            iframeUrl: `${PAYTR_CONFIG.CLIENT.IFRAME_URL}/${tokenResponse.token}`
          }
        };
      } else {
        return {
          success: false,
          error: tokenResponse.reason || 'Token alınamadı',
          message: 'PayTR servis hatası'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: 'iFrame ödeme hatası',
        message: error instanceof Error ? error.message : 'Teknik bir hata oluştu'
      };
    }
  }

  private async getIframeToken(iframeData: PaytrIframeData): Promise<PaytrTokenResponse> {
    try {
      const response = await fetch(this.config.GET_TOKEN_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(iframeData as any)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PayTR Token API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      return result as PaytrTokenResponse;

    } catch (error) {
      throw error;
    }
  }

  private createUserBasket(paymentRequest: PaymentRequest): string {
    const basket = [
      [
        `Premium Abonelik - ${paymentRequest.planType}`,
        paymentRequest.amount.toFixed(2),
        1
      ]
    ];
    
    return Buffer.from(JSON.stringify(basket)).toString('base64');
  }

  private generateHash(data: string): string {
    return crypto.createHmac('sha256', this.config.MERCHANT_KEY || '')
      .update(data + this.config.MERCHANT_SALT)
      .digest('base64');
  }

  private generateMerchantOid(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    // Sadece alfanumerik karakterler kullan, özel karakterleri kaldır
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
    return `order${cleanUserId}${timestamp}${random}`;
  }

  private async getUserIP(): Promise<string> {
    // Development'ta dış IP kullanılmalı
    if (process.env.NODE_ENV === 'development') {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch (error) {
        console.warn('Could not get external IP, using localhost');
        return '127.0.0.1';
      }
    }
    
    // Production'da gerçek IP kullanılacak
    return '127.0.0.1'; // Bu değer production'da gerçek IP ile değiştirilecek
  }

  isTestMode(): boolean {
    return this.config.TEST_MODE;
  }
}

export const paytrIframeService = new PaytrIframeService();
