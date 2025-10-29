'use client'

import { useSession } from 'next-auth/react'

/**
 * Auth Status Display Component (for debugging)
 * Shows current authentication status - remove in production
 * 
 * Note: No session initialization needed with stateless JWT authentication.
 * NextAuth handles JWT tokens automatically.
 */
export function AuthStatusDebug() {
  const { data: session, status } = useSession()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs font-mono z-50">
      <div>Status: {status}</div>
      {session && (
        <div>
          <div>User: {session.user?.email}</div>
          <div>Access Token: {session.accessToken ? '✓' : '✗'}</div>
          <div>Refresh Token: {session.refreshToken ? '✓' : '✗'}</div>
        </div>
      )}
    </div>
  )
}