import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Any Print Summarizer',
  description: 'Turn any printed content into easy-to-understand summaries with just a photo!',
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
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 font-sans">
        <div className="min-h-screen flex flex-col">
          <header className="bg-white shadow-sm border-b-4 border-primary-200">
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="bg-primary-500 text-white p-3 rounded-full">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
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
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-white border-t-2 border-primary-100 mt-12">
            <div className="max-w-6xl mx-auto px-4 py-6 text-center">
              <p className="text-gray-600 font-comic">
                Made with ❤️ to make learning fun and accessible for everyone!
              </p>
            </div>
          </footer>
        </div>
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