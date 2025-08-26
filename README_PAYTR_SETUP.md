# 🆕 PayTR iFrame Ödeme Sistemi Kurulumu

Bu dokümantasyon, Lnat projesinde PayTR iFrame ödeme sisteminin nasıl kurulacağını açıklar.

## 🔄 **Değişiklik: Link API → iFrame Sistemi**

**Eski Sistem:** PayTR Link API (ödeme linki oluşturma)
**Yeni Sistem:** PayTR iFrame API (güvenli ödeme formu)

## 🎯 **iFrame Sisteminin Avantajları**

✅ **Güvenlik:** Kullanıcı hiçbir zaman siteden ayrılmaz
✅ **UX:** Daha iyi kullanıcı deneyimi
✅ **Güvenilirlik:** Link sistemindeki sorunlar çözüldü
✅ **Entegrasyon:** Daha kolay entegrasyon
✅ **Responsive:** Mobil uyumlu

## 🚀 **Kurulum Adımları**

### **1. Environment Variables**

```bash
# .env.local dosyasına ekleyin
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_CALLBACK_URL=https://yourdomain.com/api/paytr-iframe-webhook
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### **2. PayTR Dashboard Ayarları**

1. **PayTR Mağaza Paneli** → **Destek & Kurulum** → **Ayarlar**
2. **Bildirim URL:** `https://yourdomain.com/api/paytr-iframe-webhook`
3. **SSL Sertifikası:** HTTPS kullanıyorsanız SSL aktif olmalı

### **3. API Endpoints**

#### **Ödeme Formu Oluşturma**
```typescript
POST /api/payment/create-iframe
```

**Request Body:**
```json
{
  "userId": "user_123",
  "amount": 99.99,
  "currency": "TRY",
  "planType": "premium",
  "userEmail": "user@example.com",
  "userName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "iframe_token_here",
  "iframeData": {
    "token": "iframe_token_here",
    "iframeUrl": "https://www.paytr.com/odeme/guvenli/token"
  }
}
```

#### **Webhook Endpoint**
```typescript
POST /api/paytr-iframe-webhook
```

**Webhook Data:**
```json
{
  "merchant_oid": "order_user123_timestamp_random",
  "status": "success",
  "total_amount": 9999,
  "hash": "security_hash_here",
  "payment_type": "card",
  "currency": "TL"
}
```

## 🔧 **Teknik Detaylar**

### **Hash Hesaplama**
```typescript
// iFrame Token için
const hashString = merchant_id + user_ip + merchant_oid + email + 
                   payment_amount + user_basket + no_installment + 
                   max_installment + currency + test_mode;
const paytrToken = crypto.createHmac('sha256', merchant_key)
  .update(hashString + merchant_salt)
  .digest('base64');

// Webhook doğrulama için
const hashString = merchant_oid + merchant_salt + status + total_amount;
const calculatedHash = crypto.createHmac('sha256', merchant_key)
  .update(hashString)
  .digest('base64');
```

### **Sepet Formatı**
```typescript
const basket = [
  [
    "Premium Abonelik - premium", // Ürün adı
    "99.99",                      // Fiyat
    1                            // Adet
  ]
];
const userBasket = Buffer.from(JSON.stringify(basket)).toString('base64');
```

## 📱 **Frontend Kullanımı**

### **iFrame Component**
```tsx
import IframePaymentForm from '@/components/IframePaymentForm';

export default function PaymentPage() {
  return (
    <div>
      <h1>Ödeme Sayfası</h1>
      <IframePaymentForm />
    </div>
  );
}
```

### **iFrame Resizer Script**
```html
<script src="https://www.paytr.com/js/iframeResizer.min.js"></script>
<iframe 
  src="https://www.paytr.com/odeme/guvenli/{token}"
  id="paytriframe" 
  frameBorder="0"
  scrolling="no" 
  style="width: 100%; minHeight: 600px"
/>
<script>iFrameResizer({},'#paytriframe');</script>
```

## 🔒 **Güvenlik Önlemleri**

1. **Hash Doğrulama:** Tüm webhook'lar hash ile doğrulanır
2. **Rate Limiting:** API endpoint'lerinde rate limiting
3. **Input Validation:** Tüm kullanıcı girdileri validate edilir
4. **Environment Variables:** Hassas bilgiler environment'da saklanır

## 🧪 **Test Etme**

### **Development Test**
1. `NEXT_PUBLIC_PAYTR_TEST_MODE=true`
2. PayTR test kartları kullanın
3. Dış IP adresi gerekli (localhost çalışmaz)

### **Test Kartları**
- **Başarılı:** 4355084355084358
- **Başarısız:** 4355084355084358 (yanlış CVV)

## 📊 **Monitoring & Logging**

### **Console Logs**
```typescript
console.log('✅ PayTR iFrame configuration validated successfully');
console.log('🎯 Payment Method: iFrame (Token-based)');
console.log('🔗 Callback URL:', callbackUrl);
```

### **Webhook Logs**
```typescript
console.log(`iFrame Webhook: Subscription activated for user ${userId}`);
console.log(`iFrame Webhook: Failed payment for user ${userId}`);
```

## 🚨 **Hata Kodları**

PayTR iFrame webhook'larında dönen hata kodları:

| Kod | Mesaj | Açıklama |
|-----|--------|----------|
| 0 | DEĞİŞKEN | Detaylı hata mesajı |
| 1 | Kimlik Doğrulama yapılmadı | SMS doğrulama eksik |
| 2 | Kimlik Doğrulama başarısız | Yanlış SMS kodu |
| 3 | Güvenlik kontrolü başarısız | Fraud tespiti |
| 6 | Müşteri vazgeçti | Ödeme sayfasından ayrıldı |
| 8 | Taksit yapılamaz | Kart taksit desteklemiyor |
| 9 | İşlem yetkisi yok | Kart işlem yetkisi yok |
| 10 | 3D Secure gerekli | 3D Secure zorunlu |
| 11 | Güvenlik uyarısı | Fraud riski |
| 99 | Teknik hata | Entegrasyon hatası |

## 🔄 **Migration Checklist**

- [ ] Environment variables güncellendi
- [ ] PayTR Dashboard'da webhook URL değiştirildi
- [ ] Eski Link API endpoint'leri kaldırıldı
- [ ] Yeni iFrame endpoint'leri test edildi
- [ ] Frontend component'ler güncellendi
- [ ] Webhook doğrulama test edildi
- [ ] Test ödemeleri yapıldı
- [ ] Production'a deploy edildi

## 📞 **Destek**

Herhangi bir sorun yaşarsanız:
1. Console loglarını kontrol edin
2. PayTR Dashboard'da işlem durumunu kontrol edin
3. Webhook response'larını test edin
4. Environment variables'ları doğrulayın

---

**Not:** Bu sistem PayTR'ın resmi iFrame API dokümantasyonuna uygun olarak geliştirilmiştir.
