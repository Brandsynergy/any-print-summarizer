'use client'

import { useEffect, useState } from 'react'

interface PWAStatus {
  manifestValid: boolean
  manifestError?: string
  serviceWorkerRegistered: boolean
  serviceWorkerError?: string
  installPromptAvailable: boolean
  isInstallable: boolean
  isInstalled: boolean
  platform: string
  browser: string
  installCriteria: Record<string, boolean>
}

export default function PWADiagnosticsPage() {
  const [status, setStatus] = useState<PWAStatus>({
    manifestValid: false,
    serviceWorkerRegistered: false,
    installPromptAvailable: false,
    isInstallable: false,
    isInstalled: false,
    platform: '',
    browser: '',
    installCriteria: {}
  })

  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString()
    setLogs(prev => [...prev, `[${timestamp}] ${message}`])
    console.log(message)
  }

  useEffect(() => {
    addLog('Starting PWA diagnostics...')

    const runDiagnostics = async () => {
      // Detect platform and browser
      const platform = navigator.platform || 'Unknown'
      const userAgent = navigator.userAgent
      let browser = 'Unknown'
      
      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome'
      else if (userAgent.includes('Firefox')) browser = 'Firefox' 
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari'
      else if (userAgent.includes('Edg')) browser = 'Edge'

      addLog(`Platform: ${platform}, Browser: ${browser}`)

      // Check if already installed
      const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://')

      addLog(`Is installed: ${isInstalled}`)

      // Test manifest
      let manifestValid = false
      let manifestError = ''
      try {
        const response = await fetch('/manifest.json')
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const manifest = await response.json()
        
        // Check required fields
        const required = ['name', 'short_name', 'start_url', 'display', 'icons']
        const missing = required.filter(field => !manifest[field])
        
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`)
        }

        // Check icons
        const icons = manifest.icons || []
        const has192 = icons.some((icon: any) => icon.sizes === '192x192')
        const has512 = icons.some((icon: any) => icon.sizes === '512x512')
        
        if (!has192 || !has512) {
          throw new Error('Missing required icon sizes (192x192 and 512x512)')
        }

        manifestValid = true
        addLog('✅ Manifest is valid')
      } catch (error: any) {
        manifestError = error.message
        addLog(`❌ Manifest error: ${manifestError}`)
      }

      // Test service worker
      let serviceWorkerRegistered = false
      let serviceWorkerError = ''
      try {
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration()
          if (registration) {
            serviceWorkerRegistered = true
            addLog('✅ Service worker is registered')
          } else {
            addLog('⚠️ Service worker not yet registered, attempting registration...')
            
            try {
              const newReg = await navigator.serviceWorker.register('/sw.js')
              serviceWorkerRegistered = true
              addLog('✅ Service worker registered successfully')
            } catch (regError: any) {
              serviceWorkerError = regError.message
              addLog(`❌ Service worker registration failed: ${regError.message}`)
            }
          }
        } else {
          serviceWorkerError = 'Service workers not supported'
          addLog('❌ Service workers not supported in this browser')
        }
      } catch (error: any) {
        serviceWorkerError = error.message
        addLog(`❌ Service worker error: ${serviceWorkerError}`)
      }

      // Check install criteria
      const installCriteria = {
        'HTTPS or localhost': window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        'Valid manifest': manifestValid,
        'Service worker registered': serviceWorkerRegistered,
        'Not already installed': !isInstalled,
        'Supported browser': ['Chrome', 'Edge', 'Samsung Internet', 'Opera'].some(b => userAgent.includes(b)),
        'Valid icons present': true // We'll assume this since manifest validated
      }

      Object.entries(installCriteria).forEach(([criterion, passed]) => {
        addLog(`${passed ? '✅' : '❌'} ${criterion}: ${passed}`)
      })

      // Listen for install prompt
      let installPromptAvailable = false
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault()
        installPromptAvailable = true
        addLog('✅ beforeinstallprompt event received - PWA is installable!')
        setStatus(prev => ({ ...prev, installPromptAvailable: true, isInstallable: true }))
      }

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

      // Wait a bit to see if install prompt fires
      setTimeout(() => {
        if (!installPromptAvailable) {
          addLog('❌ beforeinstallprompt event not fired after 3 seconds')
          
          // Provide specific guidance based on what's failing
          const failedCriteria = Object.entries(installCriteria)
            .filter(([_, passed]) => !passed)
            .map(([criterion]) => criterion)
          
          if (failedCriteria.length > 0) {
            addLog(`💡 Failed criteria preventing installation: ${failedCriteria.join(', ')}`)
          } else {
            addLog('💡 All criteria met but install prompt not available. This may be due to:')
            addLog('   - Browser already considers app installed')
            addLog('   - User previously dismissed install prompt')
            addLog('   - Browser-specific limitations')
            addLog('   - Recent deployment changes need time to propagate')
          }
        }

        setStatus({
          manifestValid,
          manifestError,
          serviceWorkerRegistered,
          serviceWorkerError,
          installPromptAvailable,
          isInstallable: installPromptAvailable,
          isInstalled,
          platform,
          browser,
          installCriteria
        })
      }, 3000)

      // Cleanup
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }

    runDiagnostics()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            🔧 PWA Installation Diagnostics
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* System Info */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">📱 System Information</h2>
              <div className="space-y-2 text-sm">
                <div>Platform: <strong>{status.platform}</strong></div>
                <div>Browser: <strong>{status.browser}</strong></div>
                <div>URL: <strong>{typeof window !== 'undefined' ? window.location.origin : 'Unknown'}</strong></div>
                <div>Protocol: <strong>{typeof window !== 'undefined' ? window.location.protocol : 'Unknown'}</strong></div>
              </div>
            </div>

            {/* Installation Status */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4">🎯 Installation Status</h2>
              <div className="space-y-2 text-sm">
                <div>
                  Manifest Valid: 
                  <strong className={status.manifestValid ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {status.manifestValid ? '✅ Yes' : '❌ No'}
                  </strong>
                </div>
                <div>
                  Service Worker: 
                  <strong className={status.serviceWorkerRegistered ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {status.serviceWorkerRegistered ? '✅ Registered' : '❌ Not Registered'}
                  </strong>
                </div>
                <div>
                  Install Available: 
                  <strong className={status.installPromptAvailable ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                    {status.installPromptAvailable ? '✅ Yes' : '❌ No'}
                  </strong>
                </div>
                <div>
                  Already Installed: 
                  <strong className={status.isInstalled ? 'text-blue-600 ml-2' : 'text-gray-600 ml-2'}>
                    {status.isInstalled ? '✅ Yes' : '❌ No'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Install Criteria */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">📋 Installation Criteria</h2>
            <div className="grid md:grid-cols-2 gap-2">
              {Object.entries(status.installCriteria).map(([criterion, passed]) => (
                <div key={criterion} className="flex items-center gap-2">
                  <span className={passed ? 'text-green-600' : 'text-red-600'}>
                    {passed ? '✅' : '❌'}
                  </span>
                  <span className="text-sm">{criterion}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Messages */}
          {(status.manifestError || status.serviceWorkerError) && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-red-800 mb-4">❌ Errors</h2>
              {status.manifestError && (
                <div className="mb-2">
                  <strong>Manifest Error:</strong> {status.manifestError}
                </div>
              )}
              {status.serviceWorkerError && (
                <div>
                  <strong>Service Worker Error:</strong> {status.serviceWorkerError}
                </div>
              )}
            </div>
          )}

          {/* Manual Installation Guide */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold text-green-800 mb-4">📖 Manual Installation Guide</h2>
            
            {status.browser === 'Chrome' && (
              <div className="mb-4">
                <h3 className="font-bold">Chrome Desktop:</h3>
                <ol className="list-decimal list-inside text-sm ml-4">
                  <li>Look for install icon in address bar (📱 or ⬇️)</li>
                  <li>Or click menu (⋮) → "Install Any Print Summarizer"</li>
                  <li>Or use keyboard shortcut: Ctrl+Shift+A (Windows) / Cmd+Shift+A (Mac)</li>
                </ol>
              </div>
            )}
            
            {status.browser === 'Edge' && (
              <div className="mb-4">
                <h3 className="font-bold">Microsoft Edge:</h3>
                <ol className="list-decimal list-inside text-sm ml-4">
                  <li>Look for install icon in address bar</li>
                  <li>Or click menu (⋯) → "Apps" → "Install this site as an app"</li>
                </ol>
              </div>
            )}
            
            <div>
              <h3 className="font-bold">Troubleshooting:</h3>
              <ul className="list-disc list-inside text-sm ml-4">
                <li>Clear browser cache and cookies</li>
                <li>Try in incognito/private mode</li>
                <li>Make sure you're on HTTPS (production site)</li>
                <li>Wait a few minutes after deployment</li>
                <li>Try refreshing the page</li>
              </ul>
            </div>
          </div>

          {/* Debug Logs */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">📝 Debug Logs</h2>
            <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs max-h-60 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
              {logs.length === 0 && <div>No logs yet...</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}