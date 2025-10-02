'use client';

import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ProcessingSteps } from '@/components/ProcessingSteps';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { motion } from 'framer-motion';
import { detectBookCover, cleanBookTitle, cleanAuthorName } from '@/utils/bookDetection';

// Image preprocessing function to improve OCR accuracy and speed
async function preprocessImageForOCR(file: File): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Set canvas size - scale down large images for faster processing
      const maxWidth = 2000;
      const maxHeight = 2000;
      
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and enhance the image
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to higher contrast (optional enhancement)
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        // Simple contrast enhancement
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const factor = 1.2; // Increase contrast
        
        data[i] = Math.min(255, Math.max(0, (data[i] - avg) * factor + avg));     // Red
        data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - avg) * factor + avg)); // Green
        data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - avg) * factor + avg)); // Blue
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      // Convert back to file
      canvas.toBlob((blob) => {
        if (blob) {
          const processedFile = new File([blob], file.name, {
            type: 'image/png',
            lastModified: Date.now()
          });
          resolve(processedFile);
        } else {
          resolve(file); // Fallback to original file
        }
      }, 'image/png', 0.95);
    };
    
    img.onerror = () => {
      resolve(file); // Fallback to original file if processing fails
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export interface ProcessingResult {
  summary: string;
  takeaways: string;
  wordCount: {
    summary: number;
    takeaways: number;
    original: number;
  };
  isBookSummary?: boolean;
  bookInfo?: {
    title: string;
    authors: string[];
    publishedDate: string;
    publisher: string;
    description: string;
    pageCount: string | number;
    categories: string[];
    averageRating: number | null;
    ratingsCount: number | null;
    thumbnail: string | null;
    previewLink: string | null;
    infoLink: string | null;
  };
}

export interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  error?: string;
}

export default function HomePage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    {
      id: 'upload',
      title: 'Upload Image',
      description: 'Getting your image ready',
      status: 'pending'
    },
    {
      id: 'extract',
      title: 'Read Text',
      description: 'Reading all the words in your picture',
      status: 'pending'
    },
    {
      id: 'analyze',
      title: 'Smart Analysis',
      description: 'Checking if this is a book cover',
      status: 'pending'
    },
    {
      id: 'summarize',
      title: 'Create Summary',
      description: 'Making a short and easy summary',
      status: 'pending'
    },
    {
      id: 'complete',
      title: 'All Done!',
      description: 'Your summary is ready',
      status: 'pending'
    }
  ]);
  const [results, setResults] = useState<ProcessingResult | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number>(0);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentStep('processing');
    startProcessing(file);
  };

  const updateStepStatus = (stepId: string, status: ProcessingStep['status'], error?: string) => {
    setProcessingSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, status, error }
          : step
      )
    );
  };

  const startProcessing = async (file: File) => {
    try {
      // Step 1: Upload and Process
      updateStepStatus('upload', 'active');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }
      
      const uploadData = await uploadResponse.json();
      updateStepStatus('upload', 'completed');
      
      // Step 2: Extract text with OCR (Client-side with faster settings)
      updateStepStatus('extract', 'active');
      
      console.log('Starting optimized OCR process...');
      setOcrProgress(20);
      
      let text: string;
      
      try {
        const Tesseract = (await import('tesseract.js')).default;
        console.log('Tesseract loaded successfully');
        setOcrProgress(30);
        
        // Use faster OCR settings for quicker processing
        const { data: { text: extractedText } } = await Tesseract.recognize(
          uploadData.imageData, 
          'eng', 
          {
            logger: (m: any) => {
              if (m.status === 'recognizing text') {
                const progress = Math.round(30 + (m.progress * 60)); // 30-90% range
                setOcrProgress(progress);
              }
            },
            // Faster OCR settings
            tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
            tessedit_ocr_engine_mode: Tesseract.OEM.TESSERACT_LSTM_COMBINED
          }
        );
        
        text = extractedText;
        setOcrProgress(100);
        console.log('OCR completed. Extracted text length:', text?.length || 0);
        
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
        // Fallback: Try with basic settings
        console.log('Trying OCR with basic settings...');
        
        try {
          const Tesseract = (await import('tesseract.js')).default;
          const { data: { text: fallbackText } } = await Tesseract.recognize(
            uploadData.imageData,
            'eng'
          );
          text = fallbackText;
          setOcrProgress(100);
        } catch (fallbackError) {
          throw new Error('OCR processing failed. Please try a clearer image.');
        }
      }
      
      if (!text || text.trim().length < 10) {
        throw new Error(`Could not read enough text from the image. Only found ${text?.trim()?.length || 0} characters. Please try a clearer image.`);
      }
      
      console.log('OCR Text extracted successfully:', text.substring(0, 100) + '...');
      
      updateStepStatus('extract', 'completed');
      
      // Step 3: Smart Analysis - Check if this is a book cover
      updateStepStatus('analyze', 'active');
      
      console.log('=== BOOK DETECTION DEBUG ===');
      console.log('OCR Text (first 500 chars):', text.substring(0, 500));
      console.log('OCR Text lines:', text.split('\n').filter((line: string) => line.trim()));
      
      const bookDetection = detectBookCover(text);
      console.log('Book detection result:', {
        isBookCover: bookDetection.isBookCover,
        confidence: bookDetection.confidence,
        title: bookDetection.title,
        author: bookDetection.author,
        extractedLines: bookDetection.extractedLines
      });
      
      let finalText = text;
      let bookInfo = null;
      let isBookSummary = false;
      
      // Check if this might be a book cover (either detected or fallback)
      let shouldSearchAsBook: boolean = bookDetection.isBookCover && !!bookDetection.title;
      let searchTitle: string | undefined = bookDetection.title;
      let searchAuthor: string | undefined = bookDetection.author;
      
      // Fallback: If not detected as book but text is short and looks like title/author
      if (!shouldSearchAsBook) {
        const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
        const significantLines = lines.filter((line: string) => 
          line.length > 3 && 
          line.length < 100 && 
          !/^\d+$/.test(line.trim()) &&
          /[a-zA-Z]/.test(line)
        );
        
        console.log('Fallback check - significant lines:', significantLines);
        
        // If we have 1-6 short lines, treat as potential book cover
        if (significantLines.length >= 1 && significantLines.length <= 6) {
          shouldSearchAsBook = true;
          searchTitle = significantLines[0]; // Use first line as title
          if (significantLines.length > 1) {
            // Look for author in remaining lines
            for (let i = 1; i < significantLines.length; i++) {
              const line = significantLines[i].trim();
              if (line.length > 3 && line.length < 50) {
                searchAuthor = line;
                break;
              }
            }
          }
          console.log('Fallback book detection activated:', { searchTitle, searchAuthor });
        }
      }
      
      if (shouldSearchAsBook && searchTitle) {
        updateStepStatus('analyze', 'active');
        console.log('Searching for book online...', {
          title: searchTitle,
          author: searchAuthor,
          confidence: bookDetection.confidence,
          source: bookDetection.isBookCover ? 'detection' : 'fallback'
        });
        
        try {
          const bookSearchResponse = await fetch('/api/search-book', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: cleanBookTitle(searchTitle),
              author: searchAuthor ? cleanAuthorName(searchAuthor) : undefined
            })
          });
          
          if (bookSearchResponse.ok) {
            const bookData = await bookSearchResponse.json();
            if (bookData.success) {
              bookInfo = bookData.book;
              isBookSummary = true;
              
              // Use book description and additional content for summarization
              finalText = `Book Title: ${bookInfo.title}
              Author: ${bookInfo.authors.join(', ')}
              Published: ${bookInfo.publishedDate} by ${bookInfo.publisher}
              
              Description: ${bookInfo.description}
              
              ${bookData.additionalContent || ''}
              
              Categories: ${bookInfo.categories.join(', ')}
              Page Count: ${bookInfo.pageCount}
              ${bookInfo.averageRating ? `Rating: ${bookInfo.averageRating}/5 (${bookInfo.ratingsCount} reviews)` : ''}`;
              
              console.log('Using book data for summarization');
            }
          }
        } catch (bookError) {
          console.log('Book search failed, using OCR text instead:', bookError);
        }
      } else {
        console.log('Not detected as book cover, using regular OCR text');
      }
      
      updateStepStatus('analyze', 'completed');
      
      // Step 4: Create Summary
      updateStepStatus('summarize', 'active');
      
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: finalText }),
      });
      
      if (!summaryResponse.ok) {
        const error = await summaryResponse.json();
        throw new Error(error.error || 'Summarization failed');
      }
      
      const summaryData = await summaryResponse.json();
      
      // Add book information to results if available
      const finalResults = {
        ...summaryData,
        isBookSummary,
        bookInfo
      };
      
      updateStepStatus('summarize', 'completed');
      updateStepStatus('complete', 'completed');
      
      setResults(finalResults);
      setCurrentStep('results');
      
    } catch (error: any) {
      console.error('Processing error:', error);
      const activeStep = processingSteps.find(step => step.status === 'active');
      if (activeStep) {
        updateStepStatus(activeStep.id, 'error', error.message);
      }
    }
  };

  const handleStartOver = () => {
    setUploadedFile(null);
    setCurrentStep('upload');
    setResults(null);
    setOcrProgress(0);
    setProcessingSteps(prev => 
      prev.map(step => ({ ...step, status: 'pending', error: undefined }))
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-full">
              <div className="text-6xl">📸</div>
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4 font-comic">
            Upload Any Picture with Text!
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-comic leading-relaxed">
            Take a photo of a book cover, article, or any text and I'll create a fun summary 
            plus 10 cool things you can learn! For book covers, I'll even search the internet 
            to get detailed information about the book! 📚🌟
          </p>
        </motion.div>

        {/* Main Content Area */}
        <div className="grid gap-8">
          {currentStep === 'upload' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ImageUploader onFileUpload={handleFileUpload} />
            </motion.div>
          )}

          {currentStep === 'processing' && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProcessingSteps 
                steps={processingSteps}
                onStartOver={handleStartOver}
                ocrProgress={ocrProgress}
              />
            </motion.div>
          )}

          {currentStep === 'results' && results && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ResultsDisplay 
                results={results}
                onStartOver={handleStartOver}
              />
            </motion.div>
          )}
        </div>

        {/* Features Section */}
        {currentStep === 'upload' && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16"
          >
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8 font-comic">
              What Can I Help You With? 🤔
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
                <div className="text-4xl mb-4">📖</div>
                <h4 className="font-bold text-lg mb-2 font-comic text-gray-800">Book Covers</h4>
                <p className="text-gray-600 font-comic">Take a photo of a book cover and I'll search the internet for it!</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-100 hover:border-green-300 transition-colors">
                <div className="text-4xl mb-4">📚</div>
                <h4 className="font-bold text-lg mb-2 font-comic text-gray-800">Book Pages</h4>
                <p className="text-gray-600 font-comic">Take a picture of any book page and get a summary!</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-colors">
                <div className="text-4xl mb-4">📰</div>
                <h4 className="font-bold text-lg mb-2 font-comic text-gray-800">Articles</h4>
                <p className="text-gray-600 font-comic">Upload newspaper or magazine articles!</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-amber-100 hover:border-amber-300 transition-colors">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="font-bold text-lg mb-2 font-comic text-gray-800">Any Text</h4>
                <p className="text-gray-600 font-comic">Screenshots, documents, or anything with words!</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}