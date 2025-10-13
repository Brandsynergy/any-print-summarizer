'use client'

import { Suspense, useEffect } from 'react'

function IconTest({ size }: { size: number }) {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget
    img.style.backgroundColor = '#fee2e2'
    img.alt = '❌'
  }

  return (
    <div className="text-center">
      <img 
        src={`/icons/icon-${size}x${size}.png`}
        alt={`Icon ${size}x${size}`}
        className="w-8 h-8 mx-auto mb-1 border rounded"
        onError={handleError}
      />
      <div className="text-xs text-gray-600">{size}px</div>
    </div>
  )
}

function PWATestContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 font-comic">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              🚀 PWA Test Center
            </h1>
            <p className="text-gray-600 text-lg">
              Test your Progressive Web App features! 📱✨
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Installation Status */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                📱 Installation Status
              </h3>
              <div className="space-y-2 text-sm">
                <div id="standalone-status" className="p-2 bg-white rounded-lg">
                  <span className="font-semibold">Standalone Mode:</span>
                  <span id="standalone-value" className="ml-2">Checking...</span>
                </div>
                <div id="display-mode" className="p-2 bg-white rounded-lg">
                  <span className="font-semibold">Display Mode:</span>
                  <span id="display-mode-value" className="ml-2">Checking...</span>
                </div>
                <div id="platform-info" className="p-2 bg-white rounded-lg">
                  <span className="font-semibold">Platform:</span>
                  <span id="platform-value" className="ml-2">Checking...</span>
                </div>
              </div>
            </div>

            {/* Service Worker Status */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                ⚙️ Service Worker
              </h3>
              <div className="space-y-2 text-sm">
                <div id="sw-status" className="p-2 bg-white rounded-lg">
                  <span className="font-semibold">Status:</span>
                  <span id="sw-status-value" className="ml-2">Checking...</span>
                </div>
                <div id="sw-registration" className="p-2 bg-white rounded-lg">
                  <span className="font-semibold">Registration:</span>
                  <span id="sw-reg-value" className="ml-2">Checking...</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manifest Test */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 mb-8">
            <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
              📄 Manifest Test
            </h3>
            <button 
              id="test-manifest"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-200 transform hover:scale-105"
            >
              Test Manifest Access
            </button>
            <div id="manifest-result" className="mt-4 p-3 bg-white rounded-lg">
              <span className="text-gray-600">Click the button to test manifest.json accessibility</span>
            </div>
          </div>

          {/* Icons Test */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200 mb-8">
            <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-2">
              🎨 Icons Test
            </h3>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {[16, 32, 48, 72, 96, 128, 144, 152, 167, 180, 192, 256, 384, 512].map(size => (
                <IconTest key={size} size={size} />
              ))}
            </div>
          </div>

          {/* Manual Installation Instructions */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border border-indigo-200">
            <h3 className="text-xl font-bold text-indigo-800 mb-4 flex items-center gap-2">
              📋 Manual Installation Guide
            </h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-4 rounded-xl">
                <h4 className="font-bold text-indigo-600 mb-2">🍎 iOS Safari</h4>
                <ol className="space-y-1 text-gray-600">
                  <li>1. Tap Share button</li>
                  <li>2. Tap "Add to Home Screen"</li>
                  <li>3. Tap "Add"</li>
                </ol>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <h4 className="font-bold text-green-600 mb-2">🤖 Android Chrome</h4>
                <ol className="space-y-1 text-gray-600">
                  <li>1. Tap Menu (⋮)</li>
                  <li>2. Tap "Add to Home screen"</li>
                  <li>3. Tap "Add"</li>
                </ol>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <h4 className="font-bold text-blue-600 mb-2">💻 Desktop</h4>
                <ol className="space-y-1 text-gray-600">
                  <li>1. Look for install icon in address bar</li>
                  <li>2. Or use browser menu</li>
                  <li>3. Click "Install"</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PWATestPage() {
  useEffect(() => {
    function updateStatus() {
      // Check standalone mode
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://')
      
      const standaloneEl = document.getElementById('standalone-value')
      if (standaloneEl) standaloneEl.textContent = isStandalone ? '✅ Yes' : '❌ No'
      
      // Check display mode
      const displayModes = ['fullscreen', 'standalone', 'minimal-ui', 'browser']
      let currentMode = 'browser'
      for (const mode of displayModes) {
        if (window.matchMedia(`(display-mode: ${mode})`).matches) {
          currentMode = mode
          break
        }
      }
      const displayModeEl = document.getElementById('display-mode-value')
      if (displayModeEl) displayModeEl.textContent = currentMode
      
      // Platform info
      const platform = navigator.platform || (navigator as any).userAgentData?.platform || 'Unknown'
      const isMobile = /Mobi|Android/i.test(navigator.userAgent)
      const platformEl = document.getElementById('platform-value')
      if (platformEl) platformEl.textContent = platform + (isMobile ? ' (Mobile)' : ' (Desktop)')
      
      // Service Worker status
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(registration => {
          const statusEl = document.getElementById('sw-status-value')
          const regEl = document.getElementById('sw-reg-value')
          if (registration) {
            if (statusEl) statusEl.textContent = '✅ Active'
            if (regEl) regEl.textContent = '✅ Registered'
          } else {
            if (statusEl) statusEl.textContent = '❌ Not Active'
            if (regEl) regEl.textContent = '❌ Not Registered'
          }
        })
      } else {
        const statusEl = document.getElementById('sw-status-value')
        const regEl = document.getElementById('sw-reg-value')
        if (statusEl) statusEl.textContent = '❌ Not Supported'
        if (regEl) regEl.textContent = '❌ Not Supported'
      }
    }
    
    // Test manifest accessibility
    const testButton = document.getElementById('test-manifest')
    const handleManifestTest = () => {
      fetch('/manifest.json')
        .then(response => response.json())
        .then(manifest => {
          const resultEl = document.getElementById('manifest-result')
          if (resultEl) {
            resultEl.innerHTML = 
              '<div class="text-green-600">✅ Manifest loaded successfully!</div>' +
              '<div class="text-sm text-gray-600 mt-2">Name: ' + manifest.name + '</div>' +
              '<div class="text-sm text-gray-600">Short Name: ' + manifest.short_name + '</div>' +
              '<div class="text-sm text-gray-600">Theme Color: ' + manifest.theme_color + '</div>'
          }
        })
        .catch(error => {
          const resultEl = document.getElementById('manifest-result')
          if (resultEl) {
            resultEl.innerHTML = 
              '<div class="text-red-600">❌ Failed to load manifest: ' + error.message + '</div>'
          }
        })
    }
    
    if (testButton) {
      testButton.addEventListener('click', handleManifestTest)
    }
    
    // Initialize
    updateStatus()
    
    // Cleanup
    return () => {
      if (testButton) {
        testButton.removeEventListener('click', handleManifestTest)
      }
    }
  }, [])

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-comic">Loading PWA Test... 🚀</div>
      </div>
    }>
      <PWATestContent />
    </Suspense>
  )
}
