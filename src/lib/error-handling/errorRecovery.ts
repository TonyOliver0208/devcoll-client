import { ReactNode } from 'react'
import { ErrorType, ErrorSeverity } from './errorLogger'

// Recovery strategies for different error types
export interface RecoveryStrategy {
  type: 'retry' | 'redirect' | 'fallback' | 'refresh' | 'logout' | 'contact'
  label: string
  action: () => void | Promise<void>
  primary?: boolean
}

export interface ErrorRecoveryConfig {
  errorType: ErrorType
  severity: ErrorSeverity
  strategies: RecoveryStrategy[]
  fallbackComponent?: ReactNode
  autoRetry?: {
    enabled: boolean
    maxAttempts: number
    backoffMs: number
  }
}

// Error recovery manager
export class ErrorRecoveryManager {
  private static retryAttempts = new Map<string, number>()
  
  static getRecoveryStrategies(
    errorType: ErrorType,
    severity: ErrorSeverity,
    context?: {
      onRetry?: () => void
      onRedirect?: (path: string) => void
      onFallback?: () => void
    }
  ): RecoveryStrategy[] {
    const strategies: RecoveryStrategy[] = []

    switch (errorType) {
      case ErrorType.NETWORK:
        strategies.push(
          {
            type: 'retry',
            label: 'Try Again',
            action: context?.onRetry || (() => window.location.reload()),
            primary: true
          },
          {
            type: 'refresh',
            label: 'Refresh Page',
            action: () => window.location.reload()
          }
        )
        break

      case ErrorType.AUTHENTICATION:
        strategies.push(
          {
            type: 'redirect',
            label: 'Sign In Again',
            action: () => {
              if (context?.onRedirect) {
                context.onRedirect('/login')
              } else {
                window.location.href = '/login'
              }
            },
            primary: true
          },
          {
            type: 'redirect',
            label: 'Go Home',
            action: () => {
              if (context?.onRedirect) {
                context.onRedirect('/')
              } else {
                window.location.href = '/'
              }
            }
          }
        )
        break

      case ErrorType.AUTHORIZATION:
        strategies.push(
          {
            type: 'redirect',
            label: 'Go Back',
            action: () => window.history.back(),
            primary: true
          },
          {
            type: 'redirect',
            label: 'Go Home',
            action: () => {
              if (context?.onRedirect) {
                context.onRedirect('/')
              } else {
                window.location.href = '/'
              }
            }
          }
        )
        break

      case ErrorType.NOT_FOUND:
        strategies.push(
          {
            type: 'redirect',
            label: 'Go Home',
            action: () => {
              if (context?.onRedirect) {
                context.onRedirect('/')
              } else {
                window.location.href = '/'
              }
            },
            primary: true
          },
          {
            type: 'redirect',
            label: 'Browse Questions',
            action: () => {
              if (context?.onRedirect) {
                context.onRedirect('/questions')
              } else {
                window.location.href = '/questions'
              }
            }
          }
        )
        break

      case ErrorType.SERVER_ERROR:
        if (severity === ErrorSeverity.CRITICAL) {
          strategies.push(
            {
              type: 'contact',
              label: 'Contact Support',
              action: () => {
                window.open('mailto:support@devcoll.com', '_blank')
              }
            },
            {
              type: 'redirect',
              label: 'Go Home',
              action: () => {
                if (context?.onRedirect) {
                  context.onRedirect('/')
                } else {
                  window.location.href = '/'
                }
              }
            }
          )
        } else {
          strategies.push(
            {
              type: 'retry',
              label: 'Try Again',
              action: context?.onRetry || (() => window.location.reload()),
              primary: true
            },
            {
              type: 'redirect',
              label: 'Go Home',
              action: () => {
                if (context?.onRedirect) {
                  context.onRedirect('/')
                } else {
                  window.location.href = '/'
                }
              }
            }
          )
        }
        break

      case ErrorType.RATE_LIMIT:
        strategies.push(
          {
            type: 'retry',
            label: 'Try Again Later',
            action: async () => {
              await new Promise(resolve => setTimeout(resolve, 5000))
              if (context?.onRetry) {
                context.onRetry()
              } else {
                window.location.reload()
              }
            },
            primary: true
          }
        )
        break

      default:
        strategies.push(
          {
            type: 'retry',
            label: 'Try Again',
            action: context?.onRetry || (() => window.location.reload()),
            primary: true
          },
          {
            type: 'redirect',
            label: 'Go Home',
            action: () => {
              if (context?.onRedirect) {
                context.onRedirect('/')
              } else {
                window.location.href = '/'
              }
            }
          }
        )
    }

    return strategies
  }

  static async executeRetryWithBackoff(
    errorKey: string,
    retryFn: () => Promise<void>,
    maxAttempts: number = 3,
    baseBackoffMs: number = 1000
  ): Promise<boolean> {
    const currentAttempts = this.retryAttempts.get(errorKey) || 0
    
    if (currentAttempts >= maxAttempts) {
      this.retryAttempts.delete(errorKey)
      return false
    }

    try {
      // Exponential backoff: 1s, 2s, 4s, 8s...
      const backoffMs = baseBackoffMs * Math.pow(2, currentAttempts)
      await new Promise(resolve => setTimeout(resolve, backoffMs))
      
      await retryFn()
      this.retryAttempts.delete(errorKey)
      return true
    } catch (error) {
      this.retryAttempts.set(errorKey, currentAttempts + 1)
      throw error
    }
  }

  static resetRetryCount(errorKey: string): void {
    this.retryAttempts.delete(errorKey)
  }

  static getRetryCount(errorKey: string): number {
    return this.retryAttempts.get(errorKey) || 0
  }
}

// Fallback message templates for different error scenarios
export const ErrorFallbacks = {
  NetworkError: {
    title: 'Connection Issue',
    message: 'Connection issue detected. Some features may be limited while offline.',
    variant: 'warning' as const
  },

  AuthenticationError: {
    title: 'Session Expired',
    message: 'Your session has expired. Please sign in again to continue.',
    variant: 'error' as const
  },

  LoadingTimeout: {
    title: 'Loading Timeout',
    message: 'This is taking longer than expected. The content might be temporarily unavailable.',
    variant: 'info' as const
  }
}

// Error boundary configuration
export const ErrorBoundaryConfig = {
  // Development vs Production behavior
  showErrorDetails: process.env.NODE_ENV === 'development',
  
  // Auto-retry configuration
  autoRetry: {
    enabled: true,
    maxAttempts: 2,
    backoffMs: 1000
  },
  
  // Error reporting
  reportErrors: process.env.NODE_ENV === 'production',
  
  // Fallback behavior
  fallbackToHomePage: true,
  
  // User feedback
  showFeedbackForm: process.env.NODE_ENV === 'production'
}
