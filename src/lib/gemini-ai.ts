import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(API_KEY);

export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export interface AnalyzedContent {
  mainText: string;
  questions: Question[];
}

export interface GeneratedQuestions {
  sections: {
    title: string;
    passage: string;
    questions: Question[];
  }[];
}

export interface EvaluationResult {
  overallScore: number;
  correctAnswers: number;
  totalQuestions: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  studyPlan: {
    focusAreas: string[];
    practiceQuestions: number;
    estimatedImprovement: string;
  };
}

export interface WritingEvaluation {
  score: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  detailedAnalysis: {
    argumentStructure: string;
    evidenceUsage: string;
    languageQuality: string;
    logicalFlow: string;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

const ANALYZE_CONTENT_PROMPT = `
You are a LNAT (Law National Aptitude Test) content analysis expert.
Analyze the given text and separate the text and questions.

GÖREV:
1. Analyze the given content
2. Identify the main text
3. Identify the questions and options
4. Identify the correct answer for each question
5. Generate an explanation for each question

ÇIKTI FORMATI:
{
  "mainText": "Main text...",
  "questions": [
    {
      "id": 1,
      "text": "Question text...",
      "options": [
        "A. Option A",
        "B. Option B",
        "C. Option C",
        "D. Option D",
        "E. Option E"
      ],
      "correctAnswer": "B",
      "explanation": "Explanation of why this answer is correct...",
      "difficulty": "medium",
      "category": "reading_comprehension"
    }
  ]
}

HAM İÇERİK:
{combinedText}

Please provide the output in the above JSON format only. Respond only in JSON format, no additional explanations. All text content must be in English.
`;

const TEXT_TO_QUESTIONS_PROMPT = `
You are a LNAT (Law National Aptitude Test) question analysis expert. 
Analyze the given text and convert it to a question-answer format.

TASK:
1. Divide the text into passages
2. For each passage, generate the specified number of questions
3. For each question, generate 5 options (A, B, C, D, E)
4. Identify the correct answer
5. Generate an explanation for each question

OUTPUT FORMAT:
{
  "sections": [
    {
      "title": "Passage Title",
      "passage": "Passage text...",
      "questions": [
        {
          "id": 1,
          "text": "Question text...",
          "options": [
            "A. Option A",
            "B. Option B", 
            "C. Option C",
            "D. Option D",
            "E. Option E"
          ],
          "correctAnswer": "B",
          "explanation": "Explanation of why this answer is correct...",
          "difficulty": "medium",
          "category": "reading_comprehension"
        }
      ]
    }
  ]
}

HAM METİN:
{rawText}

QUESTION COUNT: {questionCount}

Please provide the output in the above JSON format only. Respond only in JSON format, no additional explanations. All text content must be in English.
`;

const EVALUATION_PROMPT = `
Analyze the student's exam performance and provide recommendations in English.

PERFORMANCE DATA:
- Total Questions: {totalQuestions}
- Correct Answers: {correctAnswers}
- Wrong Answers: {wrongAnswers}

OUTPUT:
{
  "overallScore": 75,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "strengths": ["Your strong areas..."],
  "weaknesses": ["Areas that need improvement..."],
  "recommendations": ["Specific recommendations..."],
  "studyPlan": {
    "focusAreas": ["Focus areas for improvement..."],
    "practiceQuestions": 20,
    "estimatedImprovement": "2-3 weeks with consistent practice"
  }
}

Please provide output in the above JSON format only. Respond only in JSON format, no additional explanations. All text content must be in English.
`;

const TEXT_QUESTIONS_ANALYSIS_PROMPT = `
You are a LNAT (Law National Aptitude Test) analysis expert. 
Analyze the given text and questions and determine which question belongs to which passage.

TASK:
1. Divide the given text into passages
2. Analyze each question
3. Identify which passage each question belongs to
4. Format the questions with their correct answers
5. If there are multiple texts, process each text as a separate section
6. Process the passages in the LNAT format correctly

OUTPUT FORMAT:
{
  "sections": [
    {
      "title": "Passage Title",
      "passage": "Passage text...",
      "questions": [
        {
          "id": 1,
          "text": "Question text...",
          "options": [
            "A. Option A",
            "B. Option B", 
            "C. Option C",
            "D. Option D",
            "E. Option E"
          ],
          "correctAnswer": "B",
            "explanation": "Explanation of why this answer is correct...",
          "difficulty": "medium",
          "category": "reading_comprehension"
        }
      ]
    }
  ]
}

TEXT:
{text}

QUESTIONS AND ANSWERS:
{questions}

IMPORTANT NOTES:
- If there are passages in the text in the format "Passage 1 – Title", process each passage as a separate section
- Find the questions for each passage and match them (1., 2., 3. etc. numbered questions)
- Keep the numbers of the questions and identify the correct answers
- Use the passage title for each section
- Parse the questions in the LNAT format (A, B, C, D, E options) correctly
- Process the text and questions for each passage separately

Please provide the output in the above JSON format only. Respond only in JSON format, no additional explanations. All text content must be in English.
`;

// Retry mekanizması
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Error message helper
const getErrorMessage = (error: unknown): string => {
  return getErrorMessage(error);
};

const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      console.log(`Attempt ${i + 1} failed:`, errorMessage);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Farklı hatalar için farklı bekleme süreleri
      let waitTime = baseDelay * Math.pow(2, i);
      
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        waitTime = waitTime * 3; // 503 için daha uzun bekleme
      } else if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        waitTime = waitTime * 5; // Quota için çok daha uzun bekleme
      }
      
      console.log(`Waiting ${waitTime}ms before retry...`);
      await delay(waitTime);
    }
  }
  throw new Error('Max retries exceeded');
};

// Güncel kullanılabilir modeller (2025) - En stabil olanlar
const AVAILABLE_MODELS = [
  'gemini-2.5-flash',      // En yaygın ve stabil
  'gemini-2.0-flash',      // Yeni nesil
  'gemini-1.5-flash',      // Eski ama hala çalışan (fallback)
  'gemini-2.5-flash-lite'  // En hızlı (son seçenek)
] as const;

type ModelType = typeof AVAILABLE_MODELS[number];

// JSON temizleme yardımcı fonksiyonu
const cleanJsonResponse = (textResponse: string): string => {
  return textResponse
    .replace(/```json\s*/gi, '') // Case insensitive
    .replace(/```\s*/g, '')
    .replace(/^\s*[\r\n]/gm, '') // Empty lines
    .trim();
};

export class GeminiAIService {
  private currentModelIndex = 0;
  private getCurrentModel() {
    return genAI.getGenerativeModel({ model: AVAILABLE_MODELS[this.currentModelIndex] });
  }

  private switchToNextModel() {
    this.currentModelIndex = (this.currentModelIndex + 1) % AVAILABLE_MODELS.length;
    console.log(`Switched to model: ${AVAILABLE_MODELS[this.currentModelIndex]}`);
  }

  async generateQuestions(text: string, questionCount: number): Promise<GeneratedQuestions> {
    const maxModelAttempts = AVAILABLE_MODELS.length;
    
    for (let modelAttempt = 0; modelAttempt < maxModelAttempts; modelAttempt++) {
      try {
        const prompt = TEXT_TO_QUESTIONS_PROMPT
          .replace('{rawText}', text)
          .replace('{questionCount}', questionCount.toString());

        const result = await retryWithBackoff(async () => {
          const model = this.getCurrentModel();
          const response = await model.generateContent(prompt);
          return response;
        });

        const response = await result.response;
        const textResponse = response.text();
        
        // JSON'u temizle ve parse et (markdown code blocks kaldır)
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, parseError instanceof Error ? parseError.message : 'Unknown error');
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, errorMessage);
        
        // 404 hatası (model bulunamadı) için hemen diğer modele geç
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} not available, switching...`);
          if (modelAttempt < maxModelAttempts - 1) {
            this.switchToNextModel();
            continue;
          }
        }
        
        // Son model denemesi değilse, diğer modele geç
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // Tüm modeller başarısız oldu
        console.error('Soru üretimi hatası:', error);
        
        // Özel hata mesajları
        if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
          throw new Error('AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.');
        } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
          // Demo moduna geç
          console.log('API quota exceeded, switching to demo mode');
          return createDemoQuestions(questionCount);
        } else if (errorMessage.includes('API key') || errorMessage.includes('expired')) {
          throw new Error('API anahtarı geçersiz veya süresi dolmuş. Lütfen yeni bir API anahtarı oluşturun.');
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          throw new Error('AI modelleri geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
        } else {
          throw new Error('Sorular üretilirken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
    }
    
    // Son çare demo mode
    console.log('All models failed, switching to demo mode');
    return createDemoQuestions(questionCount);
  }

  async evaluatePerformance(
    totalQuestions: number,
    correctAnswers: number,
    wrongAnswers: number
  ): Promise<EvaluationResult> {
    const maxModelAttempts = AVAILABLE_MODELS.length;
    
    for (let modelAttempt = 0; modelAttempt < maxModelAttempts; modelAttempt++) {
      try {
        const prompt = EVALUATION_PROMPT
          .replace('{totalQuestions}', totalQuestions.toString())
          .replace('{correctAnswers}', correctAnswers.toString())
          .replace('{wrongAnswers}', wrongAnswers.toString());

        const result = await retryWithBackoff(async () => {
          const model = this.getCurrentModel();
          const response = await model.generateContent(prompt);
          return response;
        });

        const response = await result.response;
        const textResponse = response.text();
        
        // JSON'u temizle ve parse et (markdown code blocks kaldır)
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, parseError instanceof Error ? parseError.message : 'Unknown error');
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, errorMessage);
        
        // 404 hatası (model bulunamadı) için hemen diğer modele geç
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} not available, switching...`);
          if (modelAttempt < maxModelAttempts - 1) {
            this.switchToNextModel();
            continue;
          }
        }
        
        // Son model denemesi değilse, diğer modele geç
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // Tüm modeller başarısız oldu
        console.error('Değerlendirme hatası:', error);
        
        if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
          throw new Error('AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.');
        } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
          // Demo moduna geç
          console.log('API quota exceeded, switching to demo evaluation');
          return createDemoEvaluation(totalQuestions, correctAnswers);
        } else if (errorMessage.includes('API key') || errorMessage.includes('expired')) {
          throw new Error('API anahtarı geçersiz veya süresi dolmuş.');
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          throw new Error('AI modelleri geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
        } else {
          throw new Error('Değerlendirme yapılırken bir hata oluştu.');
        }
      }
    }
    
    // Son çare demo mode
    console.log('All models failed, switching to demo evaluation');
    return createDemoEvaluation(totalQuestions, correctAnswers);
  }

  async analyzeTextAndQuestions(text: string, questions: string): Promise<GeneratedQuestions> {
    const maxModelAttempts = AVAILABLE_MODELS.length;
    
    for (let modelAttempt = 0; modelAttempt < maxModelAttempts; modelAttempt++) {
      try {
        const prompt = TEXT_QUESTIONS_ANALYSIS_PROMPT
          .replace('{text}', text)
          .replace('{questions}', questions);

        const result = await retryWithBackoff(async () => {
          const model = this.getCurrentModel();
          const response = await model.generateContent(prompt);
          return response;
        });

        const response = await result.response;
        const textResponse = response.text();
        
        // JSON'u temizle ve parse et (markdown code blocks kaldır)
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, parseError instanceof Error ? parseError.message : 'Unknown error');
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, errorMessage);
        
        // 404 hatası (model bulunamadı) için hemen diğer modele geç
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} not available, switching...`);
          if (modelAttempt < maxModelAttempts - 1) {
            this.switchToNextModel();
            continue;
          }
        }
        
        // Son model denemesi değilse, diğer modele geç
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // Tüm modeller başarısız oldu
        console.error('Metin-soru analizi hatası:', error);
        
        if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
          throw new Error('AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.');
        } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
          // Demo moduna geç
          console.log('API quota exceeded, switching to demo analysis');
          return createDemoTextQuestionsAnalysis(text, questions);
        } else if (errorMessage.includes('API key') || errorMessage.includes('expired')) {
          throw new Error('API anahtarı geçersiz veya süresi dolmuş. Lütfen yeni bir API anahtarı oluşturun.');
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          throw new Error('AI modelleri geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
        } else {
          throw new Error('Metin ve soru analizi yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
        }
      }
    }
    
    // Son çare demo mode
    console.log('All models failed, switching to demo analysis');
    return createDemoTextQuestionsAnalysis(text, questions);
  }

  // Model durumunu kontrol et
  getCurrentModelName(): string {
    return AVAILABLE_MODELS[this.currentModelIndex];
  }

  // Manuel model değiştirme
  setModel(modelName: ModelType) {
    const index = AVAILABLE_MODELS.indexOf(modelName);
    if (index !== -1) {
      this.currentModelIndex = index;
      console.log(`Manually switched to model: ${modelName}`);
    }
  }

  // Kullanılabilir modelleri listele
  getAvailableModels(): string[] {
    return [...AVAILABLE_MODELS];
  }

  // Yazı değerlendirme fonksiyonu
  async evaluateWriting(question: string, userText: string): Promise<WritingEvaluation> {
    const maxModelAttempts = AVAILABLE_MODELS.length;
    
    for (let modelAttempt = 0; modelAttempt < maxModelAttempts; modelAttempt++) {
      try {
        const prompt = `
Sen bir LNAT (Law National Aptitude Test) yazma değerlendirme uzmanısın.
Kullanıcının verdiği soruya yazdığı yanıtı analiz ederek detaylı bir değerlendirme yap.

SORU: ${question}
KULLANICI YANITI: ${userText}

TASK:
1. Rate the article with a score above 100
2. Identify the strengths 
3. Identify the areas for improvement
4. Provide specific recommendations
5. Provide a detailed analysis

EVALUATION CRITERIA:
- Argument structure and logical flow (25 points)
- Evidence usage and examples (25 points)
- Language quality and expression power (25 points)
- Critical thinking and analysis (25 points)

NOT SYSTEM:
- 90-100: A
- 80-89: B
- 70-79: C
- 60-69: D
- 0-59: F

OUTPUT FORMAT:
{
  "score": 85,
  "feedback": {
    "strengths": [
      "Strong point 1",
      "Strong point 2"
    ],
    "weaknesses": [
      "Area for improvement 1",
      "Area for improvement 2"
    ],
    "suggestions": [
      "Suggestion 1",
      "Suggestion 2"
    ]
  },
  "detailedAnalysis": {
    "argumentStructure": "Detailed analysis of argument structure...",
    "evidenceUsage": "Detailed analysis of evidence usage...",
    "languageQuality": "Detailed analysis of language quality...",
    "logicalFlow": "Detailed analysis of logical flow..."
  },
  "grade": "B"
}

Please provide the output in the above JSON format only. Respond only in JSON format, no additional explanations. All text content must be in English.
`;

        const result = await retryWithBackoff(async () => {
          const model = this.getCurrentModel();
          const response = await model.generateContent(prompt);
          return response;
        });

        const response = await result.response;
        const textResponse = response.text();
        
        // JSON'u temizle ve parse et
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, parseError instanceof Error ? parseError.message : 'Unknown error');
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, errorMessage);
        
        // 404 hatası için hemen diğer modele geç
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} not available, switching...`);
          if (modelAttempt < maxModelAttempts - 1) {
            this.switchToNextModel();
            continue;
          }
        }
        
        // Son model denemesi değilse, diğer modele geç
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // Tüm modeller başarısız oldu
        console.error('Yazı değerlendirme hatası:', error);
        
        if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
          throw new Error('AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.');
        } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
          // Demo moduna geç
          console.log('API quota exceeded, switching to demo mode');
          return createDemoWritingEvaluation();
        } else if (errorMessage.includes('API key') || errorMessage.includes('expired')) {
          throw new Error('API anahtarı geçersiz veya süresi dolmuş.');
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          throw new Error('AI modelleri geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
        } else {
          throw new Error('Yazı değerlendirilirken bir hata oluştu.');
        }
      }
    }
    
    // Son çare demo mode
    console.log('All models failed, switching to demo mode');
    return createDemoWritingEvaluation();
  }

  // Metin ve soruları analiz et
  async analyzeContent(combinedText: string): Promise<AnalyzedContent> {
    const maxModelAttempts = AVAILABLE_MODELS.length;
    
    for (let modelAttempt = 0; modelAttempt < maxModelAttempts; modelAttempt++) {
      try {
        const prompt = ANALYZE_CONTENT_PROMPT.replace('{combinedText}', combinedText);

        const result = await retryWithBackoff(async () => {
          const model = this.getCurrentModel();
          const response = await model.generateContent(prompt);
          return response;
        });

        const response = await result.response;
        const textResponse = response.text();
        
        // JSON'u temizle ve parse et
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, parseError instanceof Error ? parseError.message : 'Unknown error');
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, errorMessage);
        
        // 404 hatası için hemen diğer modele geç
        if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          console.log(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} not available, switching...`);
          if (modelAttempt < maxModelAttempts - 1) {
            this.switchToNextModel();
            continue;
          }
        }
        
        // Son model denemesi değilse, diğer modele geç
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // Tüm modeller başarısız oldu
        console.error('İçerik analizi hatası:', error);
        
        if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
          throw new Error('AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin.');
        } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
          // Demo moduna geç
          console.log('API quota exceeded, switching to demo mode');
          return createDemoAnalysis();
        } else if (errorMessage.includes('API key') || errorMessage.includes('expired')) {
          throw new Error('API anahtarı geçersiz veya süresi dolmuş.');
        } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
          throw new Error('AI modelleri geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
        } else {
          throw new Error('İçerik analiz edilirken bir hata oluştu.');
        }
      }
    }
    
    // Son çare demo mode
    console.log('All models failed, switching to demo mode');
    return createDemoAnalysis();
  }
}

// Demo amaçlı fallback fonksiyonları
const createDemoQuestions = (questionCount: number): GeneratedQuestions => {
  const demoQuestions: Question[] = [];
  
  for (let i = 1; i <= questionCount; i++) {
    demoQuestions.push({
      id: i,
      text: `Demo Soru ${i}: LNAT sınavında hangi beceriler ölçülür?`,
      options: [
        "A. Mathematical calculation",
        "B. Reading comprehension and critical thinking",
        "C. Physics problems",
        "D. History knowledge",
        "E. Coğrafya"
      ],
      correctAnswer: "B",
      explanation: "LNAT exam measures reading comprehension and critical thinking skills.",
      difficulty: "medium" as const,
      category: "reading_comprehension"
    });
  }

  return {
    sections: [{
      title: "Demo Section - Law and Critical Thinking",
      passage: "This is a demo passage. Real questions generated by AI will appear here.",
      questions: demoQuestions
    }]
  };
};

const createDemoEvaluation = (totalQuestions: number, correctAnswers: number): EvaluationResult => {
  const score = Math.round((correctAnswers / totalQuestions) * 100);
  
  return {
    overallScore: score,
    correctAnswers,
    totalQuestions,
    strengths: score >= 70 ? ["Good reading comprehension", "Logical reasoning skills"] : ["Persistence and effort"],
    weaknesses: score < 70 ? ["Reading comprehension needs improvement", "Time management skills"] : ["Speed could be improved"],
    recommendations: [
      "Use official LNAT preparation resources",
      "Develop daily reading habits with complex texts",
      "Practice with timed mock tests regularly"
    ],
    studyPlan: {
      focusAreas: ["Reading comprehension", "Critical thinking", "Argument analysis"],
      practiceQuestions: 20,
      estimatedImprovement: "2-3 weeks with consistent daily practice"
    }
  };
};

const createDemoTextQuestionsAnalysis = (text: string, questions: string): GeneratedQuestions => {
  // LNAT formatı için özel işleme - Passage'ları bul
  const passageMatches = text.match(/Passage\s+\d+\s*[–-]\s*[^\n]+/gi);
  
  const allSections: {title: string; passage: string; questions: Question[]}[] = [];
  let questionId = 1;
  
  if (passageMatches) {
    // Passage formatında işle
    let lastIndex = 0;
    
    passageMatches.forEach((match, index) => {
      const startIndex = text.indexOf(match, lastIndex);
      const nextMatch = passageMatches[index + 1];
      const endIndex = nextMatch ? text.indexOf(nextMatch, startIndex) : text.length;
      
      const passageContent = text.substring(startIndex, endIndex);
      const lines = passageContent.split('\n');
      const title = lines[0].trim();
      
      // Soru numaralarını bul
      const questionStartIndex = lines.findIndex(line => /^\d+\./.test(line.trim()));
      
      let passageText = '';
      let passageQuestions = '';
      
      if (questionStartIndex > 0) {
        passageText = lines.slice(1, questionStartIndex).join('\n').trim();
        passageQuestions = lines.slice(questionStartIndex).join('\n').trim();
      } else {
        // Eğer soru numarası bulunamazsa, içeriği ikiye böl
        const midPoint = Math.ceil(lines.length / 2);
        passageText = lines.slice(1, midPoint).join('\n').trim();
        passageQuestions = lines.slice(midPoint).join('\n').trim();
      }
      
      // Bu passage için soruları oluştur
      const sectionQuestions: Question[] = [];
      const questionMatches = passageQuestions.match(/\d+\..*?(?=\d+\.|$)/g);
      
      if (questionMatches) {
        questionMatches.forEach((questionText, qIndex) => {
          if (qIndex < 5) { // Her passage için max 5 soru
            // Seçenekleri bul (A, B, C, D, E)
            const optionMatches = questionText.match(/[A-E]\)[^A-E]*/g);
            const options = optionMatches ? optionMatches.map(opt => opt.trim()) : [
              "A. First option",
              "B. Second option", 
              "C. Third option",
              "D. Fourth option",
              "E. Fifth option"
            ];
            
            sectionQuestions.push({
              id: questionId++,
              text: questionText.trim().replace(/^\d+\.\s*/, '').split(/[A-E]\)/)[0].trim(),
              options: options,
              correctAnswer: "B",
              explanation: "This question is related to the relevant section of the passage.",
              difficulty: "medium" as const,
              category: "reading_comprehension"
            });
          }
        });
      }
      
      if (sectionQuestions.length === 0) {
        // Eğer soru bulunamazsa demo soru oluştur
        sectionQuestions.push({
          id: questionId++,
          text: `Demo Question ${questionId - 1}: What is the topic of this passage?`,
          options: [
            "A. Basic functions of law system",
            "B. Impact of technology on law",
            "C. International law topics",
            "D. Importance of law education",
            "E. Structure of justice system"
          ],
          correctAnswer: "A",
          explanation: "This passage explains the basic functions of the law system.",
          difficulty: "medium" as const,
          category: "reading_comprehension"
        });
      }
      
      allSections.push({
        title: title,
        passage: passageText.substring(0, 400) + "...",
        questions: sectionQuestions
      });
      
      lastIndex = endIndex;
    });
  } else {
    // Eski format için fallback
    const sections = text.split(/===+.*?===+/g).filter(s => s.trim().length > 0);
    
    sections.forEach((section, sectionIndex) => {
      const lines = section.trim().split('\n');
      const title = lines[0] || `Section ${sectionIndex + 1}`;
      const content = lines.slice(1).join('\n');
      
      const sectionQuestions: Question[] = [];
      const questionMatches = questions.match(/\d+\..*?(?=\d+\.|$)/g);
      
      if (questionMatches) {
        questionMatches.forEach((questionText, qIndex) => {
          if (qIndex < 4) {
            sectionQuestions.push({
              id: questionId++,
              text: questionText.trim().replace(/^\d+\.\s*/, ''),
              options: [
                "A. First option",
                "B. Second option", 
                "C. Third option",
                "D. Fourth option",
                "E. Fifth option"
              ],
              correctAnswer: "B",
              explanation: "This question is related to the relevant section of the text.",
              difficulty: "medium" as const,
              category: "reading_comprehension"
            });
          }
        });
      }
      
      if (sectionQuestions.length === 0) {
        sectionQuestions.push({
          id: questionId++,
          text: `Demo Question ${questionId - 1}: What is the topic of this section?`,
          options: [
            "A. Basic functions of law system",
            "B. Impact of technology on law",
            "C. International law topics",
            "D. Importance of law education",
            "E. Structure of justice system"
          ],
          correctAnswer: "A",
          explanation: "This section explains the basic functions of the law system.",
          difficulty: "medium" as const,
          category: "reading_comprehension"
        });
      }
      
      allSections.push({
        title: title,
        passage: content.substring(0, 300) + "...",
        questions: sectionQuestions
      });
    });
  }
  
  // Eğer hiç bölüm bulunamazsa tek section oluştur
  if (allSections.length === 0) {
    allSections.push({
      title: "Demo Analysis - Law and Justice System",
      passage: text.substring(0, 500) + "...",
      questions: [{
        id: 1,
        text: "Demo Question: What is the topic of this text?",
        options: [
          "A. Basic functions of law system",
          "B. Impact of technology on law",
          "C. International law topics",
          "D. Importance of law education",
          "E. Structure of justice system"
        ],
        correctAnswer: "A",
        explanation: "This text explains the basic functions of the law system.",
        difficulty: "medium" as const,
        category: "reading_comprehension"
      }]
    });
  }

  return {
    sections: allSections
  };
};



// Demo analiz için fallback
const createDemoAnalysis = (): AnalyzedContent => {
  return {
    mainText: "Bu bir demo metindir. Gerçek uygulamada AI tarafından analiz edilen metin burada görünecektir. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    questions: [
      {
        id: 1,
        text: "Demo Soru 1: Yukarıdaki metinde hangi konu ele alınmıştır?",
        options: [
          "A. Hukuk sistemleri",
          "B. Demo içerik",
          "C. Matematik formülleri",
          "D. Tarih olayları",
          "E. Coğrafi bölgeler"
        ],
        correctAnswer: "B",
        explanation: "Metin açıkça bir demo içerik olduğunu belirtmektedir.",
        difficulty: "easy",
        category: "reading_comprehension"
      },
      {
        id: 2,
        text: "Demo Soru 2: Metnin ana amacı nedir?",
        options: [
          "A. Eğlendirmek",
          "B. Örnek göstermek",
          "C. İkna etmek",
          "D. Bilgilendirmek",
          "E. Eleştirmek"
        ],
        correctAnswer: "B",
        explanation: "Metin, gerçek uygulamada görünecek içeriği örneklemek amacıyla oluşturulmuştur.",
        difficulty: "medium",
        category: "reading_comprehension"
      }
    ]
  };
};

const createDemoWritingEvaluation = (): WritingEvaluation => {
  return {
    score: 85,
    feedback: {
      strengths: [
        "You presented a clear thesis and supported it logically",
        "You effectively used critical thinking skills",
        "Your argument was well structured"
      ],
      weaknesses: [
        "You could have used more concrete examples and evidence",
        "You could have analyzed counterarguments in more detail",
        "Some sentences could have been more clearly expressed"
      ],
      suggestions: [
        "Use more concrete examples and evidence to support your argument",
        "You could have analyzed counterarguments in more detail",
        "You could have varied sentence structures to make your text more fluid",
        "You could have made your conclusion stronger"
      ]
    },
    detailedAnalysis: {
      argumentStructure: "Your argument structure is generally well organized. There is a clear introduction, development, and conclusion. However, you could have used more sub-arguments in the development section.",
      evidenceUsage: "Your evidence usage is adequate. In some areas, you could have used more specific examples and data to strengthen your argument.",
      languageQuality: "Your language usage is generally good. You have used a clear and understandable style. Some sentences could have been made more fluid.",
      logicalFlow: "Your logical flow is consistent. Your ideas follow one another and the connections are logical. However, some transitions could have been smoother."
    },
    grade: "B"
  };
};

export const geminiAI = new GeminiAIService(); 