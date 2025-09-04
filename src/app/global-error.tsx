'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the critical error to monitoring service
    console.error('Critical App Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <AlertTriangle className="mx-auto h-20 w-20 text-red-600 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Critical Error
              </h1>
              <p className="text-gray-600 mb-4">
                A critical error occurred that prevented the app from loading properly.
                This is usually a temporary issue.
              </p>
            </div>

            <div className="space-y-4">
              <Button 
                onClick={reset}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Restart Application
              </Button>
              
              <p className="text-sm text-gray-500">
                If this problem persists, please contact support.
              </p>
            </div>
            
            <div className="mt-8 text-xs text-gray-400">
              Error ID: {error.digest || 'Unknown'}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
