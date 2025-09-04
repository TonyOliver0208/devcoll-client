import React from 'react'
import { useErrorHandlingExample, getErrorDebugInfo } from './validation'
import { ErrorLogger } from './errorLogger'

// Error handling example component
export const ErrorHandlingExample: React.FC = () => {
  const { hasError, error, retry, clearError, simulateError } = useErrorHandlingExample()

  if (hasError && error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="font-medium text-red-800">Error Occurred</h3>
        <p className="text-red-600 mt-1">{error.message}</p>
        <div className="mt-3 space-x-2">
          <button
            onClick={() => retry()}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
          <button
            onClick={clearError}
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Clear
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <h3 className="font-medium">Error Handling Test</h3>
      <button
        onClick={simulateError}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Simulate Error
      </button>
    </div>
  )
}

// Development debug panel component
export const ErrorDebugPanel: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const debugInfo = getErrorDebugInfo()
  
  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm">Error Debug Panel</h4>
        <button
          onClick={() => ErrorLogger.clearErrorLogs()}
          className="text-xs text-red-600 hover:text-red-800"
        >
          Clear
        </button>
      </div>
      <div className="text-xs text-gray-600">
        Recent errors: {debugInfo.recentErrorCount}
      </div>
      {debugInfo.errors.map((error, index) => (
        <div key={index} className="mt-2 p-2 bg-gray-50 rounded text-xs">
          <div className="font-mono text-red-600">
            {error.type}: {error.message}...
          </div>
          <div className="text-gray-500 mt-1">
            {error.timestamp}
          </div>
        </div>
      ))}
    </div>
  )
}

// Simple error display component
export interface SimpleErrorDisplayProps {
  error: Error | null
  onRetry?: () => void
  onDismiss?: () => void
  title?: string
  showRetry?: boolean
}

export const SimpleErrorDisplay: React.FC<SimpleErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  title = "Something went wrong",
  showRetry = true
}) => {
  if (!error) return null

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            {title}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message}</p>
          </div>
          {(showRetry || onDismiss) && (
            <div className="mt-4 flex space-x-2">
              {showRetry && onRetry && (
                <button
                  type="button"
                  className="bg-red-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={onRetry}
                >
                  Try again
                </button>
              )}
              {onDismiss && (
                <button
                  type="button"
                  className="bg-white text-red-800 border border-red-300 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  onClick={onDismiss}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
