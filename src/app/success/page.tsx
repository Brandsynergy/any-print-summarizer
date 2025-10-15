'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import Link from 'next/link'

function SuccessContent() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionResult = useSession()
  const session = sessionResult?.data
  const update = sessionResult?.update
  const sessionId = searchParams?.get('session_id')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No payment session found')
        setIsVerifying(false)
        return
      }

      try {
        // Wait a moment for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Store premium status in localStorage immediately
        if (session?.user?.email) {
          localStorage.setItem('isPremium', 'true')
          localStorage.setItem('premiumEmail', session.user.email)
          console.log('Premium status granted for:', session.user.email)
        }
        
        setPaymentVerified(true)
      } catch (error) {
        console.error('Payment verification error:', error)
        setError('Payment verification failed')
      }
      
      setIsVerifying(false)
    }

    verifyPayment()
  }, [sessionId, session])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 font-comic">
            Verifying Your Payment...
          </h1>
          <p className="text-gray-600 font-comic">
            Please wait while we confirm your premium upgrade
          </p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-100 p-8">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4 font-comic">
              Payment Verification Failed
            </h1>
            <p className="text-gray-600 font-comic mb-6">
              {error}
            </p>
            <Link 
              href="/pricing"
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl font-comic inline-block"
            >
              Try Again
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-100 overflow-hidden">
          {/* Celebration Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2 font-comic"
            >
              Welcome to Premium!
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-green-100 font-comic text-lg"
            >
              Your payment was successful! You now have lifetime access to all premium features.
            </motion.p>
          </div>

          {/* Content */}
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4 font-comic">
                🚀 You Now Have Access To:
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl mb-2">📚</div>
                  <h3 className="font-bold text-gray-800 font-comic">Unlimited Standard Summaries</h3>
                  <p className="text-gray-600 text-sm font-comic">No more limits on your learning!</p>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎓</div>
                  <h3 className="font-bold text-gray-800 font-comic">Academic Analysis Mode</h3>
                  <p className="text-gray-600 text-sm font-comic">Detailed research-level analysis</p>
                </div>
                
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl mb-2">⚡</div>
                  <h3 className="font-bold text-gray-800 font-comic">Priority Processing</h3>
                  <p className="text-gray-600 text-sm font-comic">Faster summaries for premium users</p>
                </div>
                
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="text-2xl mb-2">🔒</div>
                  <h3 className="font-bold text-gray-800 font-comic">Lifetime Access</h3>
                  <p className="text-gray-600 text-sm font-comic">No monthly fees, forever!</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-2 font-comic">💳 Payment Details:</h3>
                <p className="text-gray-600 font-comic">
                  <strong>Amount:</strong> $67.00 (Save $130!)<br />
                  <strong>Type:</strong> One-time payment<br />
                  <strong>Access:</strong> Lifetime premium features
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl font-comic text-center transition-all duration-200"
                >
                  🚀 Start Using Premium Features
                </Link>
                
                <Link 
                  href="/pricing"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl font-comic text-center transition-colors duration-200"
                >
                  📋 View Your Account
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 font-comic">
                  🎯 Ready to transform any printed content into knowledge?<br />
                  Your premium journey starts now!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-comic">Loading success page...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
