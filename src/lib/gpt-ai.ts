import OpenAI from 'openai';

const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
const client = new OpenAI({
  apiKey: API_KEY,
  dangerouslyAllowBrowser: true,
});

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
You are an LNAT (Law National Aptitude Test) content analysis expert.
Analyze the given text and separate the text and questions.

TASK:
1. Analyze the given content
2. Identify the main text
3. Detect questions and options
4. Determine the correct answer for each question
5. Generate explanation for each question

OUTPUT FORMAT:
{
  "mainText": "Main text content...",
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

RAW CONTENT:
{combinedText}

Please provide output in the above JSON format. Only provide JSON format response, no additional explanations.
`;

const TEXT_TO_QUESTIONS_PROMPT = `
You are an LNAT (Law National Aptitude Test) question analysis expert. 
Analyze the following raw text and convert it to question-answer format.

TASK:
1. Divide the text into passages
2. Extract the specified number of questions for each passage
3. Determine 5 options (A, B, C, D, E) for each question
4. Determine the correct answer
5. Generate explanation for each question

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

RAW TEXT:
{rawText}

QUESTION COUNT: {questionCount}

Please provide output in the above JSON format. Only provide JSON format response, no additional explanations.
`;

const EVALUATION_PROMPT = `
Analyze the student's exam performance and provide recommendations.

PERFORMANCE DATA:
- Total Questions: {totalQuestions}
- Correct Answers: {correctAnswers}
- Wrong Answers: {wrongAnswers}

OUTPUT:
{
  "overallScore": 75,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "strengths": ["Strong areas..."],
  "weaknesses": ["Weak areas..."],
  "recommendations": ["Recommendations..."],
  "studyPlan": {
    "focusAreas": ["Areas to focus on..."],
    "practiceQuestions": 20,
    "estimatedImprovement": "2-3 weeks"
  }
}

Please provide output in the above JSON format. Only provide JSON format response, no additional explanations.
`;

const TEXT_QUESTIONS_ANALYSIS_PROMPT = `
You are an LNAT (Law National Aptitude Test) analysis expert. 
Analyze the following text and questions to determine which question belongs to which text.

TASK:
1. Divide the given text into passages
2. Analyze each question
3. Determine which passage each question belongs to
4. Format questions with correct answers
5. Process multiple texts as separate sections
6. Process LNAT format passages correctly

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

QUESTIONS:
{questions}

IMPORTANT NOTES:
- If the text contains sections in "Passage 1 – Title" format, process each passage as a separate section
- Find and match each passage's own questions (numbered 1., 2., 3., etc.)
- Preserve question numbers and determine correct answers
- Use passage title for each section
- Parse LNAT format questions (A, B, C, D, E options) correctly
- Process each passage's text and questions separately

Please provide output in the above JSON format. Only provide JSON format response, no additional explanations.
`;

const WRITING_EVALUATION_PROMPT = `
You are an LNAT (Law National Aptitude Test) writing evaluation expert.
Analyze the user's response to the given question and provide detailed evaluation.

QUESTION: {question}
USER RESPONSE: {userText}

TASK:
1. Score the writing out of 100
2. Identify strengths
3. Identify areas for improvement
4. Provide concrete suggestions
5. Provide detailed analysis

EVALUATION CRITERIA:
- Argument structure and logical flow (25 points)
- Evidence usage and examples (25 points)
- Language quality and expression (25 points)
- Critical thinking and analysis (25 points)

GRADING SYSTEM:
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
      "Strength 1",
      "Strength 2"
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

Please provide output in the above JSON format. Only provide JSON format response, no additional explanations.
`;

// Retry mechanism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Error message helper
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? getErrorMessage(error) : 'Unknown error';
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
      
      // Different wait times for different errors
      let waitTime = baseDelay * Math.pow(2, i);
      
      if (getErrorMessage(error)?.includes('503') || getErrorMessage(error)?.includes('overloaded')) {
        waitTime = waitTime * 3; // Longer wait for 503
      } else if (getErrorMessage(error)?.includes('429') || getErrorMessage(error)?.includes('quota')) {
        waitTime = waitTime * 5; // Much longer wait for quota
      }
      
      console.log(`Waiting ${waitTime}ms before retry...`);
      await delay(waitTime);
    }
  }
  throw new Error('Max retries exceeded');
};

// Available OpenAI models
const AVAILABLE_MODELS = [
  'gpt-4o',           // Latest and most capable
  'gpt-3.5-turbo',    // Fastest and most cost-effective
  'gpt-4o-mini',      // Fast and cost-effective
  'gpt-3.5-turbo'     // Fallback option
] as const;

type ModelType = typeof AVAILABLE_MODELS[number];

// JSON cleaning helper function
const cleanJsonResponse = (textResponse: string): string => {
  return textResponse
    .replace(/```json\s*/gi, '') // Case insensitive
    .replace(/```\s*/g, '')
    .replace(/^\s*[\r\n]/gm, '') // Empty lines
    .trim();
};

export class OpenAIService {
  private currentModelIndex = 0; // Start with fastest model (gpt-3.5-turbo)
  
  private getCurrentModel() {
    return AVAILABLE_MODELS[this.currentModelIndex];
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
          const response = await client.chat.completions.create({
            model: this.getCurrentModel(),
            messages: [
              {
                role: 'system',
                content: 'You are an expert LNAT question generator. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          });
          return response;
        });

        const textResponse = result.choices[0]?.message?.content || '';
        
        // Clean and parse JSON
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, getErrorMessage(parseError));
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, getErrorMessage(error));
        
        // Switch to next model if current one fails
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // All models failed
        console.error('Question generation error:', error);
        
        if (getErrorMessage(error)?.includes('503') || getErrorMessage(error)?.includes('overloaded')) {
          throw new Error('AI service is currently busy. Please try again in a few minutes.');
        } else if (getErrorMessage(error)?.includes('429') || getErrorMessage(error)?.includes('quota') || getErrorMessage(error)?.includes('exceeded')) {
          // Switch to demo mode
          console.log('API quota exceeded, switching to demo mode');
          return createDemoQuestions(questionCount);
        } else if (getErrorMessage(error)?.includes('API key') || getErrorMessage(error)?.includes('expired')) {
          throw new Error('API key is invalid or expired. Please create a new API key.');
        } else {
          throw new Error('An error occurred while generating questions. Please try again.');
        }
      }
    }
    
    // Last resort demo mode
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
          const response = await client.chat.completions.create({
            model: this.getCurrentModel(),
            messages: [
              {
                role: 'system',
                content: 'You are an expert LNAT performance evaluator. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 2000
          });
          return response;
        });

        const textResponse = result.choices[0]?.message?.content || '';
        
        // Clean and parse JSON
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, getErrorMessage(parseError));
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, getErrorMessage(error));
        
        // Switch to next model if current one fails
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // All models failed
        console.error('Evaluation error:', error);
        
        if (getErrorMessage(error)?.includes('503') || getErrorMessage(error)?.includes('overloaded')) {
          throw new Error('AI service is currently busy. Please try again in a few minutes.');
        } else if (getErrorMessage(error)?.includes('429') || getErrorMessage(error)?.includes('quota') || getErrorMessage(error)?.includes('exceeded')) {
          // Switch to demo mode
          console.log('API quota exceeded, switching to demo evaluation');
          return createDemoEvaluation(totalQuestions, correctAnswers);
        } else if (getErrorMessage(error)?.includes('API key') || getErrorMessage(error)?.includes('expired')) {
          throw new Error('API key is invalid or expired.');
        } else {
          throw new Error('An error occurred during evaluation.');
        }
      }
    }
    
    // Last resort demo mode
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
          const response = await client.chat.completions.create({
            model: this.getCurrentModel(),
            messages: [
              {
                role: 'system',
                content: 'You are an expert LNAT text-question analyzer. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 4000
          });
          return response;
        });

        const textResponse = result.choices[0]?.message?.content || '';
        
        // Clean and parse JSON
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, getErrorMessage(parseError));
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, getErrorMessage(error));
        
        // Switch to next model if current one fails
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // All models failed
        console.error('Text-question analysis error:', error);
        
        if (getErrorMessage(error)?.includes('503') || getErrorMessage(error)?.includes('overloaded')) {
          throw new Error('AI service is currently busy. Please try again in a few minutes.');
        } else if (getErrorMessage(error)?.includes('429') || getErrorMessage(error)?.includes('quota') || getErrorMessage(error)?.includes('exceeded')) {
          // Switch to demo mode
          console.log('API quota exceeded, switching to demo analysis');
          return createDemoTextQuestionsAnalysis(text, questions);
        } else if (getErrorMessage(error)?.includes('API key') || getErrorMessage(error)?.includes('expired')) {
          throw new Error('API key is invalid or expired. Please create a new API key.');
        } else {
          throw new Error('An error occurred while analyzing text and questions. Please try again.');
        }
      }
    }
    
    // Last resort demo mode
    console.log('All models failed, switching to demo analysis');
    return createDemoTextQuestionsAnalysis(text, questions);
  }

  // Check model status
  getCurrentModelName(): string {
    return AVAILABLE_MODELS[this.currentModelIndex];
  }

  // Manual model switching
  setModel(modelName: ModelType) {
    const index = AVAILABLE_MODELS.indexOf(modelName);
    if (index !== -1) {
      this.currentModelIndex = index;
      console.log(`Manually switched to model: ${modelName}`);
    }
  }

  // List available models
  getAvailableModels(): string[] {
    return [...AVAILABLE_MODELS];
  }

  // Writing evaluation function
  async evaluateWriting(question: string, userText: string): Promise<WritingEvaluation> {
    const maxModelAttempts = AVAILABLE_MODELS.length;
    
    for (let modelAttempt = 0; modelAttempt < maxModelAttempts; modelAttempt++) {
      try {
        const prompt = WRITING_EVALUATION_PROMPT
          .replace('{question}', question)
          .replace('{userText}', userText);

        const result = await retryWithBackoff(async () => {
          const response = await client.chat.completions.create({
            model: this.getCurrentModel(),
            messages: [
              {
                role: 'system',
                content: 'You are an expert LNAT writing evaluator. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 3000
          });
          return response;
        });

        const textResponse = result.choices[0]?.message?.content || '';
        
        // Clean and parse JSON
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, getErrorMessage(parseError));
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, getErrorMessage(error));
        
        // Switch to next model if current one fails
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // All models failed
        console.error('Writing evaluation error:', error);
        
        if (getErrorMessage(error)?.includes('503') || getErrorMessage(error)?.includes('overloaded')) {
          throw new Error('AI service is currently busy. Please try again in a few minutes.');
        } else if (getErrorMessage(error)?.includes('429') || getErrorMessage(error)?.includes('quota') || getErrorMessage(error)?.includes('exceeded')) {
          // Switch to demo mode
          console.log('API quota exceeded, switching to demo mode');
          return createDemoWritingEvaluation();
        } else if (getErrorMessage(error)?.includes('API key') || getErrorMessage(error)?.includes('expired')) {
          throw new Error('API key is invalid or expired.');
        } else {
          throw new Error('An error occurred while evaluating the writing.');
        }
      }
    }
    
    // Last resort demo mode
    console.log('All models failed, switching to demo mode');
    return createDemoWritingEvaluation();
  }

  // Analyze text and questions
  async analyzeContent(combinedText: string): Promise<AnalyzedContent> {
    const maxModelAttempts = AVAILABLE_MODELS.length;
    
    for (let modelAttempt = 0; modelAttempt < maxModelAttempts; modelAttempt++) {
      try {
        const prompt = ANALYZE_CONTENT_PROMPT.replace('{combinedText}', combinedText);

        const result = await retryWithBackoff(async () => {
          const response = await client.chat.completions.create({
            model: this.getCurrentModel(),
            messages: [
              {
                role: 'system',
                content: 'You are an expert LNAT content analyzer. Always respond with valid JSON only.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 3000
          });
          return response;
        });

        const textResponse = result.choices[0]?.message?.content || '';
        
        // Clean and parse JSON
        const cleanedJson = cleanJsonResponse(textResponse);
        
        try {
          const parsedResponse = JSON.parse(cleanedJson);
          return parsedResponse;
        } catch (parseError: unknown) {
          console.error(`JSON Parse Error for model ${AVAILABLE_MODELS[this.currentModelIndex]}:`, getErrorMessage(parseError));
          console.error('Raw response:', textResponse.substring(0, 200) + '...');
          throw parseError;
        }
      } catch (error: unknown) {
        console.error(`Model ${AVAILABLE_MODELS[this.currentModelIndex]} failed:`, getErrorMessage(error));
        
        // Switch to next model if current one fails
        if (modelAttempt < maxModelAttempts - 1) {
          this.switchToNextModel();
          continue;
        }
        
        // All models failed
        console.error('Content analysis error:', error);
        
        if (getErrorMessage(error)?.includes('503') || getErrorMessage(error)?.includes('overloaded')) {
          throw new Error('AI service is currently busy. Please try again in a few minutes.');
        } else if (getErrorMessage(error)?.includes('429') || getErrorMessage(error)?.includes('quota') || getErrorMessage(error)?.includes('exceeded')) {
          // Switch to demo mode
          console.log('API quota exceeded, switching to demo mode');
          return createDemoAnalysis();
        } else if (getErrorMessage(error)?.includes('API key') || getErrorMessage(error)?.includes('expired')) {
          throw new Error('API key is invalid or expired.');
        } else {
          throw new Error('An error occurred while analyzing content.');
        }
      }
    }
    
    // Last resort demo mode
    console.log('All models failed, switching to demo mode');
    return createDemoAnalysis();
  }
}

// Demo fallback functions
const createDemoQuestions = (questionCount: number): GeneratedQuestions => {
  const demoQuestions: Question[] = [];
  
  for (let i = 1; i <= questionCount; i++) {
    demoQuestions.push({
      id: i,
      text: `Demo Question ${i}: Which skills are measured in the LNAT exam?`,
      options: [
        "A. Mathematical calculation",
        "B. Reading comprehension and critical thinking",
        "C. Physics problems",
        "D. History knowledge",
        "E. Geography"
      ],
      correctAnswer: "B",
      explanation: "The LNAT exam measures reading comprehension and critical thinking skills.",
      difficulty: "medium" as const,
      category: "reading_comprehension"
    });
  }

  return {
    sections: [{
      title: "Demo Section - Law and Critical Thinking",
      passage: "This is a demo passage. In the real application, questions generated by AI will appear here.",
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
    strengths: score >= 70 ? ["Good reading comprehension", "Logical thinking"] : ["Showing effort"],
    weaknesses: score < 70 ? ["Reading comprehension can be improved", "Time management"] : ["Speed can be increased"],
    recommendations: [
      "Use LNAT resources",
      "Develop daily reading habits",
      "Practice with sample tests"
    ],
    studyPlan: {
      focusAreas: ["Reading comprehension", "Critical thinking"],
      practiceQuestions: 20,
      estimatedImprovement: "2-3 weeks"
    }
  };
};

const createDemoTextQuestionsAnalysis = (text: string, questions: string): GeneratedQuestions => {
  // Special processing for LNAT format - Find passages
  const passageMatches = text.match(/Passage\s+\d+\s*[–-]\s*[^\n]+/gi);
  
  const allSections: {title: string; passage: string; questions: Question[]}[] = [];
  let questionId = 1;
  
  if (passageMatches) {
    // Process in passage format
    let lastIndex = 0;
    
    passageMatches.forEach((match, index) => {
      const startIndex = text.indexOf(match, lastIndex);
      const nextMatch = passageMatches[index + 1];
      const endIndex = nextMatch ? text.indexOf(nextMatch, startIndex) : text.length;
      
      const passageContent = text.substring(startIndex, endIndex);
      const lines = passageContent.split('\n');
      const title = lines[0].trim();
      
      // Find question numbers
      const questionStartIndex = lines.findIndex(line => /^\d+\./.test(line.trim()));
      
      let passageText = '';
      let passageQuestions = '';
      
      if (questionStartIndex > 0) {
        passageText = lines.slice(1, questionStartIndex).join('\n').trim();
        passageQuestions = lines.slice(questionStartIndex).join('\n').trim();
      } else {
        // If question numbers not found, split content in half
        const midPoint = Math.ceil(lines.length / 2);
        passageText = lines.slice(1, midPoint).join('\n').trim();
        passageQuestions = lines.slice(midPoint).join('\n').trim();
      }
      
      // Create questions for this passage
      const sectionQuestions: Question[] = [];
      const questionMatches = passageQuestions.match(/\d+\..*?(?=\d+\.|$)/g);
      
      if (questionMatches) {
        questionMatches.forEach((questionText, qIndex) => {
          if (qIndex < 5) { // Max 5 questions per passage
            // Find options (A, B, C, D, E)
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
              explanation: "This question relates to the relevant section in the passage.",
              difficulty: "medium" as const,
              category: "reading_comprehension"
            });
          }
        });
      }
      
      if (sectionQuestions.length === 0) {
        // Create demo question if no questions found
        sectionQuestions.push({
          id: questionId++,
          text: `Demo Question ${questionId - 1}: What topic is discussed in this passage?`,
          options: [
            "A. Basic functions of legal systems",
            "B. Impact of technology on law",
            "C. International law topics",
            "D. Importance of legal education",
            "E. Structure of justice systems"
          ],
          correctAnswer: "A",
          explanation: "This passage explains the basic functions of legal systems.",
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
    // Fallback for old format
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
              explanation: "This question relates to the relevant section in the text.",
              difficulty: "medium" as const,
              category: "reading_comprehension"
            });
          }
        });
      }
      
      if (sectionQuestions.length === 0) {
        sectionQuestions.push({
          id: questionId++,
          text: `Demo Question ${questionId - 1}: What topic is discussed in this section?`,
          options: [
            "A. Basic functions of legal systems",
            "B. Impact of technology on law",
            "C. International law topics",
            "D. Importance of legal education",
            "E. Structure of justice systems"
          ],
          correctAnswer: "A",
          explanation: "This section explains the basic functions of legal systems.",
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
  
  // If no sections found, create single section
  if (allSections.length === 0) {
    allSections.push({
      title: "Demo Analysis - Law and Justice System",
      passage: text.substring(0, 500) + "...",
      questions: [{
        id: 1,
        text: "Demo Question: What topic is discussed in this text?",
        options: [
          "A. Basic functions of legal systems",
          "B. Impact of technology on law",
          "C. International law topics",
          "D. Importance of legal education",
          "E. Structure of justice systems"
        ],
        correctAnswer: "A",
        explanation: "This text explains the basic functions of legal systems.",
        difficulty: "medium" as const,
        category: "reading_comprehension"
      }]
    });
  }

  return {
    sections: allSections
  };
};

// Demo analysis fallback
const createDemoAnalysis = (): AnalyzedContent => {
  return {
    mainText: "This is a demo text. In the real application, the text analyzed by AI will appear here. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    questions: [
      {
        id: 1,
        text: "Demo Question 1: What topic is discussed in the above text?",
        options: [
          "A. Legal systems",
          "B. Demo content",
          "C. Mathematical formulas",
          "D. Historical events",
          "E. Geographical regions"
        ],
        correctAnswer: "B",
        explanation: "The text clearly states it is demo content.",
        difficulty: "easy",
        category: "reading_comprehension"
      },
      {
        id: 2,
        text: "Demo Question 2: What is the main purpose of the text?",
        options: [
          "A. To entertain",
          "B. To provide an example",
          "C. To persuade",
          "D. To inform",
          "E. To criticize"
        ],
        correctAnswer: "B",
        explanation: "The text was created to exemplify the content that will appear in the real application.",
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
        "You presented a clear thesis and supported it consistently",
        "You effectively used critical thinking skills",
        "You presented your argument in a logical structure"
      ],
      weaknesses: [
        "You could have used more concrete examples and evidence",
        "You could have addressed counterarguments in more detail",
        "Some sentences could have been expressed more clearly"
      ],
      suggestions: [
        "Use more concrete examples to support your argument",
        "Provide more detailed analysis when addressing opposing views",
        "Vary your sentence structures to create a more fluid text",
        "Strengthen your conclusion section"
      ]
    },
    detailedAnalysis: {
      argumentStructure: "Your argument structure is generally well-organized. You have a clear introduction, development, and conclusion. However, you could have used more sub-arguments in the development section.",
      evidenceUsage: "Your evidence usage is at an adequate level. You could have strengthened your argument by using more specific examples and data at some points.",
      languageQuality: "Your language use is generally good. You used a clear and understandable style. Some sentences could be made more fluid.",
      logicalFlow: "Your logical flow is consistent. Your ideas follow each other and connections are logical. However, some transitions could have been smoother."
    },
    grade: "B"
  };
};

export const openaiAI = new OpenAIService(); 