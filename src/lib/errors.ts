// Frontend-only error types - backend handles the complex stuff
export interface ApiError {
  message: string
  status?: number
  code?: string
  details?: Record<string, any>
}

export interface NetworkError extends Error {
  status?: number
  code?: string
}

// Simple error classification for UI purposes only
export const isNetworkError = (error: any): boolean => {
  return !navigator.onLine || error?.code === 'NETWORK_ERROR' || error?.message?.includes('Failed to fetch')
}

export const isServerError = (error: any): boolean => {
  return error?.status >= 500
}

export const isClientError = (error: any): boolean => {
  return error?.status >= 400 && error?.status < 500
}

export const isAuthError = (error: any): boolean => {
  return error?.status === 401 || error?.status === 403
}

// Get user-friendly error messages
export const getErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'Unable to connect. Please check your internet connection.'
  }
  
  if (isAuthError(error)) {
    return 'You need to sign in to continue.'
  }
  
  if (isServerError(error)) {
    return 'Server error. Please try again later.'
  }
  
  return error?.message || 'Something went wrong. Please try again.'
}
