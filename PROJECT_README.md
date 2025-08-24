# LNAT Soru Üretici - AI Destekli Hukuk Sınavı Hazırlık Uygulaması

Bu proje, LNAT (Law National Aptitude Test) sınavına hazırlanan öğrenciler için AI destekli soru üretimi ve değerlendirme sistemi sunar.

## 🚀 Özellikler

- **AI Destekli Soru Üretimi**: Gemini AI kullanarak metinlerden otomatik soru üretimi
- **İnteraktif Soru Çözümü**: Kullanıcı dostu arayüz ile soru çözme deneyimi
- **Detaylı Değerlendirme**: Performans analizi ve kişiselleştirilmiş öneriler
- **Modüler Yapı**: Component tabanlı mimari ile kolay genişletilebilirlik
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm

## 🛠️ Teknolojiler

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini AI
- **Icons**: Lucide React
- **State Management**: React Hooks

## 📦 Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd lna-app
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

4. Tarayıcınızda `http://localhost:3000` adresini açın.

## 🎯 Kullanım

### 1. Metin Girişi
- Metin alanına LNAT sınavı için uygun bir metin yapıştırın
- Soru sayısını seçin (3-20 arası)
- "Soruları Oluştur" butonuna tıklayın

### 2. Soru Çözümü
- Her soru için 5 seçenek arasından doğru cevabı seçin
- İlerleme çubuğu ile sürecinizi takip edin
- Sorular arasında geçiş yapabilirsiniz

### 3. Değerlendirme
- Performansınızı detaylı olarak inceleyin
- Güçlü ve zayıf yanlarınızı görün
- Kişiselleştirilmiş çalışma önerileri alın

## 🏗️ Proje Yapısı

```
src/
├── app/
│   ├── page.tsx          # Ana sayfa component'i
│   ├── layout.tsx        # Layout component'i
│   └── globals.css       # Global stiller
├── components/
│   ├── TextInput.tsx     # Metin girişi component'i
│   ├── QuestionDisplay.tsx # Soru gösterme component'i
│   └── EvaluationResults.tsx # Değerlendirme sonuçları
└── lib/
    └── gemini-ai.ts      # AI servis katmanı
```

## 🔧 Konfigürasyon

### AI API Key
`src/lib/gemini-ai.ts` dosyasında API key'i güncelleyin:

```typescript
const API_KEY = 'YOUR_GEMINI_API_KEY';
```

### Prompt Özelleştirme
README.md dosyasındaki prompt'ları inceleyerek AI davranışını özelleştirebilirsiniz.

## 🎨 Özelleştirme

### Tema Değişiklikleri
`src/app/globals.css` dosyasında Tailwind CSS değişkenlerini düzenleyin.

### Component Stilleri
Her component'in kendi stil dosyasını oluşturabilir veya Tailwind sınıflarını değiştirebilirsiniz.

## 📝 Test Metni

`example-text.txt` dosyasında test için örnek bir hukuk metni bulunmaktadır.

## 🔄 Geliştirme

### Yeni Component Ekleme
1. `src/components/` klasöründe yeni component oluşturun
2. TypeScript interface'lerini tanımlayın
3. Ana sayfaya import edin

### AI Servisini Değiştirme
1. `src/lib/` klasöründe yeni AI servis dosyası oluşturun
2. Aynı interface'leri implement edin
3. Ana sayfada servis referansını değiştirin

## 🚀 Deployment

### Vercel (Önerilen)
```bash
npm run build
vercel --prod
```

### Diğer Platformlar
```bash
npm run build
npm start
```

## 📊 Performans

- **Soru Üretimi**: ~10-30 saniye (metin uzunluğuna bağlı)
- **Değerlendirme**: ~5-10 saniye
- **Bundle Size**: ~500KB (gzipped)

## 🔒 Güvenlik

- API key'ler client-side'da saklanmamalıdır
- Production'da environment variable kullanın
- Rate limiting uygulayın

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

Sorularınız için issue açabilir veya email gönderebilirsiniz.

---

**Not**: Bu uygulama eğitim amaçlıdır ve gerçek LNAT sınavı ile ilişkili değildir. 