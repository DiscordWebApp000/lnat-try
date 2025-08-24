# 🚀 PayTR Link API Ödeme Sistemi Kurulum Rehberi

## 🔒 Güvenlik Özellikleri

### ✅ **Güvenli Yapı:**
- **Server-side hash oluşturma** - Client'da hiçbir secret key yok
- **Rate limiting** - 5 istek/dakika sınırı
- **Input validation** - Tüm girişler doğrulanır
- **CSRF protection** - CSRF token ile koruma
- **Webhook verification** - Hash doğrulama
- **Secure headers** - Güvenlik başlıkları
- **Link API** - Modern PayTR Link API entegrasyonu

### 🚨 **Güvenlik Açıkları Kapatıldı:**
- ❌ Client-side key exposure
- ❌ Hash manipulation
- ❌ Unlimited API calls
- ❌ Invalid input injection
- ❌ CSRF attacks
- ❌ Eski iframe sistemi

## 📋 Gereksinimler

### 1. PayTR Hesabı
- [PayTR.com](https://www.paytr.com) üzerinden hesap oluşturun
- Test ortamı için test bilgilerini alın
- Production ortamı için gerçek bilgileri alın

### 2. Environment Variables (GÜVENLİ)
`.env.local` dosyası oluşturun:

```bash
# SADECE SERVER-SIDE (client'da görünmez) - GÜVENLİ
PAYTR_MERCHANT_ID=your_test_merchant_id
PAYTR_MERCHANT_KEY=your_test_key
PAYTR_MERCHANT_SALT=your_test_salt

# Client-side'da sadece public bilgiler
NEXT_PUBLIC_PAYTR_TEST_MODE=true
NEXT_PUBLIC_PAYTR_CURRENCY=TRY
NEXT_PUBLIC_PAYTR_API_URL=https://www.paytr.com/odeme/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🛠️ Kurulum Adımları

### 1. PayTR Dashboard Ayarları
1. **Test Mode**: Development'ta açık, production'da kapalı
2. **Webhook URL**: `https://yourdomain.com/api/paytr-webhook`
3. **Success URL**: `https://yourdomain.com/payment/success`
4. **Fail URL**: `https://yourdomain.com/payment/failed`

### 2. Test Ortamı
- Test kartları ile ödeme testleri yapın
- Webhook'ları test edin
- Hash doğrulamasını kontrol edin
- Rate limiting'i test edin

### 3. Production Ortamı
- Gerçek PayTR bilgilerini kullanın
- SSL sertifikası gerekli
- Webhook güvenliği için IP whitelist ekleyin

## 🔧 Kullanım

### 1. Ödeme Formu (Subscription Sayfasında)
```tsx
import PaymentForm from '@/components/PaymentForm';

export default function SubscriptionPage() {
  return (
    <div>
      <h1>Premium Abonelik</h1>
      <PaymentForm />
    </div>
  );
}
```

### 2. Tool Erişim Kontrolü
```tsx
import { ToolAccessGuard } from '@/components/ToolAccessGuard';

export default function ToolPage() {
  return (
    <ToolAccessGuard toolName="text-question-analysis">
      {/* Tool içeriği */}
    </ToolAccessGuard>
  );
}
```

## 🚨 Güvenlik

### 1. Webhook Doğrulama
- Hash doğrulaması zorunlu
- IP whitelist önerilen
- HTTPS zorunlu
- Callback ID validation

### 2. Environment Variables
- Production bilgileri client-side'da görünmez
- Server-side'da hash oluşturulur
- Test bilgileri production'da kullanılmaz

### 3. API Güvenliği
- Rate limiting: 5 istek/dakika
- Input validation
- CSRF protection
- Secure headers

## 📱 Test

### 1. Test Kartları
- **Visa**: 4111111111111111
- **Mastercard**: 5555555555554444
- **CVV**: 123
- **Expiry**: 12/25

### 2. Test Senaryoları
- Başarılı ödeme linki oluşturma
- Başarılı ödeme
- Başarısız ödeme
- Webhook işleme
- Abonelik aktivasyonu
- Rate limiting
- Input validation

## 🔍 Sorun Giderme

### 1. Hash Hatası
- Merchant key ve salt kontrol edin
- Hash string formatını kontrol edin
- Test mode ayarını kontrol edin

### 2. Webhook Hatası
- URL formatını kontrol edin
- HTTPS zorunluluğunu kontrol edin
- Firewall ayarlarını kontrol edin

### 3. Ödeme Linki Hatası
- Test mode ayarını kontrol edin
- API endpoint'lerini kontrol edin
- Environment variables'ları kontrol edin

### 4. Rate Limiting
- 5 istek/dakika sınırını kontrol edin
- IP adresini kontrol edin
- Cache'i temizleyin

## 📞 Destek

- **PayTR Destek**: [destek@paytr.com](mailto:destek@paytr.com)
- **Teknik Dokümantasyon**: [docs.paytr.com](https://docs.paytr.com)
- **Test Ortamı**: [test.paytr.com](https://test.paytr.com)

## ✅ Kontrol Listesi

- [ ] PayTR hesabı oluşturuldu
- [ ] Test bilgileri alındı
- [ ] Environment variables eklendi (GÜVENLİ)
- [ ] Webhook URL ayarlandı
- [ ] Test ödeme linkleri oluşturuldu
- [ ] Test ödemeleri yapıldı
- [ ] Webhook'lar test edildi
- [ ] Rate limiting test edildi
- [ ] Input validation test edildi
- [ ] Production bilgileri eklendi
- [ ] SSL sertifikası aktif
- [ ] IP whitelist eklendi
- [ ] Son testler yapıldı

## 🔐 Güvenlik Kontrol Listesi

- [ ] Client-side'da hiçbir secret key yok
- [ ] Server-side hash oluşturma aktif
- [ ] Rate limiting çalışıyor
- [ ] Input validation aktif
- [ ] CSRF protection aktif
- [ ] Webhook verification aktif
- [ ] Secure headers eklendi
- [ ] Environment variables güvenli
- [ ] SSL sertifikası aktif
- [ ] Firewall ayarları yapıldı
- [ ] Eski iframe sistemi kaldırıldı
- [ ] Link API entegrasyonu aktif

## 🆕 Yeni Özellikler

### ✅ **PayTR Link API**
- Modern Link API entegrasyonu
- Otomatik ödeme linki oluşturma
- 24 saat geçerli linkler
- Callback ID ile kullanıcı takibi

### ✅ **Gelişmiş Webhook Sistemi**
- Link API webhook'ları için özel işleme
- Güvenli hash doğrulama
- Kullanıcı durumu güncelleme

### ✅ **Temiz Kod Yapısı**
- Ayrı servis katmanları
- Type-safe interface'ler
- Hata yönetimi
- Subscription sayfası entegrasyonu
