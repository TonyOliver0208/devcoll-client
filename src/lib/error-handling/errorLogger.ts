// Error monitoring and logging configuration
export interface ErrorConfig {
  enableLogging: boolean
  enableReporting: boolean
  logLevel: 'error' | 'warn' | 'info' | 'debug'
  reportingService?: 'sentry' | 'bugsnag' | 'custom'
}

// Error classification for better handling
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface AppError extends Error {
  type: ErrorType
  severity: ErrorSeverity
  code?: string | number
  context?: Record<string, unknown>
  timestamp?: Date
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  stackTrace?: string
}

// Error factory for consistent error creation
export class ErrorFactory {
  static createNetworkError(
    message: string = 'Network connection failed',
    context?: Record<string, unknown>
  ): AppError {
    return {
      name: 'NetworkError',
      message,
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      context,
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
    } as AppError
  }

  static createValidationError(
    message: string,
    field?: string,
    context?: Record<string, unknown>
  ): AppError {
    return {
      name: 'ValidationError',
      message,
      type: ErrorType.VALIDATION,
      severity: ErrorSeverity.MEDIUM,
      context: { field, ...context },
      timestamp: new Date()
    } as AppError
  }

  static createAuthenticationError(
    message: string = 'Authentication failed',
    context?: Record<string, unknown>
  ): AppError {
    return {
      name: 'AuthenticationError',
      message,
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      context,
      timestamp: new Date()
    } as AppError
  }

  static createServerError(
    message: string = 'Internal server error',
    statusCode?: number,
    context?: Record<string, unknown>
  ): AppError {
    return {
      name: 'ServerError',
      message,
      type: ErrorType.SERVER_ERROR,
      severity: statusCode && statusCode >= 500 ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH,
      code: statusCode,
      context,
      timestamp: new Date()
    } as AppError
  }
}

// Error metadata for tracking and analytics
export interface ErrorMetadata {
  errorId: string
  userId?: string
  sessionId: string
  timestamp: Date
  url: string
  userAgent: string
  buildVersion?: string
  environment: 'development' | 'staging' | 'production'
  errorBoundary?: string
  componentStack?: string
}

// Central error logging service
export class ErrorLogger {
  private static config: ErrorConfig = {
    enableLogging: true,
    enableReporting: process.env.NODE_ENV === 'production',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
  }

  static configure(config: Partial<ErrorConfig>) {
    this.config = { ...this.config, ...config }
  }

  static async logError(error: AppError, metadata?: Partial<ErrorMetadata>) {
    if (!this.config.enableLogging) return

    const fullMetadata: ErrorMetadata = {
      errorId: this.generateErrorId(),
      sessionId: this.getSessionId(),
      timestamp: new Date(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      environment: process.env.NODE_ENV as any || 'development',
      ...metadata
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${error.type} Error - ${error.severity}`)
      console.error('Message:', error.message)
      console.error('Error:', error)
      console.log('Metadata:', fullMetadata)
      console.groupEnd()
    }

    // Send to error monitoring service in production
    if (this.config.enableReporting && process.env.NODE_ENV === 'production') {
      await this.reportToService(error, fullMetadata)
    }

    // Store locally for debugging
    this.storeErrorLocally(error, fullMetadata)
  }

  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private static getSessionId(): string {
    if (typeof window === 'undefined') return 'server'
    
    let sessionId = sessionStorage.getItem('sessionId')
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('sessionId', sessionId)
    }
    return sessionId
  }

  private static async reportToService(error: AppError, metadata: ErrorMetadata) {
    try {
      // Example integration with error monitoring service
      // Replace with actual service (Sentry, Bugsnag, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error, metadata })
      })
    } catch (reportingError) {
      console.warn('Failed to report error to service:', reportingError)
    }
  }

  private static storeErrorLocally(error: AppError, metadata: ErrorMetadata) {
    try {
      if (typeof window === 'undefined') return

      const errorLog = {
        error: {
          name: error.name,
          message: error.message,
          type: error.type,
          severity: error.severity,
          context: error.context
        },
        metadata,
        stored: new Date().toISOString()
      }

      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]')
      existingLogs.push(errorLog)
      
      // Keep only last 50 errors to prevent storage bloat
      const recentLogs = existingLogs.slice(-50)
      localStorage.setItem('errorLogs', JSON.stringify(recentLogs))
    } catch (storageError) {
      console.warn('Failed to store error locally:', storageError)
    }
  }

  // Utility to get recent errors for debugging
  static getRecentErrors(): any[] {
    try {
      if (typeof window === 'undefined') return []
      return JSON.parse(localStorage.getItem('errorLogs') || '[]')
    } catch {
      return []
    }
  }

  // Clear error logs
  static clearErrorLogs(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('errorLogs')
    }
  }
}
