import { ApiError, NetworkError } from '@/lib/errors'
import { auth } from '@/auth'

// API Client for microservices architecture through API Gateway
import type { Question } from '@/types/questions'
import type { Tag } from '@/types/tag'

// API Gateway configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000'

// Enterprise API Response Types
interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

class ApiClient {
  private baseURL: string
  private timeout: number
  private retries: number

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.timeout = 30000 // 30 seconds
    this.retries = 3
  }

  /**
   * Get authentication headers with internal JWT token from auth-service
   * This method is safe to call from both server and client components
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-source': 'frontend',
      }

      // Only try to get session on server-side or when explicitly available
      try {
        if (typeof window === 'undefined') {
          // Server-side: safe to call auth()
          const session = await auth()
          if (session?.accessToken) {
            headers['Authorization'] = `Bearer ${session.accessToken}`
            console.log('[API Client] Adding internal JWT token to request (server)')
          }
        } else {
          // Client-side: Don't call auth() as it uses headers() which requires request context
          console.log('[API Client] Client-side request - no session token available')
        }
      } catch (sessionError) {
        console.warn('[API Client] Could not retrieve session:', sessionError)
      }

      // Optional: Add client-generated request ID (API Gateway may override)
      // The API Gateway will generate one if not provided
      if (typeof window !== 'undefined') {
        headers['x-request-id'] = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      return headers
    } catch (error) {
      console.error('[API Client] Failed to get auth headers:', error)
      return {
        'Content-Type': 'application/json',
        'x-source': 'frontend',
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const headers = await this.getAuthHeaders()
      
      console.log(`[API Request] ${options.method || 'GET'} ${endpoint}`, {
        attempt,
        url,
        hasToken: !!headers['Authorization']
      })

      // Add timeout control
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      const response = await fetch(url, {
        headers: {
          ...headers,
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      })

      clearTimeout(timeoutId)

      let responseData: any
      
      try {
        responseData = await response.json()
      } catch (parseError) {
        console.error('[API Client] JSON parse error:', parseError)
        responseData = {
          success: false,
          message: 'Invalid server response',
          error: 'Response parsing failed'
        }
      }

      console.log(`[API Response] ${response.status} ${endpoint}`, {
        success: responseData.success,
        message: responseData.message,
        hasData: !!responseData.data
      })

      // Handle non-2xx responses
      if (!response.ok) {
        const apiError: ApiError = {
          message: responseData.message || responseData.error || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: responseData.code,
          details: responseData.details,
        }
        
        throw apiError
      }

      // Return the data directly if it's an APIResponse format, otherwise return as-is
      return responseData.data !== undefined ? responseData.data : responseData

    } catch (error: any) {
      console.error(`[API Error] ${endpoint} (attempt ${attempt})`, error)

      // Network or timeout errors
      if (error instanceof TypeError || error.name === 'AbortError') {
        // Retry logic for network/timeout errors
        if (attempt < this.retries) {
          const delay = 1000 * attempt // Exponential backoff
          console.log(`[API Retry] Retrying ${endpoint} in ${delay}ms`)
          
          await new Promise(resolve => setTimeout(resolve, delay))
          return this.request<T>(endpoint, options, attempt + 1)
        }

        const networkError: NetworkError = new Error('Network connection failed')
        networkError.code = 'NETWORK_ERROR'
        throw networkError
      }

      // Handle specific API errors that should be retried
      const shouldRetry = 
        attempt < this.retries && 
        ((error as ApiError).status === 503 || // Service unavailable
         (error as ApiError).status === 502)   // Bad gateway

      if (shouldRetry) {
        const delay = 1000 * attempt
        console.log(`[API Retry] Retrying ${endpoint} in ${delay}ms`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.request<T>(endpoint, options, attempt + 1)
      }
      
      // Re-throw API errors
      throw error
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options })
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Microservice-specific clients updated for API Gateway routing
export const questionsApi = {
  // Questions are routed through API Gateway to question-service
  getQuestions: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Question[]> => {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'tags' && Array.isArray(value)) {
            value.forEach(tag => queryParams.append('tags', tag))
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })
    }

    const queryString = queryParams.toString()
    return apiClient.get(`/v1/questions${queryString ? `?${queryString}` : ''}`)
  },
  
  getQuestion: (id: string): Promise<Question> => 
    apiClient.get(`/v1/questions/${id}`),
    
  createQuestion: (data: {
    title: string;
    content: string;
    tags: string[];
  }): Promise<Question> => 
    apiClient.post('/v1/questions', data),
    
  updateQuestion: (id: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
  }): Promise<Question> => 
    apiClient.put(`/v1/questions/${id}`, data),
    
  deleteQuestion: (id: string): Promise<void> => 
    apiClient.delete(`/v1/questions/${id}`),
    
  voteQuestion: (id: string, voteType: 'up' | 'down'): Promise<any> => 
    apiClient.post(`/v1/questions/${id}/vote`, { voteType }),
}

export const authApi = {
  // Authentication and user management through API Gateway
  // Note: No session endpoints needed - using stateless JWT authentication
  
  getProfile: (): Promise<any> => 
    apiClient.get('/v1/users/profile'),
    
  updateProfile: (data: {
    name?: string;
    username?: string;
    bio?: string;
    picture?: string;
    preferences?: any;
    profile?: any;
  }): Promise<any> => 
    apiClient.put('/v1/users/profile', data),
    
  getUserById: (userId: string): Promise<any> => 
    apiClient.get(`/v1/users/${userId}`),
    
  getUsers: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> => {
    const queryParams = new URLSearchParams()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    return apiClient.get(`/v1/users${queryString ? `?${queryString}` : ''}`)
  },
    
  getTopUsers: (limit = 10): Promise<any> => 
    apiClient.get(`/v1/users/top?limit=${limit}`),
}

export const tagsApi = {
  // Tags are routed through API Gateway to tag-service
  getTags: (): Promise<Tag[]> => 
    apiClient.get('/v1/tags'),
    
  getTag: (id: string): Promise<Tag> => 
    apiClient.get(`/v1/tags/${id}`),
    
  createTag: (data: { name: string; description?: string }): Promise<Tag> => 
    apiClient.post('/v1/tags', data),
    
  updateTag: (id: string, data: { name?: string; description?: string }): Promise<Tag> => 
    apiClient.put(`/v1/tags/${id}`, data),
    
  deleteTag: (id: string): Promise<void> => 
    apiClient.delete(`/v1/tags/${id}`),
}

export const searchApi = {
  // Search through API Gateway to search-service
  search: (query: string, filters?: {
    type?: 'questions' | 'users' | 'all';
    tags?: string[];
    dateRange?: string;
  }): Promise<any> => {
    const params = new URLSearchParams({ q: query })
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'tags' && Array.isArray(value)) {
            value.forEach(tag => params.append('tags', tag))
          } else {
            params.append(key, value.toString())
          }
        }
      })
    }

    return apiClient.get(`/v1/search?${params.toString()}`)
  },
  
  getSearchSuggestions: (query: string): Promise<any> => 
    apiClient.get(`/v1/search/suggestions?q=${encodeURIComponent(query)}`),
}

/**
 * Error handling utility for API responses
 */
export const handleAPIError = (error: any): string => {
  console.error('[API Error Handler]', error)

  // Handle network errors
  if (error instanceof TypeError || error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your internet connection.'
  }

  // Handle API errors with response
  if (error.response?.data) {
    return error.response.data.error || error.response.data.message || 'An error occurred'
  }

  // Handle authentication errors
  if (error.status === 401) {
    return 'Authentication required. Please sign in.'
  }

  // Handle permission errors
  if (error.status === 403) {
    return 'You do not have permission to perform this action.'
  }

  // Handle not found errors
  if (error.status === 404) {
    return 'The requested resource was not found.'
  }

  // Handle rate limiting
  if (error.status === 429) {
    return 'Too many requests. Please try again later.'
  }

  // Handle server errors
  if (error.status >= 500) {
    return 'Server error. Please try again later.'
  }

  return error.message || 'An unexpected error occurred'
}
