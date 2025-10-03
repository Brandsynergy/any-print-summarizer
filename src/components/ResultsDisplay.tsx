'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Sparkles, RotateCcw, Copy } from 'lucide-react';
import { ProcessingResult } from '@/app/page';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';

interface ResultsDisplayProps {
  results: ProcessingResult;
  onStartOver: () => void;
}

export function ResultsDisplay({ results, onStartOver }: ResultsDisplayProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    toast.loading('Creating your PDF...', { id: 'pdf-download' });

    try {
      // Create PDF using jsPDF with A4 format for better academic content support
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // Set up the PDF with more space for academic content
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15; // Smaller margins for more content
      const lineHeight = results.summaryMode === 'academic' ? 6 : 7;
      const maxWidth = pageWidth - (2 * margin);
      
      let yPosition = margin + 15;
      
      // Helper function to add text with pagination
      const addTextWithPagination = (text: string, fontSize: number = 12, isBold: boolean = false) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, maxWidth);
        
        for (const line of lines) {
          if (yPosition > pageHeight - margin - 15) {
            doc.addPage();
            yPosition = margin + 15;
          }
          doc.text(line, margin, yPosition);
          yPosition += lineHeight;
        }
      };
      
      // Title
      const title = results.summaryMode === 'academic' 
        ? 'Academic Analysis Report' 
        : 'Summary Report';
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, yPosition);
      yPosition += 12;
      
      // Mode indicator
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      const modeText = results.summaryMode === 'academic' 
        ? 'Comprehensive Academic Analysis' 
        : 'Standard Summary';
      doc.text(`Mode: ${modeText}`, margin, yPosition);
      yPosition += 8;
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated on: ${currentDate}`, margin, yPosition);
      yPosition += 15;
      
      // Summary Section
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const summaryTitle = results.summaryMode === 'academic' 
        ? 'ACADEMIC SUMMARY' 
        : 'SUMMARY';
      doc.text(summaryTitle, margin, yPosition);
      yPosition += 10;
      
      // Summary content
      addTextWithPagination(results.summary, 11);
      yPosition += 10;
      
      // Key Takeaways/Critical Insights Section
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin + 15;
      }
      
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const takeawaysTitle = results.summaryMode === 'academic' 
        ? 'CRITICAL INSIGHTS' 
        : 'KEY TAKEAWAYS';
      doc.text(takeawaysTitle, margin, yPosition);
      yPosition += 10;
      
      // Takeaways content
      addTextWithPagination(results.takeaways, 11);
      yPosition += 10;
      
      // Academic Context Section (only for academic mode)
      if (results.summaryMode === 'academic' && results.academicContext) {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin + 15;
        }
        
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ACADEMIC CONTEXT', margin, yPosition);
        yPosition += 10;
        
        addTextWithPagination(results.academicContext, 11);
      }
      
      // Statistics Section
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = margin + 15;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('STATISTICS', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const stats = [
        `Original text: ${results.wordCount.original} words`,
        `Summary: ${results.wordCount.summary} words`,
        `Takeaways: ${results.wordCount.takeaways} words`,
        `Compression ratio: ${Math.round((results.wordCount.summary / results.wordCount.original) * 100)}%`,
        `Analysis mode: ${results.summaryMode === 'academic' ? 'Academic (Comprehensive)' : 'Standard (General)'}`
      ];
      
      for (const stat of stats) {
        doc.text(stat, margin, yPosition);
        yPosition += 5;
      }
      
      // Footer with page numbers
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        
        // Footer text
        const footerText = results.summaryMode === 'academic'
          ? 'Generated by Any Print Summarizer - Academic Analysis Mode'
          : 'Generated by Any Print Summarizer - Making learning accessible for everyone!';
        
        doc.text(footerText, margin, pageHeight - 6);
        
        // Page number
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 6);
      }
      
      // Generate filename with mode indicator
      const modePrefix = results.summaryMode === 'academic' ? 'academic' : 'standard';
      const filename = `${modePrefix}-summary-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      toast.success(
        results.summaryMode === 'academic' 
          ? 'Academic analysis PDF downloaded! 📚✨' 
          : 'PDF downloaded successfully! 📄✨', 
        { id: 'pdf-download' }
      );
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.error(`Failed to generate PDF: ${error.message || 'Unknown error'}`, { id: 'pdf-download' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${type} copied to clipboard! 📋`);
    }).catch(() => {
      toast.error('Failed to copy text');
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          {results.isBookSummary ? '📚' : '🎉'}
        </motion.div>
        <h2 className="text-4xl font-bold text-gray-800 font-comic mb-2">
          {results.summaryMode === 'academic' 
            ? (results.isBookSummary 
                ? 'Academic Analysis of Your Book! 📚' 
                : 'Comprehensive Academic Analysis Complete! 🎓'
              )
            : (results.isBookSummary 
                ? 'Found Your Book! Here\'s the Summary! 📖' 
                : 'Ta-da! Your Summary is Ready! 🌟'
              )
          }
        </h2>
        <p className="text-lg text-gray-600 font-comic">
          {results.summaryMode === 'academic'
            ? (results.isBookSummary 
                ? 'I found detailed book information and created a comprehensive academic analysis!'
                : 'Here\'s a detailed academic analysis perfect for research and studying!'
              )
            : (results.isBookSummary 
                ? 'I searched the internet and found detailed information about this book!'
                : 'Here\'s everything you need to know, made simple and fun!'
              )
          }
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap justify-center gap-4 mb-8"
      >
        <motion.button
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="btn btn-primary btn-lg font-comic text-lg px-8 py-3 rounded-full shadow-lg inline-flex items-center space-x-2 disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download className="h-5 w-5" />
          <span>{isDownloading ? 'Creating PDF...' : 'Download PDF 📄'}</span>
        </motion.button>
        
        <motion.button
          onClick={onStartOver}
          className="btn btn-secondary btn-lg font-comic text-lg px-8 py-3 rounded-full shadow-lg inline-flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw className="h-5 w-5" />
          <span>Try Another Picture 🔄</span>
        </motion.button>
      </motion.div>

      {/* Book Information Section */}
      {results.isBookSummary && results.bookInfo && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-xl p-8 border-2 border-amber-200"
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Book Cover */}
            {results.bookInfo.thumbnail && (
              <div className="flex-shrink-0">
                <img 
                  src={results.bookInfo.thumbnail} 
                  alt={results.bookInfo.title}
                  className="w-32 h-48 object-cover rounded-lg shadow-lg mx-auto md:mx-0"
                />
              </div>
            )}
            
            {/* Book Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-amber-100 p-3 rounded-full">
                  <div className="text-2xl">📚</div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 font-comic">
                    Book Information
                  </h3>
                  <p className="text-sm text-gray-500">
                    Found on Google Books
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-lg text-gray-800 font-comic">
                    {results.bookInfo.title}
                  </h4>
                  <p className="text-gray-600">
                    by {results.bookInfo.authors.join(', ')}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Published:</span>
                    <p className="text-gray-600">{results.bookInfo.publishedDate}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Publisher:</span>
                    <p className="text-gray-600">{results.bookInfo.publisher}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Pages:</span>
                    <p className="text-gray-600">{results.bookInfo.pageCount}</p>
                  </div>
                  {results.bookInfo.averageRating && (
                    <div>
                      <span className="font-medium text-gray-700">Rating:</span>
                      <p className="text-gray-600">
                        {results.bookInfo.averageRating}/5 
                        {results.bookInfo.ratingsCount && ` (${results.bookInfo.ratingsCount} reviews)`}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">Categories:</span>
                  <p className="text-gray-600">{results.bookInfo.categories.join(', ')}</p>
                </div>
                
                {(results.bookInfo.previewLink || results.bookInfo.infoLink) && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {results.bookInfo.previewLink && (
                      <a 
                        href={results.bookInfo.previewLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-md text-sm px-4 py-2"
                      >
                        Preview Book 🔍
                      </a>
                    )}
                    {results.bookInfo.infoLink && (
                      <a 
                        href={results.bookInfo.infoLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-md text-sm px-4 py-2"
                      >
                        More Info 🔗
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Summary Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-blue-500"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 font-comic">
                {results.summaryMode === 'academic' ? 'Academic Summary 🎓' : 'Summary 📝'}
              </h3>
              <p className="text-sm text-gray-500">
                {results.wordCount.summary} words • 
                {results.summaryMode === 'academic' ? 'Comprehensive analysis' : 'Easy to read!'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => handleCopyText(results.summary, 'Summary')}
            className="btn btn-secondary btn-md inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </motion.button>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed font-comic text-lg whitespace-pre-wrap">
            {results.summary}
          </div>
        </div>
      </motion.div>

      {/* Takeaways Section */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-purple-500"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-800 font-comic">
                {results.summaryMode === 'academic' 
                  ? '10 Critical Academic Insights! 🔬' 
                  : '10 Cool Things to Learn! ✨'
                }
              </h3>
              <p className="text-sm text-gray-500">
                {results.summaryMode === 'academic' 
                  ? 'Critical insights and scholarly analysis'
                  : 'Key takeaways and lessons'
                }
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => handleCopyText(results.takeaways, 'Key takeaways')}
            className="btn btn-secondary btn-md inline-flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </motion.button>
        </div>
        
        <div className="prose prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed font-comic text-lg whitespace-pre-wrap">
            {results.takeaways}
          </div>
        </div>
      </motion.div>

      {/* Academic Context Section - Only for Academic Mode */}
      {results.summaryMode === 'academic' && results.academicContext && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-amber-500"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-3 rounded-full">
                <div className="text-2xl">🎓</div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 font-comic">
                  Academic Context 📚
                </h3>
                <p className="text-sm text-gray-500">
                  Additional scholarly context and applications
                </p>
              </div>
            </div>
            <motion.button
              onClick={() => handleCopyText(results.academicContext || '', 'Academic context')}
              className="btn btn-secondary btn-md inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </motion.button>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed font-comic text-lg whitespace-pre-wrap">
              {results.academicContext}
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200"
      >
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <h4 className="font-bold text-lg text-gray-800 font-comic mb-4">
            Reading Stats
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {results.wordCount.original}
              </div>
              <div className="text-sm text-gray-600 font-comic">
                Words in original
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {results.wordCount.summary}
              </div>
              <div className="text-sm text-gray-600 font-comic">
                Words in summary
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">
                {Math.round((results.wordCount.summary / results.wordCount.original) * 100)}%
              </div>
              <div className="text-sm text-gray-600 font-comic">
                Compression ratio
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Celebration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border-2 border-yellow-200"
      >
        <div className="text-4xl mb-4">🏆</div>
        <h4 className="text-2xl font-bold text-gray-800 font-comic mb-2">
          Great Job!
        </h4>
        <p className="text-lg text-gray-600 font-comic">
          You've successfully turned a picture into a summary! 
          Learning has never been this fun and easy! 🚀
        </p>
      </motion.div>
    </div>
  );
}