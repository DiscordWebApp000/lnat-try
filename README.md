# AI Prompt'ları - LNAT Web Uygulaması

## 1. Ham Metin → Soru-Cevap Dönüşümü

```typescript
const TEXT_TO_QUESTIONS_PROMPT = `
Sen bir LNAT (Law National Aptitude Test) soru analiz uzmanısın. 
Aşağıdaki ham metni analiz ederek soru-cevap formatına çevir.

GÖREV:
1. Metni pasajlar halinde böl
2. Her pasaj için soruları çıkar
3. Her soru için 5 seçenek (A, B, C, D, E) belirle
4. Doğru cevabı belirle
5. Her soru için açıklama üret

ÇIKTI FORMATI:
{
  "sections": [
    {
      "title": "Pasaj Başlığı",
      "passage": "Pasaj metni...",
      "questions": [
        {
          "id": 1,
          "text": "Soru metni...",
          "options": [
            "A. Seçenek A",
            "B. Seçenek B", 
            "C. Seçenek C",
            "D. Seçenek D",
            "E. Seçenek E"
          ],
          "correctAnswer": "B",
          "explanation": "Bu cevabın neden doğru olduğuna dair açıklama...",
          "difficulty": "medium",
          "category": "reading_comprehension"
        }
      ]
    }
  ]
}

HAM METİN:
{rawText}

Lütfen yukarıdaki formatta JSON çıktısı ver.
`;
```

## 2. Soru Zorluk Analizi

```typescript
const DIFFICULTY_ANALYSIS_PROMPT = `
Aşağıdaki LNAT sorusunu analiz ederek zorluk seviyesini belirle.

SORU:
{questionText}

SEÇENEKLER:
{options}

ZORLUK KRİTERLERİ:
- EASY: Temel okuma anlama, açık cevap
- MEDIUM: Orta seviye analiz gerektiren
- HARD: Karmaşık muhakeme, çoklu adım analizi

ÇIKTI:
{
  "difficulty": "medium",
  "reasoning": "Bu soru orta zorlukta çünkü...",
  "estimatedTime": 90,
  "skills": ["reading_comprehension", "logical_reasoning"]
}
`;
```

## 3. Yanlış Cevap Açıklaması

```typescript
const EXPLANATION_PROMPT = `
Bir öğrenci bu soruyu yanlış cevapladı. Neden yanlış olduğunu açıkla.

SORU:
{questionText}

SEÇENEKLER:
{options}

DOĞRU CEVAP: {correctAnswer}
ÖĞRENCİNİN CEVABI: {studentAnswer}

AÇIKLAMA FORMATI:
{
  "explanation": "Bu cevabın neden yanlış olduğuna dair detaylı açıklama...",
  "correctReasoning": "Doğru cevaba nasıl ulaşılacağı...",
  "commonMistake": "Bu tür sorularda sık yapılan hata...",
  "tips": ["İpucu 1", "İpucu 2"],
  "relatedConcepts": ["İlgili kavram 1", "İlgili kavram 2"]
}
`;
```

## 4. Performans Analizi

```typescript
const PERFORMANCE_ANALYSIS_PROMPT = `
Öğrencinin sınav performansını analiz et ve öneriler sun.

PERFORMANS VERİLERİ:
- Toplam Soru: {totalQuestions}
- Doğru Cevap: {correctAnswers}
- Yanlış Cevap: {wrongAnswers}
- Boş Bırakılan: {skippedQuestions}
- Ortalama Süre: {averageTime} saniye
- Toplam Süre: {totalTime} dakika

KONU BAZINDA PERFORMANS:
{subjectPerformance}

ÇIKTI:
{
  "overallScore": 75,
  "strengths": ["Güçlü yanlar..."],
  "weaknesses": ["Zayıf yanlar..."],
  "recommendations": ["Öneriler..."],
  "studyPlan": {
    "focusAreas": ["Odaklanılacak alanlar..."],
    "practiceQuestions": "Önerilen soru sayısı",
    "estimatedImprovement": "Tahmini gelişim süresi"
  }
}
`;
```

## 5. Soru Sayısı Önerisi

```typescript
const QUESTION_COUNT_SUGGESTION_PROMPT = `
Öğrencinin seviyesine göre uygun soru sayısını öner.

ÖĞRENCİ BİLGİLERİ:
- Seviye: {level} (beginner/intermediate/advanced)
- Mevcut Zaman: {availableTime} dakika
- Hedef: {goal} (practice/exam_simulation/quick_review)

ÖNERİ FORMATI:
{
  "recommendedCount": 15,
  "reasoning": "Bu sayı önerilir çünkü...",
  "estimatedDuration": 45,
  "difficultyMix": {
    "easy": 5,
    "medium": 7,
    "hard": 3
  }
}
`;
```

## 6. Zaman Analizi

```typescript
const TIME_ANALYSIS_PROMPT = `
Öğrencinin soru başına harcadığı süreyi analiz et.

ZAMAN VERİLERİ:
- Soru 1: 120 saniye
- Soru 2: 90 saniye
- Soru 3: 180 saniye
- ...

ANALİZ FORMATI:
{
  "averageTime": 130,
  "timeDistribution": {
    "fast": 3,
    "normal": 8,
    "slow": 4
  },
  "timeEfficiency": "good",
  "recommendations": [
    "Hızlı sorularda daha dikkatli ol",
    "Zor sorularda zaman yönetimini iyileştir"
  ]
}
`;
```

## 7. Konu Bazında Performans

```typescript
const SUBJECT_PERFORMANCE_PROMPT = `
Öğrencinin farklı konulardaki performansını analiz et.

KONU PERFORMANSLARI:
- Reading Comprehension: 8/10 doğru
- Logical Reasoning: 6/10 doğru
- Critical Thinking: 7/10 doğru

ANALİZ FORMATI:
{
  "strongestSubject": "Reading Comprehension",
  "weakestSubject": "Logical Reasoning",
  "subjectBreakdown": [
    {
      "subject": "Reading Comprehension",
      "score": 80,
      "strengths": ["Hızlı okuma", "Ana fikir bulma"],
      "weaknesses": ["Detay analizi"]
    }
  ],
  "improvementAreas": ["Logical Reasoning", "Critical Thinking"]
}
`;
```

## 8. Kişiselleştirilmiş Öneriler

```typescript
const PERSONALIZED_RECOMMENDATIONS_PROMPT = `
Öğrencinin performansına göre kişiselleştirilmiş öneriler sun.

ÖĞRENCİ PROFİLİ:
- Seviye: {level}
- Hedefler: {goals}
- Zayıf Alanlar: {weakAreas}
- Güçlü Alanlar: {strongAreas}

ÖNERİ FORMATI:
{
  "dailyPractice": {
    "questions": 10,
    "focus": "Logical Reasoning",
    "duration": 30
  },
  "weeklyGoals": [
    "Reading Comprehension'da %10 iyileştirme",
    "Zaman yönetimini geliştir"
  ],
  "studyResources": [
    "Logical reasoning pratik setleri",
    "Hızlı okuma teknikleri"
  ]
}
`;
```