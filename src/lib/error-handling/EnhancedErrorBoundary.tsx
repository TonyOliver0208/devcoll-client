import React from 'react'
import { ErrorLogger, ErrorFactory, ErrorType, ErrorSeverity, AppError } from './errorLogger'
import { ErrorRecoveryManager, RecoveryStrategy } from './errorRecovery'

// Enhanced Error Boundary with enterprise features
interface ErrorBoundaryState {
  hasError: boolean
  error: AppError | null
  errorId: string | null
  retryCount: number
  isRetrying: boolean
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void
  level?: 'page' | 'section' | 'component'
  identifier?: string
  maxRetries?: number
  enableAutoRetry?: boolean
}

export interface ErrorBoundaryFallbackProps {
  error: AppError
  errorId: string
  retryCount: number
  isRetrying: boolean
  recoveryStrategies: RecoveryStrategy[]
  onRetry: () => void
  onReset: () => void
}

export class EnhancedErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null
  private readonly maxRetries: number
  private readonly autoRetryEnabled: boolean

  constructor(props: ErrorBoundaryProps) {
    super(props)
    
    this.maxRetries = props.maxRetries ?? 3
    this.autoRetryEnabled = props.enableAutoRetry ?? false
    
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Transform native Error to AppError
    const appError = ErrorFactory.createServerError(
      error.message,
      undefined,
      { 
        originalError: error.name,
        stack: error.stack
      }
    )

    return {
      hasError: true,
      error: appError,
      errorId: `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component', identifier } = this.props
    
    // Create enhanced error with React context
    const appError: AppError = {
      ...this.state.error!,
      context: {
        ...this.state.error?.context,
        componentStack: errorInfo.componentStack,
        errorBoundaryLevel: level,
        boundaryIdentifier: identifier,
        reactErrorInfo: errorInfo
      }
    }

    // Log error with full context
    ErrorLogger.logError(appError, {
      errorId: this.state.errorId!,
      errorBoundary: `${level}-${identifier || 'unnamed'}`,
      componentStack: errorInfo.componentStack || undefined
    })

    // Call custom error handler
    onError?.(appError, errorInfo)

    // Auto-retry for certain error types
    if (this.autoRetryEnabled && this.shouldAutoRetry(appError)) {
      this.scheduleAutoRetry()
    }
  }

  private shouldAutoRetry(error: AppError): boolean {
    return (
      this.state.retryCount < this.maxRetries &&
      (error.type === ErrorType.NETWORK || 
       error.type === ErrorType.TIMEOUT ||
       error.severity === ErrorSeverity.LOW)
    )
  }

  private scheduleAutoRetry(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }

    this.setState({ isRetrying: true })

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, this.state.retryCount) * 1000

    this.retryTimeoutId = setTimeout(() => {
      this.handleRetry()
    }, delay)
  }

  private handleRetry = (): void => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false
    }))

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
  }

  private handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false
    })

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
      this.retryTimeoutId = null
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId)
    }
  }

  render() {
    const { hasError, error, errorId, retryCount, isRetrying } = this.state
    const { children, fallback: FallbackComponent } = this.props

    if (hasError && error && errorId) {
      const recoveryStrategies = ErrorRecoveryManager.getRecoveryStrategies(
        error.type,
        error.severity,
        {
          onRetry: this.handleRetry,
          onRedirect: (path: string) => {
            if (typeof window !== 'undefined') {
              window.location.href = path
            }
          }
        }
      )

      const fallbackProps: ErrorBoundaryFallbackProps = {
        error,
        errorId,
        retryCount,
        isRetrying,
        recoveryStrategies,
        onRetry: this.handleRetry,
        onReset: this.handleReset
      }

      if (FallbackComponent) {
        return <FallbackComponent {...fallbackProps} />
      }

      // Default fallback
      return <DefaultErrorFallback {...fallbackProps} />
    }

    return children
  }
}

// Default error fallback component
function DefaultErrorFallback({
  error,
  errorId,
  retryCount,
  isRetrying,
  recoveryStrategies,
  onRetry,
  onReset
}: ErrorBoundaryFallbackProps) {
  const primaryStrategy = recoveryStrategies.find(s => s.primary)
  const secondaryStrategies = recoveryStrategies.filter(s => !s.primary)

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <div className="text-6xl">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900">
            Something went wrong
          </h2>
          <p className="text-gray-600">
            We encountered an unexpected error. This has been reported to our team.
          </p>
        </div>

        {error.message && (
          <details className="text-left bg-gray-50 rounded-lg p-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
              Technical Details
            </summary>
            <div className="space-y-2 text-xs text-gray-500 font-mono">
              <p><strong>Error:</strong> {error.message}</p>
              <p><strong>Type:</strong> {error.type}</p>
              <p><strong>Severity:</strong> {error.severity}</p>
              {retryCount > 0 && (
                <p><strong>Retry Attempts:</strong> {retryCount}</p>
              )}
            </div>
          </details>
        )}

        <div className="space-y-3">
          {isRetrying ? (
            <div className="flex items-center justify-center gap-2 py-3">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Retrying...</span>
            </div>
          ) : (
            <>
              {primaryStrategy && (
                <button
                  onClick={primaryStrategy.action}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  {primaryStrategy.label}
                </button>
              )}
              
              <div className="flex gap-2">
                {secondaryStrategies.slice(0, 2).map((strategy, index) => (
                  <button
                    key={index}
                    onClick={strategy.action}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-3 rounded-lg text-sm transition-colors"
                  >
                    {strategy.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>Error ID: {errorId}</p>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={onReset}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Reset Error Boundary
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Convenience wrapper for page-level error boundaries
export function PageErrorBoundary({ 
  children, 
  identifier 
}: { 
  children: React.ReactNode
  identifier?: string 
}) {
  return (
    <EnhancedErrorBoundary
      level="page"
      identifier={identifier}
      maxRetries={2}
      enableAutoRetry={false}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}

// Convenience wrapper for section-level error boundaries
export function SectionErrorBoundary({ 
  children, 
  identifier 
}: { 
  children: React.ReactNode
  identifier?: string 
}) {
  return (
    <EnhancedErrorBoundary
      level="section"
      identifier={identifier}
      maxRetries={3}
      enableAutoRetry={true}
    >
      {children}
    </EnhancedErrorBoundary>
  )
}
