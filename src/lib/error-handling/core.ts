// Core error handling exports (TypeScript only)
export * from './errorLogger'
export * from './errorRecovery'
export * from './useErrorHandler'
export * from './validation'

// Re-export commonly used types and classes
export { 
  ErrorLogger, 
  ErrorFactory, 
  ErrorType, 
  ErrorSeverity 
} from './errorLogger'

export { 
  ErrorRecoveryManager, 
  ErrorFallbacks 
} from './errorRecovery'

export { 
  useErrorHandler, 
  useAsyncOperation, 
  useApiCall, 
  useNetworkStatus 
} from './useErrorHandler'

// Common error handling utilities
export const ErrorHandlingUtils = {
  isNetworkError: (error: unknown): boolean => {
    if (typeof error === 'object' && error !== null && 'type' in error) {
      return (error as any).type === 'NETWORK'
    }
    if (error instanceof Error) {
      return error.message.includes('fetch') || 
             error.message.includes('network') ||
             error.message.includes('connection')
    }
    return false
  },

  isAuthError: (error: unknown): boolean => {
    if (typeof error === 'object' && error !== null && 'type' in error) {
      const errorType = (error as any).type
      return errorType === 'AUTHENTICATION' || 
             errorType === 'AUTHORIZATION'
    }
    if (error instanceof Error) {
      return error.message.includes('401') || 
             error.message.includes('403') ||
             error.message.includes('unauthorized')
    }
    return false
  },

  getErrorSeverity: (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'severity' in error) {
      return (error as any).severity
    }
    return 'MEDIUM'
  },

  formatErrorForUser: (error: unknown): string => {
    if (typeof error === 'string') {
      return error
    }
    
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const errorMessage = (error as any).message
      
      // Friendly error messages for common issues
      if (errorMessage.includes('Network Error') || errorMessage.includes('Failed to fetch')) {
        return 'Unable to connect to the server. Please check your internet connection and try again.'
      }
      
      if (errorMessage.includes('401')) {
        return 'Please sign in to continue.'
      }
      
      if (errorMessage.includes('403')) {
        return 'You do not have permission to access this resource.'
      }
      
      if (errorMessage.includes('404')) {
        return 'The requested resource was not found.'
      }
      
      if (errorMessage.includes('429')) {
        return 'Too many requests. Please wait a moment before trying again.'
      }
      
      if (errorMessage.includes('500')) {
        return 'Server error. Please try again later.'
      }
      
      return errorMessage
    }
    
    return 'An unexpected error occurred.'
  }
}

// Environment-specific configuration
export const ErrorConfig = {
  development: {
    showErrorDetails: true,
    enableConsoleLogging: true,
    enableErrorReporting: false,
    autoRetryEnabled: true,
    maxRetries: 2
  },
  
  production: {
    showErrorDetails: false,
    enableConsoleLogging: false,
    enableErrorReporting: true,
    autoRetryEnabled: true,
    maxRetries: 3
  },
  
  current: process.env.NODE_ENV === 'production' ? 'production' as const : 'development' as const
} as const
