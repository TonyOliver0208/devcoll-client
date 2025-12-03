/**
 * Base Service
 * 
 * Core API client with authentication, error handling, and retry logic.
 * All service classes extend this base class.
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

// API Gateway configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'

// Enterprise API Response Types
interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

export class ApiClient {
  private baseURL: string
  private timeout: number
  private retries: number
  private refreshPromise: Promise<boolean> | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.timeout = 30000 // 30 seconds
    this.retries = 3
  }

  /**
   * Wait for session to be available with retries (client-side only)
   */
  private async waitForSession(maxAttempts = 3): Promise<any> {
    if (typeof window === 'undefined') return null

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const sessionResponse = await fetch('/api/auth/session')
        if (sessionResponse.ok) {
          const session = await sessionResponse.json()
          if (session?.accessToken) {
            return session
          }
        }
      } catch (error) {
        console.warn(`[API Client] Session fetch attempt ${i + 1} failed:`, error)
      }
      
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)))
      }
    }
    
    return null
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        console.log('[API Client] 🔄 Token refresh triggered...')
        
        const sessionResponse = await fetch('/api/auth/session')
        if (!sessionResponse.ok) {
          throw new Error('Could not get session')
        }
        
        const currentSession = await sessionResponse.json()
        if (!currentSession?.refreshToken) {
          console.error('[API Client] ❌ No refresh token')
          throw new Error('No refresh token in session')
        }

        const updateResponse = await fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          cache: 'no-store'
        })

        if (!updateResponse.ok) {
          throw new Error('Session update failed')
        }

        const updatedSession = await updateResponse.json()
        const isRefreshed = updatedSession?.accessToken !== currentSession?.accessToken

        if (isRefreshed) {
          console.log('[API Client] ✅ Token refreshed successfully')
          return true
        } else {
          console.log('[API Client] ⚠️ Token refresh returned same token')
          return false
        }
      } catch (error) {
        console.error('[API Client] ❌ Token refresh failed:', error)
        return false
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }

    if (typeof window === 'undefined') return headers

    try {
      const session = await this.waitForSession()
      
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`
      }
      
      if (session?.user?.id) {
        headers['X-User-ID'] = session.user.id
      }
    } catch (error) {
      console.warn('[API Client] Failed to get auth headers:', error)
    }

    return headers
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    customHeaders?: HeadersInit,
    attempt = 1
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const headers = customHeaders || await this.getAuthHeaders()
      
      const options: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(this.timeout)
      }

      if (data) {
        if (data instanceof FormData) {
          delete (headers as any)['Content-Type']
          options.body = data
        } else {
          options.body = JSON.stringify(data)
        }
      }

      const response = await fetch(url, options)

      // Handle 401 with token refresh
      if (response.status === 401 && attempt === 1) {
        console.log('[API Client] 401 detected, attempting token refresh...')
        const refreshed = await this.refreshAccessToken()
        
        if (refreshed) {
          return this.request<T>(method, endpoint, data, customHeaders, attempt + 1)
        }
      }

      // Handle error responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error: any = new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
        error.status = response.status
        error.code = errorData.code
        error.details = errorData
        throw error
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        return {} as T
      }

      return await response.json()
    } catch (error: any) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        const timeoutError: any = new Error('Request timeout')
        timeoutError.code = 'NETWORK_ERROR'
        throw timeoutError
      }

      if (error.status) {
        throw error
      }

      const networkError: any = new Error(error.message || 'Network request failed')
      networkError.code = 'NETWORK_ERROR'
      throw networkError
    }
  }

  // HTTP methods
  async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint)
  }

  async post<T = any>(endpoint: string, data?: any, customHeaders?: HeadersInit): Promise<T> {
    return this.request<T>('POST', endpoint, data, customHeaders)
  }

  async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data)
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, data)
  }

  async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

/**
 * Convenience function for authenticated requests
 */
export async function fetchWithAuth(endpoint: string, options: any = {}): Promise<any> {
  const method = options.method || 'GET';
  const data = options.body;
  const customHeaders = options.headers;

  switch (method.toUpperCase()) {
    case 'GET':
      return apiClient.get(endpoint);
    case 'POST':
      return apiClient.post(endpoint, data, customHeaders);
    case 'PUT':
      return apiClient.put(endpoint, data);
    case 'PATCH':
      return apiClient.patch(endpoint, data);
    case 'DELETE':
      return apiClient.delete(endpoint);
    default:
      return apiClient.get(endpoint);
  }
}

/**
 * Error handling utility
 */
export const handleAPIError = (error: any): string => {
  console.error('[API Error Handler]', error)

  if (error instanceof TypeError || error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your internet connection.'
  }

  if (error.response?.data) {
    return error.response.data.error || error.response.data.message || 'An error occurred'
  }

  if (error.status === 401) {
    return 'Authentication required. Please sign in.'
  }

  if (error.status === 403) {
    return 'You do not have permission to perform this action.'
  }

  if (error.status === 404) {
    return 'The requested resource was not found.'
  }

  if (error.status === 429) {
    return 'Too many requests. Please try again later.'
  }

  if (error.status >= 500) {
    return 'Server error. Please try again later.'
  }

  return error.message || 'An unexpected error occurred'
}
