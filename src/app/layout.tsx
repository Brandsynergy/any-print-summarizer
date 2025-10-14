import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import OptionalSessionProvider from '@/components/OptionalSessionProvider'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'Any Print Summarizer - AEYE.NG',
  description: 'AI-powered app that transforms any printed content into easy summaries with just a photo. Upload, analyze, and learn instantly!',
  keywords: ['AI', 'OCR', 'summarization', 'education', 'text analysis', 'photo to text', 'document analysis'],
  authors: [{ name: 'AEYE.NG', url: 'https://aeye.ng' }],
  creator: 'AEYE.NG',
  publisher: 'AEYE.NG',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://your-app.onrender.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Any Print Summarizer - AEYE.NG',
    description: 'Transform any printed content into easy summaries with just a photo',
    url: '/',
    siteName: 'Any Print Summarizer',
    images: [
      {
        url: '/icons/icon-512x512.png',
        width: 512,
        height: 512,
        alt: 'Any Print Summarizer Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Any Print Summarizer - AEYE.NG',
    description: 'Transform any printed content into easy summaries with just a photo',
    images: ['/icons/icon-512x512.png'],
    creator: '@aeye_ng',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#3B82F6' },
    { media: '(prefers-color-scheme: dark)', color: '#1E40AF' },
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AEYE Summarizer',
    startupImage: [
      {
        url: '/icons/icon-512x512.png',
        media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'AEYE Summarizer',
    'application-name': 'AEYE Summarizer',
    'msapplication-TileColor': '#3B82F6',
    'msapplication-TileImage': '/icons/icon-144x144.png',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* PWA Icons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="mask-icon" href="/icons/icon-512x512.png" color="#3B82F6" />
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    console.log('SW registered: ', registration);
                  })
                  .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `
        }} />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans">
        <OptionalSessionProvider>
          <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b-4 border-primary-200">
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center">
                  <img 
                    src="/images/mediad-logo.svg" 
                    alt="Mediad Innovation Logo" 
                    className="w-12 h-12"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                    Any Print Summarizer
                  </h1>
                  <p className="text-sm text-gray-600 font-comic">
                    Turn pictures into easy summaries! 📚✨
                  </p>
                </div>
                </div>
                <Navigation />
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-white border-t-2 border-primary-100 mt-12">
            <div className="max-w-6xl mx-auto px-4 py-6 text-center">
              <p className="text-gray-600 font-comic">
                © Mediad Innovation 2025
              </p>
            </div>
          </footer>
          </div>
        </OptionalSessionProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              fontFamily: 'Comic Neue, cursive',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}