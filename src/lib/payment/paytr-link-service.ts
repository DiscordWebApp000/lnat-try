import { PAYTR_CONFIG } from './paytr-config';
import { PaymentRequest, PaymentResponse, PaytrLinkData } from './payment-types';
import crypto from 'crypto';

export class PaytrLinkService {
  private config = PAYTR_CONFIG.SERVER;

  async createPaymentLink(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Check if required environment variables are set
      console.log('🔗 Environment variables check:');
      console.log('🔗 MERCHANT_ID:', this.config.MERCHANT_ID ? 'SET' : 'MISSING');
      console.log('🔗 MERCHANT_KEY:', this.config.MERCHANT_KEY ? 'SET' : 'MISSING');
      console.log('🔗 MERCHANT_SALT:', this.config.MERCHANT_SALT ? 'SET' : 'MISSING');
      
      if (!this.config.MERCHANT_ID || !this.config.MERCHANT_KEY || !this.config.MERCHANT_SALT) {
        throw new Error('PayTR configuration is incomplete. Check environment variables.');
      }

      console.log('🔗 Creating PayTR payment link...');
      
      const linkData: PaytrLinkData = {
        merchant_id: this.config.MERCHANT_ID,
        name: 'Premium Abonelik - Lnat AI Tools',
        price: Math.round(paymentRequest.amount * 100).toString(),
        currency: 'TL',
        max_installment: '1',
        link_type: 'product',
        lang: 'en',
        min_count: '1',
        max_count: '1',
        expiry_date: this.getExpiryDate(),
        debug_on: '1',
        test_mode: '1',
        user_email: paymentRequest.userEmail,
        callback_link: this.config.PAYTR_CALLBACK_URL || 'https://www.prep-ai.app',
        callback_id: `CB${Date.now()}`
      };
      
      if (paymentRequest.userName && paymentRequest.userName.trim()) {
        linkData.user_name = paymentRequest.userName;
      }

      console.log('🔗 Environment variables check:');
      console.log('🔗 PAYTR_CALLBACK_URL:', process.env.PAYTR_CALLBACK_URL);
      console.log('🔗 NODE_ENV:', process.env.NODE_ENV);
      console.log('🔗 APP_URL:', this.config.APP_URL);
      console.log('🔗 Using callback URL:', linkData.callback_link);
      console.log('🔗 Generated callback_id:', linkData.callback_id);
      console.log('🔗 Full linkData before API call:', JSON.stringify(linkData, null, 2));

      const required = linkData.name + linkData.price + linkData.currency + 
                      linkData.max_installment + linkData.link_type + linkData.lang + 
                      linkData.min_count;
      
      console.log('🔗 Hash generation debug:');
      console.log('🔗 Required string:', required);
      console.log('🔗 MERCHANT_SALT:', this.config.MERCHANT_SALT);
      console.log('🔗 Full hash string:', required + this.config.MERCHANT_SALT);
      
      const paytr_token = this.generateHash(required + this.config.MERCHANT_SALT);

      console.log('🔗 Sending request to PayTR Link API...');
      console.log('🔗 Hash string (PayTR format):', required + this.config.MERCHANT_SALT);
      console.log('🔗 Paytr token:', paytr_token);
      
      const requestBody = new URLSearchParams({
        ...linkData,
        paytr_token
      });
      
      if (linkData.callback_id) {
        requestBody.set('callback_id', linkData.callback_id);
        console.log('🔗 callback_id explicitly set in request body:', linkData.callback_id);
      } else {
        console.error('🔗 ERROR: callback_id is missing from linkData!');
      }
      
      console.log('🔗 Request body params:', requestBody.toString());
      console.log('🔗 Final request body keys:', Array.from(requestBody.keys()));
      console.log('🔗 callback_id in request body:', requestBody.get('callback_id'));
      console.log('🔗 Raw request body (querystring):', Object.entries(linkData).map(([k, v]) => `${k}=${v}`).join('&'));

      const response = await fetch('https://www.paytr.com/odeme/api/link/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody
      });

      console.log('🔗 PayTR API response status:', response.status);
      console.log('🔗 PayTR API response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔗 PayTR API error response:', errorText);
        throw new Error(`PayTR API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🔗 PayTR Link API response:', result);

      if (result.status === 'success') {
        return {
          success: true,
          token: result.id,
          message: 'Ödeme linki oluşturuldu',
          paymentUrl: result.link
        };
      } else {
        return {
          success: false,
          error: result.reason || 'Link oluşturulamadı',
          message: result.message || 'PayTR servis hatası'
        };
      }

    } catch (error) {
      console.error('🔗 PayTR Link creation error:', error);
      return {
        success: false,
        error: 'Link oluşturma hatası',
        message: error instanceof Error ? error.message : 'Teknik bir hata oluştu'
      };
    }
  }


  async deletePaymentLink(linkId: string): Promise<boolean> {
    try {
      if (!this.config.MERCHANT_ID || !this.config.MERCHANT_KEY || !this.config.MERCHANT_SALT) {
        throw new Error('PayTR configuration is incomplete. Check environment variables.');
      }

      console.log('🔗 Deleting payment link:', linkId);
      
      const hash = this.generateHash(linkId + this.config.MERCHANT_ID + this.config.MERCHANT_SALT);
      
      const response = await fetch('https://www.paytr.com/odeme/api/link/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          merchant_id: this.config.MERCHANT_ID,
          id: linkId,
          debug_on: '1',
          paytr_token: hash
        })
      });

      const result = await response.json();
      console.log('🔗 Delete response:', result);
      
      return result.status === 'success';
    } catch (error) {
      console.error('🔗 Link deletion error:', error);
      return false;
    }
  }


  async sendSMS(linkId: string, phoneNumber: string): Promise<boolean> {
    try {
      if (!this.config.MERCHANT_ID || !this.config.MERCHANT_KEY || !this.config.MERCHANT_SALT) {
        throw new Error('PayTR configuration is incomplete. Check environment variables.');
      }

      console.log('🔗 Sending SMS for link:', linkId, 'to:', phoneNumber);
      
      const hash = this.generateHash(linkId + this.config.MERCHANT_ID + phoneNumber + this.config.MERCHANT_SALT);
      
      const response = await fetch('https://www.paytr.com/odeme/api/link/send-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          merchant_id: this.config.MERCHANT_ID,
          id: linkId,
          cell_phone: phoneNumber,
          debug_on: '1',
          paytr_token: hash
        })
      });

      const result = await response.json();
      console.log('🔗 SMS response:', result);
      
      return result.status === 'success';
    } catch (error) {
      console.error('🔗 SMS sending error:', error);
      return false;
    }
  }


  async sendEmail(linkId: string, email: string): Promise<boolean> {
    try {
      if (!this.config.MERCHANT_ID || !this.config.MERCHANT_KEY || !this.config.MERCHANT_SALT) {
        throw new Error('PayTR configuration is incomplete. Check environment variables.');
      }

      console.log('🔗 Sending email for link:', linkId, 'to:', email);
      
      const hash = this.generateHash(linkId + this.config.MERCHANT_ID + email + this.config.MERCHANT_SALT);
      
      const response = await fetch('https://www.paytr.com/odeme/api/link/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          merchant_id: this.config.MERCHANT_ID,
          id: linkId,
          email: email,
          debug_on: '1',
          paytr_token: hash
        })
      });

      const result = await response.json();
      console.log('🔗 Email response:', result);
      
      return result.status === 'success';
    } catch (error) {
      console.error('🔗 Email sending error:', error);
      return false;
    }
  }


  private generateHash(data: string): string {
    return crypto.createHmac('sha256', this.config.MERCHANT_KEY || '')
      .update(data)
      .digest('base64');
  }


  private getExpiryDate(): string {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    return expiry.toISOString().slice(0, 19).replace('T', ' ');
  }


  private generateCallbackId(userId: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `cb_${userId}_${timestamp}_${random}`;
  }


  isTestMode(): boolean {
    return this.config.TEST_MODE;
  }
}

export const paytrLinkService = new PaytrLinkService();
