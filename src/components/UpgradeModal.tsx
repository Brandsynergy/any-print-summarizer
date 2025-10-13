'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  reason: 'usage_limit' | 'academic_mode'
  usedCount?: number
}

export default function UpgradeModal({ isOpen, onClose, reason, usedCount = 0 }: UpgradeModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { data: session } = useSession()

  const handleUpgrade = async () => {
    if (!session) {
      // Redirect to sign in first
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent('/pricing')}`
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      alert('Something went wrong. Please try again.')
      setIsProcessing(false)
    }
  }

  const getModalContent = () => {
    switch (reason) {
      case 'usage_limit':
        return {
          title: "You've Used Your Free Summaries! 🎯",
          subtitle: `You've completed ${usedCount} of 2 free summaries`,
          description: "Ready to unlock unlimited access? Get lifetime premium for just $67!",
          benefits: [
            "✅ Unlimited Standard Summaries",
            "✅ Unlimited Academic Analysis",
            "✅ Priority Processing",
            "✅ Advanced Features",
            "✅ Lifetime Access - No Monthly Fees!"
          ]
        }
      case 'academic_mode':
        return {
          title: "Academic Analysis is Premium! 🎓",
          subtitle: "You need premium access to use Academic Mode",
          description: "Unlock detailed academic analysis with comprehensive research-level summaries!",
          benefits: [
            "📚 Comprehensive Academic Analysis",
            "🔬 Research-Level Detail",
            "📊 Citations and References",
            "🧠 Critical Thinking Insights",
            "✅ Plus All Standard Features"
          ]
        }
      default:
        return {
          title: "Upgrade to Premium! 🚀",
          subtitle: "Unlock all features",
          description: "Get the most out of Any Print Summarizer!",
          benefits: []
        }
    }
  }

  const content = getModalContent()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-purple-100 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-center">
                <div className="text-5xl mb-2">💎</div>
                <h2 className="text-2xl font-bold text-white font-comic">
                  {content.title}
                </h2>
                <p className="text-purple-100 font-comic mt-2">
                  {content.subtitle}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700 font-comic text-center mb-6 text-lg">
                  {content.description}
                </p>

                {/* Benefits List */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-gray-800 mb-3 font-comic text-center">
                    🎉 What You'll Get:
                  </h3>
                  <ul className="space-y-2">
                    {content.benefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="text-gray-700 font-comic"
                      >
                        {benefit}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Pricing */}
                <div className="text-center mb-6">
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <div className="text-gray-500 line-through text-lg font-comic">
                      Was: $197.00
                    </div>
                    <div className="text-3xl font-bold text-green-600 font-comic">
                      Now: $67.00
                    </div>
                    <div className="text-purple-600 font-bold font-comic">
                      💥 Save $130! (66% OFF)
                    </div>
                    <div className="text-sm text-gray-600 font-comic mt-1">
                      One-time payment • Lifetime access
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 font-comic disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    {isProcessing ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </span>
                    ) : session ? (
                      '🚀 Upgrade to Premium - $67'
                    ) : (
                      '🔐 Sign In & Upgrade - $67'
                    )}
                  </button>

                  {!session && (
                    <Link
                      href="/pricing"
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors duration-200 font-comic text-center"
                    >
                      📋 View Full Pricing Details
                    </Link>
                  )}

                  <button
                    onClick={onClose}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors duration-200 font-comic"
                  >
                    Maybe Later
                  </button>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500 font-comic">
                    💳 Secure payment powered by Stripe<br />
                    🛡️ 100% satisfaction guaranteed
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}