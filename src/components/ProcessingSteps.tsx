'use client';

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { ProcessingStep } from '@/app/page';

interface ProcessingStepsProps {
  steps: ProcessingStep[];
  onStartOver: () => void;
  ocrProgress?: number; // Progress percentage for OCR (0-100)
}

export function ProcessingSteps({ steps, onStartOver, ocrProgress = 0 }: ProcessingStepsProps) {
  const hasError = steps.some(step => step.status === 'error');
  const allCompleted = steps.every(step => step.status === 'completed');

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'active':
        return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <div className="h-8 w-8 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-500 bg-green-50';
      case 'active':
        return 'border-blue-500 bg-blue-50 pulse-color';
      case 'error':
        return 'border-red-500 bg-red-50 wobble';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            ⚡
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 font-comic mb-2">
            {hasError ? 'Oops! Something went wrong 😅' : 'Working My Magic! ✨'}
          </h2>
          <p className="text-lg text-gray-600 font-comic">
            {hasError 
              ? 'Don\'t worry, let\'s try again!' 
              : 'Please wait while I read and summarize your picture...'
            }
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 ${getStepColor(step)}`}
            >
              <div className="flex items-center space-x-4">
                <motion.div
                  animate={{ 
                    scale: step.status === 'active' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: step.status === 'active' ? Infinity : 0 
                  }}
                >
                  {getStepIcon(step)}
                </motion.div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 font-comic">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 font-comic">
                    {step.error || step.description}
                  </p>
                  
                  {step.status === 'active' && !step.error && (
                    <motion.div 
                      className="mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                        {step.id === 'extract' && ocrProgress > 0 ? (
                          // Show actual OCR progress
                          <motion.div 
                            className="h-full bg-blue-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${ocrProgress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        ) : (
                          // Show indeterminate progress for other steps
                          <motion.div 
                            className="h-full bg-blue-500 rounded-full"
                            animate={{ x: [-100, 100] }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              ease: "linear" 
                            }}
                          />
                        )}
                      </div>
                      {step.id === 'extract' && ocrProgress > 0 && (
                        <div className="text-xs text-blue-600 mt-1 font-comic">
                          {Math.round(ocrProgress)}% complete
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
                
                <div className="text-right">
                  {step.status === 'completed' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 500, 
                        damping: 30 
                      }}
                      className="text-green-600 font-comic font-bold"
                    >
                      Done! ✓
                    </motion.div>
                  )}
                  {step.status === 'active' && (
                    <div className="text-blue-600 font-comic font-bold animate-pulse">
                      Working...
                    </div>
                  )}
                  {step.status === 'error' && (
                    <div className="text-red-600 font-comic font-bold">
                      Error!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        {hasError && (
          <div className="text-center">
            <motion.button
              onClick={onStartOver}
              className="btn btn-primary btn-lg font-comic text-lg px-8 py-3 rounded-full shadow-lg inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="h-5 w-5" />
              <span>Try Again! 🔄</span>
            </motion.button>
          </div>
        )}

        {/* Fun Facts While Waiting */}
        {!hasError && !allCompleted && (
          <motion.div 
            className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(251, 191, 36, 0.3)",
                "0 0 40px rgba(251, 191, 36, 0.5)",
                "0 0 20px rgba(251, 191, 36, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center">
              <div className="text-3xl mb-2">🧠</div>
              <h4 className="font-bold text-lg text-gray-800 font-comic mb-2">
                Fun Fact!
              </h4>
              <p className="text-gray-600 font-comic">
                Did you know? I can read text in pictures just like you can! 
                I use special computer vision to understand what's written, 
                then I think really hard to make a summary that's easy to understand!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}