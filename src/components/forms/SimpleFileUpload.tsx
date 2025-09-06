'use client';

import { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

interface SimpleFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
}

export default function SimpleFileUpload({ onFilesSelected, isProcessing }: SimpleFileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter(file => 
        file.type === 'application/pdf' || 
        file.type === 'text/plain' || 
        file.name.endsWith('.txt') || 
        file.name.endsWith('.pdf')
      );
      
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        onFilesSelected(validFiles);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => 
        file.type === 'application/pdf' || 
        file.type === 'text/plain' || 
        file.name.endsWith('.txt') || 
        file.name.endsWith('.pdf')
      );
      
      if (validFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...validFiles]);
        onFilesSelected(validFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full mb-8">
      {/* Ana Dosya Yükleme Alanı */}
      <div className="bg-green-50 p-6 rounded-xl border-2 border-dashed border-green-300">
        <h3 className="text-lg font-semibold text-green-800 mb-4 text-center">
          📁 File Upload
        </h3>
        
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-green-500 bg-green-100' 
              : 'border-green-400 hover:border-green-500 hover:bg-green-100'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt"
            onChange={handleFileSelect}
            className="hidden"
            disabled={isProcessing}
          />
          
          <div className="flex flex-col items-center">
            <Upload className="w-16 h-16 text-green-500 mb-4" />
            <File className="w-10 h-10 text-green-600 mb-3" />
            <p className="text-xl font-bold text-green-800 mb-3">
              {dragActive ? '📁 Drop files here' : '📁 Upload LNAT files'}
            </p>
            <p className="text-base text-green-700 mb-4">
              PDF and TXT files are supported. You can upload multiple files.
            </p>
            <div className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
              <p className="text-sm text-green-800 font-semibold mb-2">✅ Supported Formats:</p>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Passage 1 – Title (PREP format)</li>
                <li>• === Title === format</li>
                <li>• --- QUESTIONS --- format</li>
                <li>• Automatic text/question separation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Seçilen Dosyalar Listesi */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Files:</h4>
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <File className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB • {file.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove this file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 