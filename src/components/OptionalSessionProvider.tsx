'use client'

import React from 'react'

export default function OptionalSessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // For now, just return children without session provider
  // This prevents any authentication-related errors during deployment
  return <>{children}</>
}
