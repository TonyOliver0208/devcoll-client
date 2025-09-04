'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home, Mail, Bug, Copy, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { ErrorLogger, ErrorFactory, ErrorRecoveryManager, ErrorType, ErrorSeverity } from '@/lib/error-handling'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Convert to AppError and log with full context
    const appError = ErrorFactory.createServerError(
      error.message,
      undefined,
      { 
        digest: error.digest,
        stack: error.stack,
        errorBoundary: 'global-app-error',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    )

    ErrorLogger.logError(appError, {
      errorId: error.digest || `app_error_${Date.now()}`,
      errorBoundary: 'global-app-error'
    })
  }, [error, retryCount])

  // Enhanced error classification using our enterprise system
  const getErrorDetails = () => {
    const message = error.message.toLowerCase()
    
    if (message.includes('chunkloaderror') || message.includes('loading chunk')) {
      return {
        type: ErrorType.CLIENT_ERROR,
        severity: ErrorSeverity.MEDIUM,
        userType: 'Loading Error',
        userMessage: 'This usually happens after an app update. Refreshing the page should resolve the issue.',
        recoverable: true
      }
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('failed to fetch')) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.HIGH,
        userType: 'Network Error',
        userMessage: 'Please check your internet connection and try again.',
        recoverable: true
      }
    }
    
    if (message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        severity: ErrorSeverity.HIGH,
        userType: 'Timeout Error',
        userMessage: 'The request took too long to complete. Please try again.',
        recoverable: true
      }
    }
    
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.CRITICAL,
      userType: 'Application Error',
      userMessage: 'An unexpected error occurred. Our team has been notified and is working on a fix.',
      recoverable: false
    }
  }

  const errorDetails = getErrorDetails()
  const recoveryStrategies = ErrorRecoveryManager.getRecoveryStrategies(errorDetails.type, errorDetails.severity)

  const handleRetry = async () => {
    setIsRetrying(true)
    setRetryCount(prev => prev + 1)
    
    // Add small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      reset()
    } finally {
      setIsRetrying(false)
    }
  }

  const copyErrorDetails = async () => {
    const errorInfo = `Error ID: ${error.digest || 'Unknown'}
Error Type: ${errorDetails.userType}
Error Message: ${error.message}
Timestamp: ${new Date().toLocaleString()}
URL: ${window.location.href}
User Agent: ${navigator.userAgent}`

    try {
      await navigator.clipboard.writeText(errorInfo)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.log('Failed to copy error details')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className={`mx-auto h-16 w-16 mb-6 rounded-full flex items-center justify-center ${
            errorDetails.severity === ErrorSeverity.CRITICAL ? 'bg-red-100' : 'bg-orange-100'
          }`}>
            <AlertCircle className={`h-8 w-8 ${
              errorDetails.severity === ErrorSeverity.CRITICAL ? 'text-red-600' : 'text-orange-600'
            }`} />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {errorDetails.userType}
          </h1>
          
          <p className="text-gray-600 mb-4 leading-relaxed">
            {errorDetails.userMessage}
          </p>

          {retryCount > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Retry attempt: {retryCount} {retryCount >= 3 && '(Consider contacting support)'}
              </p>
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && error.message && (
            <details className="text-left bg-gray-50 rounded-lg p-4 mb-6 border">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-3 hover:text-gray-900">
                🔍 Technical Details (Development Mode)
              </summary>
              <div className="space-y-2 text-xs">
                <div className="bg-red-50 p-3 rounded border-l-4 border-red-200">
                  <p className="font-mono text-red-800 break-all">
                    <strong>Error:</strong> {error.message}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-200">
                  <p className="text-blue-800">
                    <strong>Type:</strong> {errorDetails.userType}
                  </p>
                  <p className="text-blue-800">
                    <strong>Severity:</strong> {errorDetails.severity}
                  </p>
                  <p className="text-blue-800">
                    <strong>Recoverable:</strong> {errorDetails.recoverable ? 'Yes' : 'No'}
                  </p>
                  {error.digest && (
                    <p className="text-blue-800">
                      <strong>Error ID:</strong> {error.digest}
                    </p>
                  )}
                </div>
                
                {recoveryStrategies.length > 0 && (
                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-200">
                    <p className="text-green-800 font-medium mb-2">Recovery Strategies:</p>
                    <ul className="text-green-700 text-xs space-y-1">
                      {recoveryStrategies.map((strategy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          <span>{strategy.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : retryCount > 0 ? `Try Again (${retryCount + 1})` : 'Try Again'}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href="/" className="block">
              <Button 
                variant="outline" 
                className="w-full py-2.5 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            
            <Link href="/questions" className="block">
              <Button 
                variant="outline"
                className="w-full py-2.5 border-gray-300 hover:bg-gray-50"
              >
                Questions
              </Button>
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <Button 
              onClick={copyErrorDetails}
              variant="outline"
              className="w-full py-2.5 text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Error Details
                </>
              )}
            </Button>
          )}
          
          {errorDetails.severity === ErrorSeverity.CRITICAL && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Still having trouble? Our support team can help.
              </p>
              <Button 
                variant="outline"
                className="w-full py-2.5 text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
                onClick={() => window.open('mailto:support@devcoll.com?subject=Critical App Error&body=' + encodeURIComponent(`Error ID: ${error.digest || 'Unknown'}\nError Type: ${errorDetails.userType}\nError: ${error.message}\nRetry Count: ${retryCount}\nTimestamp: ${new Date().toLocaleString()}`), '_blank')}
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400 mb-2">
            Error ID: {error.digest || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500">
            Timestamp: {new Date().toLocaleString()}
          </p>
          {retryCount > 0 && (
            <p className="text-xs text-gray-500">
              Retry Count: {retryCount}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
