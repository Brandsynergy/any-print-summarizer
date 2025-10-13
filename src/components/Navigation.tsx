'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sessionResult = useSession()
  const session = sessionResult?.data
  const status = sessionResult?.status || 'loading'

  return (
    <nav className="flex items-center space-x-6">
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-4">
        <Link 
          href="/pricing" 
          className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
        >
          💎 Pricing
        </Link>
        
        {session ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Hi, {session.user?.name || session.user?.email?.split('@')[0] || 'User'}!
            </span>
            {(session.user as any)?.isPremium ? (
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                ⭐ Premium
              </span>
            ) : (
              <Link 
                href="/pricing"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold transition-all duration-200"
              >
                🚀 Upgrade
              </Link>
            )}
            <button
              onClick={() => signOut()}
              className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <Link 
            href="/auth/signin"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 md:hidden">
          <div className="flex flex-col space-y-3">
            <Link 
              href="/pricing" 
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
              onClick={() => setIsMenuOpen(false)}
            >
              💎 Pricing
            </Link>
            {session ? (
              <div className="space-y-2">
                <span className="text-sm text-gray-600 block">
                  Hi, {session.user?.name || session.user?.email?.split('@')[0] || 'User'}!
                </span>
                <div className="flex items-center justify-between">
                  {(session.user as any)?.isPremium ? (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ Premium
                    </span>
                  ) : (
                    <Link 
                      href="/pricing"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🚀 Upgrade
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      setIsMenuOpen(false)
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link 
                href="/auth/signin"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-center transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}