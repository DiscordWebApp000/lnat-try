'use client';

import { useState, useCallback } from 'react';
import { Loader2, Split, File, X, BookOpen } from 'lucide-react';
import SimpleFileUpload from './SimpleFileUpload';

interface TextQuestionsInputProps {
  onAnalyze: (combinedText: string) => void;
  isLoading: boolean;
}

interface ParsedContent {
  id: string;
  text: string;
  questions: string;
  title: string;
}

export default function TextQuestionsInput({ onAnalyze, isLoading }: TextQuestionsInputProps) {
  const [combinedText, setCombinedText] = useState('');
  const [parsedContents, setParsedContents] = useState<ParsedContent[]>([]);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [selectedContents, setSelectedContents] = useState<Set<number>>(new Set([0]));
  const [isProcessing, setIsProcessing] = useState(false);

  // İçeriği metin ve sorulara ayırma fonksiyonu - LNAT formatı için optimize edilmiş
  const parseContentIntoSections = (content: string) => {
    const sections: { text: string; questions: string; title?: string }[] = [];
    
    // LNAT formatı için özel ayırma yöntemleri
    if (content.includes('Passage')) {
      // LNAT formatında passage'lar var
      const passageMatches = content.match(/Passage\s+\d+\s*[–-]\s*[^\n]+/gi);
      
      if (passageMatches) {
        let lastIndex = 0;
        
        passageMatches.forEach((match, index) => {
          const startIndex = content.indexOf(match, lastIndex);
          const nextMatch = passageMatches[index + 1];
          const endIndex = nextMatch ? content.indexOf(nextMatch, startIndex) : content.length;
          
          const passageContent = content.substring(startIndex, endIndex);
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
          
          sections.push({
            text: passageText,
            questions: passageQuestions,
            title: title
          });
          
          lastIndex = endIndex;
        });
      }
    } else if (content.includes('===')) {
      // === ile ayrılmış bölümler
      const parts = content.split(/===+.*?===+/g);
      parts.forEach((part, index) => {
        if (part.trim()) {
          // Metni sorulardan ayır - sayı ile başlayan satırları soru olarak kabul et
          const lines = part.trim().split('\n');
          const questionStartIndex = lines.findIndex(line => /^\d+\./.test(line.trim()));
          
          if (questionStartIndex > 0) {
            const text = lines.slice(0, questionStartIndex).join('\n').trim();
            const questions = lines.slice(questionStartIndex).join('\n').trim();
            sections.push({
              text: text,
              questions: questions,
              title: `Bölüm ${index + 1}`
            });
          } else {
            // Eğer soru bulunamazsa tüm içeriği metin olarak al
            sections.push({
              text: part.trim(),
              questions: '',
              title: `Bölüm ${index + 1}`
            });
          }
        }
      });
    } else {
      // Tek parça içerik - sayı ile başlayan satırları bul
      const lines = content.split('\n');
      const questionStartIndex = lines.findIndex(line => /^\d+\./.test(line.trim()));
      
      if (questionStartIndex > 0) {
        const text = lines.slice(0, questionStartIndex).join('\n').trim();
        const questions = lines.slice(questionStartIndex).join('\n').trim();
        sections.push({
          text: text,
          questions: questions,
          title: 'Ana Metin'
        });
      } else {
        // Hiç soru yoksa tüm içeriği metin olarak al
        sections.push({
          text: content.trim(),
          questions: '',
          title: 'Ana Metin'
        });
      }
    }
    
    // Eğer hiç bölüm bulunamazsa varsayılan bölüm oluştur
    if (sections.length === 0) {
      sections.push({
        text: content.trim(),
        questions: '',
        title: 'Ana Metin'
      });
    }
    
    return sections;
  };

  // File upload function
  const handleFilesUploaded = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    const newContents: ParsedContent[] = [];

    for (const file of files) {
      try {
        let fileContent = '';
        
        if (file.type === 'application/pdf') {
          try {
            // PDF dosyasını oku - dynamic import kullan
            const pdfjsLib = await import('pdfjs-dist');
            
            // PDF.js worker'ı yükle
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map((item: unknown) => (item as {str?: string})?.str || '').join(' ');
              fileContent += pageText + '\n\n';
            }
          } catch (pdfError) {
            console.error('PDF processing error:', pdfError);
            alert(`PDF dosyası okunamadı: ${file.name}`);
            continue;
          }
        } else if (file.type === 'text/plain') {
          // TXT dosyasını oku
          fileContent = await file.text();
        }

        // İçeriği metin ve sorulara ayır
        const sections = parseContentIntoSections(fileContent);
        sections.forEach((section, index) => {
          newContents.push({
            id: `${file.name}-${index}`,
            text: section.text,
            questions: section.questions,
            title: section.title || `${file.name} - Bölüm ${index + 1}`
          });
        });

      } catch (error) {
        console.error('Dosya okuma hatası:', error);
        alert(`${file.name} dosyası okunamadı.`);
      }
    }

    setParsedContents(newContents);
    if (newContents.length > 0) {
      setCurrentContentIndex(0);
      setSelectedContents(new Set([0]));
      setCombinedText(newContents[0].text + '\n\n' + newContents[0].questions);
    }
    setIsProcessing(false);
  }, []);



 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (combinedText.trim()) {
      onAnalyze(combinedText.trim());
    }
  };

  const handleNextContent = () => {
    if (currentContentIndex < parsedContents.length - 1) {
      const nextIndex = currentContentIndex + 1;
      setCurrentContentIndex(nextIndex);
      setCombinedText(parsedContents[nextIndex].text + '\n\n' + parsedContents[nextIndex].questions);
    }
  };

  const handlePreviousContent = () => {
    if (currentContentIndex > 0) {
      const prevIndex = currentContentIndex - 1;
      setCurrentContentIndex(prevIndex);
      setCombinedText(parsedContents[prevIndex].text + '\n\n' + parsedContents[prevIndex].questions);
    }
  };

  const toggleContentSelection = (index: number) => {
    const newSelected = new Set(selectedContents);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedContents(newSelected);
    
    // Eğer hiç seçili değilse, en az birini seç
    if (newSelected.size === 0) {
      newSelected.add(index);
      setSelectedContents(newSelected);
    }
    
    // Seçili içerikleri birleştir
    updateCombinedTextFromSelection(newSelected);
  };


  const updateCombinedTextFromSelection = (selection: Set<number>) => {
    const selectedContents = Array.from(selection).sort((a, b) => a - b);
    const combinedText = selectedContents.map(index => 
      parsedContents[index].text + '\n\n' + parsedContents[index].questions
    ).join('\n\n--- YENİ BÖLÜM ---\n\n');
    
    setCombinedText(combinedText);
  };

  const selectAllContents = () => {
    const allIndices = new Set(parsedContents.map((_, index) => index));
    setSelectedContents(allIndices);
    updateCombinedTextFromSelection(allIndices);
  };

  const deselectAllContents = () => {
    setSelectedContents(new Set([0]));
    setCombinedText(parsedContents[0].text + '\n\n' + parsedContents[0].questions);
  };

  const removeContent = (index: number) => {
    const newContents = parsedContents.filter((_, i) => i !== index);
    setParsedContents(newContents);
    
    // Seçili içerikleri güncelle
    const newSelected = new Set<number>();
    selectedContents.forEach(selectedIndex => {
      if (selectedIndex < index) {
        newSelected.add(selectedIndex);
      } else if (selectedIndex > index) {
        newSelected.add(selectedIndex - 1);
      }
    });
    
    if (newContents.length === 0) {
      setCombinedText('');
      setCurrentContentIndex(0);
      setSelectedContents(new Set());
    } else {
      // Eğer hiç seçili değilse, ilkini seç
      if (newSelected.size === 0) {
        newSelected.add(0);
      }
      setSelectedContents(newSelected);
      updateCombinedTextFromSelection(newSelected);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Split className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Text & Question Analysis</h2>
      </div>
      
      {/* Dosya Yükleme Alanı - Ayrı Component */}
      <SimpleFileUpload 
        onFilesSelected={handleFilesUploaded}
        isProcessing={isProcessing}
      />

      {/* Yüklenen İçerikler Listesi */}
      {parsedContents.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
              <File className="w-4 h-4 sm:w-5 sm:h-5" />
              Uploaded Contents ({parsedContents.length})
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedContents.size} / {parsedContents.length} selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAllContents}
                  className="px-2 sm:px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllContents}
                  className="px-2 sm:px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {parsedContents.map((content, index) => (
              <div
                key={content.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border-2 transition-colors gap-3 ${
                  selectedContents.has(index)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedContents.has(index)}
                    onChange={() => toggleContentSelection(index)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    selectedContents.has(index)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{content.title}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {content.text.length} characters text, {content.questions.length} characters question
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {selectedContents.has(index) && (
                    <span className="text-sm text-blue-600 font-medium">Selected</span>
                  )}
                  <button
                    onClick={() => removeContent(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove this content"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigasyon Butonları */}
          {parsedContents.length > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 p-3 bg-gray-50 rounded-lg gap-3">
              <button
                onClick={handlePreviousContent}
                disabled={currentContentIndex === 0}
                className="px-4 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 w-full sm:w-auto"
              >
                ← Previous Content
              </button>
              <span className="text-sm text-gray-600 font-medium">
                {currentContentIndex + 1} / {parsedContents.length}
              </span>
              <button
                onClick={handleNextContent}
                disabled={currentContentIndex === parsedContents.length - 1}
                className="px-4 py-2 text-sm bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-200 w-full sm:w-auto"
              >
                Next Content →
              </button>
            </div>
          )}

          {/* Seçim Bilgisi */}
          {selectedContents.size > 1 && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-green-700 font-medium">
                  {selectedContents.size} section selected. These sections will be analyzed sequentially.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Combined Text Input */}
        <div>
          <label htmlFor="combinedText" className="block text-sm font-medium text-gray-700 mb-2">
            Enter Text and Questions Together
          </label>
          <textarea
            id="combinedText"
            value={combinedText}
            onChange={(e) => setCombinedText(e.target.value)}
            placeholder="Paste text and questions here. AI will automatically separate them..."
            className="w-full h-64 sm:h-96 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-black text-sm sm:text-base"
            required
            disabled={isLoading || isProcessing}
          />
          {combinedText && (
            <div className="mt-2 text-sm text-gray-500">
              <strong>Total Content Length:</strong> {combinedText.length} characters
            </div>
          )}
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
            <BookOpen className="w-4 h-4" />
            How it works?
          </h3>
          <ul className="text-xs sm:text-sm text-green-700 space-y-1">
            <li>• Automatically recognizes and separates LNAT format files</li>
            <li>• Supports &quot;Passage 1 – Title &amp; Questions&quot; format</li>
            <li>• Finds and matches each passage &amp; own questions</li>
            <li>• Can upload multiple contents and navigate between them</li>
            <li>• AI automatically finds which question belongs to which text</li>
            <li>• Text is shown on the left, related questions are shown on the right</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={!combinedText.trim() || isLoading || isProcessing}
          className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing file...
            </>
          ) : (
            'Start Analysis'
          )}
        </button>
      </form>

      {combinedText && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Total Content:</strong> {combinedText.length} characters
          </p>
          <p className="text-sm text-gray-600">
            <strong>Estimated Time:</strong> {Math.ceil(combinedText.length / 200) + 5} minutes
          </p>
          {parsedContents.length > 0 && (
            <p className="text-sm text-gray-600">
              <strong>Uploaded Content Count:</strong> {parsedContents.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
} 