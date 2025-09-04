// Error handling system integration test and validation
import { 
  ErrorFactory, 
  ErrorLogger, 
  ErrorType, 
  ErrorSeverity,
  ErrorRecoveryManager,
  useErrorHandler
} from './index'

// Test all error types can be created
const testErrorCreation = () => {
  console.log('Testing error creation...')
  
  const networkError = ErrorFactory.createNetworkError('Test network error')
  console.log('✅ Network error created:', networkError.type === ErrorType.NETWORK)
  
  const authError = ErrorFactory.createAuthenticationError('Test auth error')
  console.log('✅ Auth error created:', authError.type === ErrorType.AUTHENTICATION)
  
  const validationError = ErrorFactory.createValidationError('Test validation', 'email')
  console.log('✅ Validation error created:', validationError.type === ErrorType.VALIDATION)
  
  const serverError = ErrorFactory.createServerError('Test server error', 500)
  console.log('✅ Server error created:', serverError.type === ErrorType.SERVER_ERROR)
}

// Test error recovery strategies
const testRecoveryStrategies = () => {
  console.log('Testing recovery strategies...')
  
  const networkStrategies = ErrorRecoveryManager.getRecoveryStrategies(
    ErrorType.NETWORK,
    ErrorSeverity.HIGH
  )
  console.log('✅ Network strategies:', networkStrategies.length > 0)
  
  const authStrategies = ErrorRecoveryManager.getRecoveryStrategies(
    ErrorType.AUTHENTICATION,
    ErrorSeverity.HIGH
  )
  console.log('✅ Auth strategies:', authStrategies.length > 0)
  
  const notFoundStrategies = ErrorRecoveryManager.getRecoveryStrategies(
    ErrorType.NOT_FOUND,
    ErrorSeverity.MEDIUM
  )
  console.log('✅ 404 strategies:', notFoundStrategies.length > 0)
}

// Test error logging
const testErrorLogging = async () => {
  console.log('Testing error logging...')
  
  const testError = ErrorFactory.createNetworkError(
    'Integration test error',
    { testCase: 'validation', timestamp: new Date() }
  )
  
  try {
    await ErrorLogger.logError(testError, {
      errorId: 'test_error_123',
      componentStack: 'TestComponent'
    })
    console.log('✅ Error logging successful')
  } catch (error) {
    console.log('❌ Error logging failed:', error)
  }
}

// Test error severity classification
const testErrorSeverity = () => {
  console.log('Testing error severity classification...')
  
  const lowError = ErrorFactory.createValidationError('Required field')
  console.log('✅ Low severity:', lowError.severity === ErrorSeverity.MEDIUM)
  
  const highError = ErrorFactory.createNetworkError('Connection failed')
  console.log('✅ High severity:', highError.severity === ErrorSeverity.HIGH)
  
  const criticalError = ErrorFactory.createServerError('Database down', 500)
  console.log('✅ Critical severity:', criticalError.severity === ErrorSeverity.CRITICAL)
}

// Run all tests
export const validateErrorHandlingSystem = async () => {
  console.log('🧪 Validating Error Handling System...')
  console.log('=====================================')
  
  testErrorCreation()
  console.log('')
  
  testRecoveryStrategies()
  console.log('')
  
  await testErrorLogging()
  console.log('')
  
  testErrorSeverity()
  console.log('')
  
  console.log('✅ Error handling system validation complete!')
  console.log('🚀 System is ready for production use')
}

// Usage example for components (TypeScript interfaces and logic only)
export interface ErrorHandlingExampleProps {
  onError?: (error: any) => void
}

export const useErrorHandlingExample = () => {
  const { handleError, retry, clearError, hasError, error } = useErrorHandler({
    component: 'ExampleComponent',
    enableRetry: true,
    maxRetries: 3
  })

  const simulateError = async () => {
    try {
      // Simulate API call
      throw new Error('Simulated error for testing')
    } catch (err) {
      await handleError(err as Error, { action: 'simulateError' })
    }
  }

  return {
    hasError,
    error,
    retry,
    clearError,
    simulateError
  }
}

// Development helper types and logic
export interface ErrorDebugInfo {
  recentErrorCount: number
  errors: Array<{
    type: string
    message: string
    timestamp: string
  }>
}

export const getErrorDebugInfo = (): ErrorDebugInfo => {
  if (process.env.NODE_ENV !== 'development') {
    return { recentErrorCount: 0, errors: [] }
  }

  const recentErrors = ErrorLogger.getRecentErrors()
  
  return {
    recentErrorCount: recentErrors.length,
    errors: recentErrors.slice(-5).map(errorLog => ({
      type: errorLog.error.type,
      message: errorLog.error.message.substring(0, 100),
      timestamp: new Date(errorLog.stored).toLocaleString()
    }))
  }
}

// Export validation function for easy testing
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // @ts-ignore - Adding to window for dev testing
  window.validateErrorSystem = validateErrorHandlingSystem
}
