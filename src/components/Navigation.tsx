'use client'

import Link from 'next/link'
import { useState } from 'react'

// Optional authentication imports
let useSession: any = null
try {
  const nextAuthReact = require('next-auth/react')
  useSession = nextAuthReact.useSession
} catch (error) {
  useSession = () => ({ data: null, status: 'unauthenticated' })
}

export default function Navigation() {
  const { data: session } = useSession ? useSession() : { data: null }
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
              Hi, {session.user?.name || session.user?.email}!
            </span>
            {(session.user as any)?.isPremium && (
              <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
                Premium
              </span>
            )}
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
              <div>
                <span className="text-sm text-gray-600">
                  Hi, {session.user?.name || session.user?.email}!
                </span>
                {(session.user as any)?.isPremium && (
                  <div className="mt-2">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-semibold">
                      Premium
                    </span>
                  </div>
                )}
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