'use client'

import React from 'react'

// Optional SessionProvider that gracefully handles missing NextAuth
let SessionProvider: any = null
try {
  const nextAuthReact = require('next-auth/react')
  SessionProvider = nextAuthReact.SessionProvider
} catch (error) {
  console.log('NextAuth not available - running without authentication')
}

export default function OptionalSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  if (SessionProvider) {
    return <SessionProvider>{children}</SessionProvider>
  }
  
  // Return children without session provider if NextAuth not available
  return <>{children}</>
}