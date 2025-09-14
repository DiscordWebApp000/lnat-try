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

      // Benzersiz sipariş numarası oluştur (plan ID ile)
      const merchantOid = this.generateMerchantOid(paymentRequest.userId, paymentRequest.planId);
      
      console.log('🔍 PayTR SERVICE: Creating payment for plan:', {
        planType: paymentRequest.planType,
        planId: paymentRequest.planId,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        merchantOid
      });
      
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

      const merchantOkUrl = `${this.config.APP_URL}/payment/success?oid=${merchantOid}`;
      const merchantFailUrl = `${this.config.APP_URL}/payment/failed?oid=${merchantOid}`;
      
      console.log('🔗 PayTR iFrame URL\'leri:');
      console.log('✅ Success URL:', merchantOkUrl);
      console.log('❌ Fail URL:', merchantFailUrl);
      console.log('🌐 App URL:', this.config.APP_URL);
      
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
        user_phone: this.formatPhoneNumber(paymentRequest.userPhone),
        merchant_ok_url: merchantOkUrl,
        merchant_fail_url: merchantFailUrl,
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
    // Plan ID'sini user_basket'te kodla
    const basket = [
      [
        `PLAN_${paymentRequest.planId}_${paymentRequest.planType.toUpperCase()}_Abonelik`,
        paymentRequest.amount.toFixed(2),
        1
      ]
    ];
    
    console.log('🔍 PayTR Service: Creating user_basket:', {
      planType: paymentRequest.planType,
      planId: paymentRequest.planId,
      basket: basket,
      base64: Buffer.from(JSON.stringify(basket)).toString('base64')
    });
    
    return Buffer.from(JSON.stringify(basket)).toString('base64');
  }

  private generateHash(data: string): string {
    return crypto.createHmac('sha256', this.config.MERCHANT_KEY || '')
      .update(data + this.config.MERCHANT_SALT)
      .digest('base64');
  }

  private generateMerchantOid(userId: string, planId?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6); // 4 karakter random
    
    // Sadece alfanumerik karakterler kullan, özel karakterleri kaldır
    const cleanUserId = userId.replace(/[^a-zA-Z0-9]/g, '');
    const cleanPlanId = planId ? planId.replace(/[^a-zA-Z0-9]/g, '') : '';
    
    // Plan ID'sini belirgin şekilde ayırmak için prefix kullan
    const planPrefix = planId ? `plan${cleanPlanId}` : '';
    
    // 64 karakter limitini aşmamak için kontrol et
    let merchantOid = `order${cleanUserId}${planPrefix}${timestamp}${random}`;
    
    // Eğer 64 karakteri aşıyorsa, user ID'yi kısalt
    if (merchantOid.length > 64) {
      const maxUserIdLength = 64 - (`order${planPrefix}${timestamp}${random}`.length);
      const truncatedUserId = cleanUserId.substring(0, Math.max(8, maxUserIdLength));
      merchantOid = `order${truncatedUserId}${planPrefix}${timestamp}${random}`;
    }
    
    console.log('🔍 Generated Merchant OID:', {
      userId: cleanUserId,
      planId: cleanPlanId,
      planPrefix,
      merchantOid,
      length: merchantOid.length
    });
    
    return merchantOid;
  }

  private async getUserIP(): Promise<string> {
    // Development'ta dış IP kullanılmalı
    if (process.env.NODE_ENV === 'development') {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
      } catch {
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

  private formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return '';
    
    // Sadece rakamları al
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Türkiye telefon numarası formatı kontrolü
    if (digitsOnly.startsWith('90') && digitsOnly.length >= 12) {
      // +90 ile başlıyorsa, 90'ı kaldır
      return digitsOnly.substring(2);
    } else if (digitsOnly.startsWith('0') && digitsOnly.length >= 11) {
      // 0 ile başlıyorsa, 0'ı kaldır
      return digitsOnly.substring(1);
    } else if (digitsOnly.length >= 10) {
      // Direkt 10+ haneli ise olduğu gibi kullan
      return digitsOnly;
    }
    
    // Geçersiz format
    return digitsOnly;
  }
}

export const paytrIframeService = new PaytrIframeService();
