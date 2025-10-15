'use client';

import { useState, useEffect } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ProcessingSteps } from '@/components/ProcessingSteps';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import UpgradeModal from '@/components/UpgradeModal';
import { motion } from 'framer-motion';
import { detectBookCover, cleanBookTitle, cleanAuthorName } from '@/utils/bookDetection';
import { useSession, signIn } from 'next-auth/react';
import toast from 'react-hot-toast';

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

export type SummaryMode = 'standard' | 'academic';

export interface ProcessingResult {
  summary: string;
  takeaways: string;
  wordCount: {
    summary: number;
    takeaways: number;
    original: number;
  };
  summaryMode: SummaryMode;
  academicContext?: string;
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
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status || 'loading';
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'results'>('upload');
  const [summaryMode, setSummaryMode] = useState<SummaryMode>('standard');
  const [userStats, setUserStats] = useState({ standardUsed: 0, academicUsed: 0, isPremium: false });
  const [isPremiumLocal, setIsPremiumLocal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'usage_limit' | 'academic_mode'>('usage_limit');
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

  // Check localStorage for premium status
  useEffect(() => {
    const checkPremiumStatus = () => {
      const premiumStatus = localStorage.getItem('isPremium')
      const premiumEmail = localStorage.getItem('premiumEmail')
      const currentEmail = session?.user?.email
      
      if (premiumStatus === 'true' && premiumEmail === currentEmail) {
        setIsPremiumLocal(true)
        // Also update userStats to reflect premium status
        setUserStats(prev => ({ ...prev, isPremium: true }))
      }
    }
    
    checkPremiumStatus()
  }, [session])

  // Combined premium status
  const isPremium = (session?.user as any)?.isPremium || isPremiumLocal

  // Fetch user stats when session changes
  useEffect(() => {
    const fetchUserStats = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/stats');
          const data = await response.json();
          if (data.success) {
            setUserStats({
              standardUsed: data.user.standardUsed || 0,
              academicUsed: data.user.academicUsed || 0,
              isPremium: data.user.isPremium || false
            });
          }
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
        }
      } else {
        // Anonymous user - check local storage
        const localUsage = localStorage.getItem('anonymousUsage');
        if (localUsage) {
          const usage = JSON.parse(localUsage);
          setUserStats({
            standardUsed: usage.standardUsed || 0,
            academicUsed: usage.academicUsed || 0,
            isPremium: false
          });
        }
      }
    };
    
    if (status !== 'loading') {
      fetchUserStats();
    }
  }, [session, status]);

  // Check if user can perform action
  const canPerformAction = (mode: SummaryMode) => {
    // Premium users can do anything
    if (session && isPremium) {
      return { canProceed: true, reason: null };
    }
    
    if (userStats.isPremium) {
      return { canProceed: true, reason: null };
    }

    // Academic mode requires premium
    if (mode === 'academic') {
      return { canProceed: false, reason: 'academic_mode' as const };
    }

    // Standard mode: 2 free summaries
    if (userStats.standardUsed >= 2) {
      return { canProceed: false, reason: 'usage_limit' as const };
    }

    return { canProceed: true, reason: null };
  };

  // Update usage count after successful processing
  const updateUsageCount = async (mode: SummaryMode) => {
    if (session?.user) {
      // Update in database
      try {
        await fetch('/api/user/update-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode })
        });
      } catch (error) {
        console.error('Failed to update usage:', error);
      }
    } else {
      // Update local storage for anonymous users
      const localUsage = JSON.parse(localStorage.getItem('anonymousUsage') || '{}');
      if (mode === 'standard') {
        localUsage.standardUsed = (localUsage.standardUsed || 0) + 1;
      } else {
        localUsage.academicUsed = (localUsage.academicUsed || 0) + 1;
      }
      localStorage.setItem('anonymousUsage', JSON.stringify(localUsage));
      setUserStats(prev => ({
        ...prev,
        standardUsed: localUsage.standardUsed || 0,
        academicUsed: localUsage.academicUsed || 0
      }));
    }
  };

  const handleFileUpload = (file: File) => {
    // Check if user can perform this action
    const { canProceed, reason } = canPerformAction(summaryMode);
    
    if (!canProceed && reason) {
      setUpgradeReason(reason);
      setShowUpgradeModal(true);
      return;
    }

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
            }
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
      
      console.log('Cleaned title for search:', bookDetection.title ? cleanBookTitle(bookDetection.title) : 'none');
      console.log('Cleaned author for search:', bookDetection.author ? cleanAuthorName(bookDetection.author) : 'none');
      
      let finalText = text;
      let bookInfo = null;
      let isBookSummary = false;
      
      // STRICT book detection - only search if we have high confidence
      let shouldSearchAsBook: boolean = false;
      let searchTitle: string | undefined;
      let searchAuthor: string | undefined;
      
      // Only proceed if we have STRONG book indicators
      if (bookDetection.isBookCover && bookDetection.confidence > 0.5 && bookDetection.title) {
        shouldSearchAsBook = true;
        searchTitle = bookDetection.title;
        searchAuthor = bookDetection.author;
        console.log('CONFIDENT book detection - proceeding with search');
      } else {
        console.log('LOW CONFIDENCE book detection - treating as regular text');
        console.log('Confidence:', bookDetection.confidence, 'Required: > 0.5');
        console.log('Has title:', !!bookDetection.title);
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
              // VERIFY the found book matches what we detected
              const foundTitle = bookData.book.title.toLowerCase();
              const searchedTitle = (searchTitle || '').toLowerCase();
              const foundAuthor = bookData.book.authors[0]?.toLowerCase() || '';
              const searchedAuthor = (searchAuthor || '').toLowerCase();
              
              // Check title similarity (must have significant overlap)
              const titleMatch = foundTitle.includes(searchedTitle.substring(0, Math.min(10, searchedTitle.length))) ||
                               searchedTitle.includes(foundTitle.substring(0, Math.min(10, foundTitle.length)));
              
              // Check author similarity if we detected an author
              const authorMatch = !searchedAuthor || 
                                foundAuthor.includes(searchedAuthor.split(' ')[0]) ||
                                searchedAuthor.includes(foundAuthor.split(' ')[0]);
              
              console.log('BOOK VERIFICATION:');
              console.log('Detected title:', searchedTitle);
              console.log('Found title:', foundTitle);
              console.log('Title match:', titleMatch);
              console.log('Detected author:', searchedAuthor);
              console.log('Found author:', foundAuthor);
              console.log('Author match:', authorMatch);
              
              if (titleMatch && authorMatch) {
                bookInfo = bookData.book;
                isBookSummary = true;
                
                // Use book description and additional content for summarization
                let bookDescription = bookInfo.description || '';
                let additionalContent = bookData.additionalContent || '';
                
                // Limit content length to prevent API timeouts
                const maxDescLength = 3000;
                if (bookDescription.length > maxDescLength) {
                  bookDescription = bookDescription.substring(0, maxDescLength) + '...';
                }
                if (additionalContent.length > 1000) {
                  additionalContent = additionalContent.substring(0, 1000) + '...';
                }
                
                finalText = `Book Title: ${bookInfo.title}
                Author: ${bookInfo.authors.join(', ')}
                Published: ${bookInfo.publishedDate} by ${bookInfo.publisher}
                
                Description: ${bookDescription}
                
                ${additionalContent}
                
                Categories: ${bookInfo.categories.join(', ')}
                Page Count: ${bookInfo.pageCount}
                ${bookInfo.averageRating ? `Rating: ${bookInfo.averageRating}/5 (${bookInfo.ratingsCount} reviews)` : ''}`;
                
                console.log('✅ VERIFIED MATCH - Using book data for summarization');
              } else {
                console.log('❌ VERIFICATION FAILED - Found book does not match detected text');
                console.log('Falling back to regular OCR text summarization');
              }
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
      
      // Update step description based on mode
      setProcessingSteps(prev => 
        prev.map(step => 
          step.id === 'summarize' 
            ? { 
                ...step, 
                description: summaryMode === 'academic' 
                  ? 'Creating comprehensive academic analysis...' 
                  : 'Making a short and easy summary'
              }
            : step
        )
      );
      
      console.log(`Starting ${summaryMode} summarization...`);
      console.log('Text to summarize:', finalText.substring(0, 200) + '...');
      
      const summaryResponse = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-is-premium': isPremium ? 'true' : 'false',
        },
        body: JSON.stringify({ 
          text: finalText, 
          mode: summaryMode 
        }),
      });
      
      if (!summaryResponse.ok) {
        const errorText = await summaryResponse.text();
        throw new Error(`Summarization failed: ${errorText}`);
      }
      
      const summaryData = await summaryResponse.json();
      
      // Add book information to results if available
      const finalResults = {
        ...summaryData,
        summaryMode,
        isBookSummary,
        bookInfo
      };
      
      updateStepStatus('summarize', 'completed');
      updateStepStatus('complete', 'completed');
      
      // Update usage count after successful processing
      await updateUsageCount(summaryMode);
      
      // Show success message
      toast.success(`${summaryMode === 'academic' ? 'Academic analysis' : 'Summary'} completed successfully!`);
      
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
          
          {/* Summary Mode Selector */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 max-w-md mx-auto"
          >
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 font-comic text-center">
                Choose Your Summary Style 🎯
              </h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setSummaryMode('standard')}
                  className={`flex-1 py-3 px-4 rounded-xl font-comic font-semibold transition-all duration-200 ${
                    summaryMode === 'standard'
                      ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🌟</div>
                  <div className="text-sm">Standard</div>
                  <div className="text-xs opacity-75">Up to 2,000 words</div>
                </button>
                <button
                  onClick={() => {
                    if (canPerformAction('academic').canProceed) {
                      setSummaryMode('academic');
                    } else {
                      setUpgradeReason('academic_mode');
                      setShowUpgradeModal(true);
                    }
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl font-comic font-semibold transition-all duration-200 relative ${
                    summaryMode === 'academic'
                      ? 'bg-purple-500 text-white shadow-lg transform scale-105'
                      : canPerformAction('academic').canProceed
                      ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      : 'bg-gradient-to-r from-purple-100 to-yellow-100 text-purple-700 hover:from-purple-200 hover:to-yellow-200 border-2 border-yellow-300'
                  }`}
                >
                  {!canPerformAction('academic').canProceed && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-yellow-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      💎
                    </div>
                  )}
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="text-sm">Academic</div>
                  <div className="text-xs opacity-75">
                    {canPerformAction('academic').canProceed ? 'Up to 10,000 words' : 'Premium Only'}
                  </div>
                </button>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600 font-comic">
                  {summaryMode === 'standard' 
                    ? 'Perfect for quick understanding and general reading 📖' 
                    : 'Detailed analysis for research, studying, and in-depth learning 📚'}
                </p>
                
                {/* Usage Counter */}
                {!session && (
                  <div className="mt-2 text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 inline-block">
                      <p className="text-xs text-blue-700 font-bold font-comic">
                        📊 Free Usage: {userStats.standardUsed}/2 summaries used
                      </p>
                      {userStats.standardUsed >= 1 && (
                        <p className="text-xs text-blue-600 font-comic mt-1">
                          💡 Sign in to track your usage and get premium features!
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {session && !isPremium && (
                  <div className="mt-2 text-center">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
                      <p className="text-xs text-amber-700 font-bold font-comic">
                        📊 Free Usage: {userStats.standardUsed}/2 summaries used
                      </p>
                      {userStats.standardUsed >= 1 && (
                        <p className="text-xs text-amber-600 font-comic mt-1">
                          🚀 Upgrade to Premium for unlimited access!
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {session && isPremium && (
                  <div className="mt-2 text-center">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 inline-block">
                      <p className="text-xs text-green-700 font-bold font-comic">
                        ⭐ Premium User - Unlimited Access!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
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
        
        {/* Upgrade Modal */}
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          reason={upgradeReason}
          usedCount={userStats.standardUsed}
        />
      </div>
    </div>
  );
}
