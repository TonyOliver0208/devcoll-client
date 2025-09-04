import { useState, useCallback, useRef, useEffect } from 'react'
import { ErrorLogger, ErrorFactory, ErrorType, ErrorSeverity, AppError } from './errorLogger'
import { ErrorRecoveryManager } from './errorRecovery'

export interface UseErrorHandlerOptions {
  enableRetry?: boolean
  maxRetries?: number
  autoRetryDelay?: number
  logErrors?: boolean
  component?: string
}

export interface ErrorState {
  error: AppError | null
  isLoading: boolean
  retryCount: number
  lastRetryAt: Date | null
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const {
    enableRetry = true,
    maxRetries = 3,
    autoRetryDelay = 1000,
    logErrors = true,
    component = 'unknown'
  } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: false,
    retryCount: 0,
    lastRetryAt: null
  })

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

  const handleError = useCallback(async (
    error: Error | AppError | string,
    context?: Record<string, unknown>
  ) => {
    let appError: AppError

    if (typeof error === 'string') {
      appError = ErrorFactory.createServerError(error, undefined, context)
    } else if ('type' in error) {
      appError = error as AppError
    } else {
      // Convert native Error to AppError
      appError = ErrorFactory.createServerError(
        error.message,
        undefined,
        { ...context, originalError: error.name, stack: error.stack }
      )
    }

    // Add component context
    appError.context = {
      ...appError.context,
      component,
      timestamp: new Date().toISOString()
    }

    if (logErrors) {
      await ErrorLogger.logError(appError, {
        userId: undefined, // Can be set from auth context
        componentStack: component
      })
    }

    setErrorState(prev => ({
      ...prev,
      error: appError,
      isLoading: false
    }))

    return appError
  }, [logErrors, component])

  const retry = useCallback(async (retryFn?: () => Promise<void> | void) => {
    if (!enableRetry || errorState.retryCount >= maxRetries) {
      return false
    }

    setErrorState(prev => ({
      ...prev,
      isLoading: true,
      retryCount: prev.retryCount + 1,
      lastRetryAt: new Date()
    }))

    try {
      if (retryFn) {
        await retryFn()
      }
      
      // Clear error on successful retry
      setErrorState(prev => ({
        ...prev,
        error: null,
        isLoading: false
      }))
      
      return true
    } catch (retryError) {
      await handleError(retryError as Error, { retryAttempt: errorState.retryCount + 1 })
      return false
    }
  }, [enableRetry, maxRetries, errorState.retryCount, handleError])

  const autoRetry = useCallback(async (retryFn: () => Promise<void> | void) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
    }

    const delay = autoRetryDelay * Math.pow(2, errorState.retryCount) // Exponential backoff

    retryTimeoutRef.current = setTimeout(async () => {
      await retry(retryFn)
    }, delay)
  }, [autoRetryDelay, errorState.retryCount, retry])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isLoading: false,
      retryCount: 0,
      lastRetryAt: null
    })

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
  }, [])

  const withErrorHandling = useCallback(<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>
  ) => {
    return async (...args: T): Promise<R | null> => {
      try {
        setErrorState(prev => ({ ...prev, isLoading: true }))
        const result = await asyncFn(...args)
        clearError()
        return result
      } catch (error) {
        await handleError(error as Error)
        return null
      }
    }
  }, [handleError, clearError])

  return {
    error: errorState.error,
    isLoading: errorState.isLoading,
    retryCount: errorState.retryCount,
    lastRetryAt: errorState.lastRetryAt,
    hasError: !!errorState.error,
    canRetry: enableRetry && errorState.retryCount < maxRetries,
    handleError,
    retry,
    autoRetry,
    clearError,
    withErrorHandling
  }
}

// Specialized hooks for common error scenarios
export function useAsyncOperation<T>(
  operation: () => Promise<T>,
  dependencies: any[] = [],
  options: UseErrorHandlerOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const errorHandler = useErrorHandler(options)

  const execute = useCallback(async () => {
    try {
      errorHandler.clearError()
      const result = await errorHandler.withErrorHandling(operation)()
      if (result !== null) {
        setData(result)
        setIsInitialLoad(false)
      }
      return result
    } catch (error) {
      await errorHandler.handleError(error as Error)
      return null
    }
  }, [operation, errorHandler])

  // Auto-execute on mount and dependency changes
  useEffect(() => {
    execute()
  }, dependencies)

  return {
    data,
    isInitialLoad,
    execute,
    ...errorHandler
  }
}

export function useApiCall<T = any>(
  url: string,
  options: RequestInit = {},
  errorOptions: UseErrorHandlerOptions = {}
) {
  const apiCall = useCallback(async () => {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      const errorType = response.status >= 500 
        ? ErrorType.SERVER_ERROR 
        : response.status === 401
        ? ErrorType.AUTHENTICATION
        : response.status === 403
        ? ErrorType.AUTHORIZATION
        : response.status === 404
        ? ErrorType.NOT_FOUND
        : response.status === 429
        ? ErrorType.RATE_LIMIT
        : ErrorType.CLIENT_ERROR

      const severity = response.status >= 500 
        ? ErrorSeverity.CRITICAL 
        : response.status === 429
        ? ErrorSeverity.HIGH
        : ErrorSeverity.MEDIUM

      throw ErrorFactory.createServerError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        { url, options, response: await response.text().catch(() => 'Unable to read response') }
      )
    }

    return await response.json() as T
  }, [url, options])

  return useAsyncOperation(apiCall, [url, JSON.stringify(options)], {
    ...errorOptions,
    component: `api-call-${url}`
  })
}

// Network status hook
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof window !== 'undefined' ? window.navigator.onLine : true
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
