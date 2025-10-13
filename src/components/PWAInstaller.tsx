'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(iOS)

    // Check if app is running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone ||
                      document.referrer.includes('android-app://')
    setIsStandalone(standalone)

    // Don't show install banner if already installed
    if (standalone) {
      setIsInstalled(true)
      return
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Show install banner after a short delay
      setTimeout(() => {
        setShowInstallBanner(true)
      }, 3000) // Wait 3 seconds before showing
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setShowInstallBanner(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallBanner(false)
      }
    }
  }

  const dismissBanner = () => {
    setShowInstallBanner(false)
    // Don't show again for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('pwa-banner-dismissed', 'true')
    }
  }

  // Don't show if already installed or dismissed this session
  if (isInstalled || isStandalone || (typeof window !== 'undefined' && sessionStorage.getItem('pwa-banner-dismissed'))) {
    return null
  }

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {showInstallBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-2xl p-4 text-white border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-500">A</span>
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm mb-1 font-comic">
                    Install AEYE Summarizer
                  </h3>
                  <p className="text-xs text-blue-100 font-comic mb-3">
                    Add to your home screen for quick access. Works offline too! 📱✨
                  </p>
                  
                  <div className="flex gap-2">
                    {deferredPrompt && !isIOS && (
                      <button
                        onClick={handleInstallClick}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg text-xs font-bold font-comic hover:bg-blue-50 transition-colors"
                      >
                        Install App
                      </button>
                    )}
                    
                    {isIOS && (
                      <button
                        onClick={() => setShowInstallBanner(false)}
                        className="bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold font-comic hover:bg-white/30 transition-colors"
                      >
                        Got it!
                      </button>
                    )}
                    
                    <button
                      onClick={dismissBanner}
                      className="text-white/80 hover:text-white text-xs p-2 font-comic"
                    >
                      Maybe later
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={dismissBanner}
                  className="text-white/60 hover:text-white p-1 text-lg"
                >
                  ×
                </button>
              </div>
              
              {isIOS && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-xs text-blue-100 font-comic">
                    📱 To install on iOS: Tap <span className="font-bold">Share</span> → <span className="font-bold">Add to Home Screen</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Button in Navigation (optional) */}
      {deferredPrompt && !showInstallBanner && (
        <button
          onClick={handleInstallClick}
          className="hidden md:flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200"
          title="Install AEYE Summarizer"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Install App
        </button>
      )}
    </>
  )
}