import { ApiError, NetworkError } from '@/lib/errors'
import { auth } from '@/auth'

// API Client for microservices architecture through API Gateway
import type { Question } from '@/types/questions'
import type { Tag } from '@/types/tag'

// API Gateway configuration
// Backend runs on port 4000 with /api/v1 prefix
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

// Data transformation helpers
// Map backend Post model to frontend Question model
const mapPostToQuestion = (post: any): Question => {
  return {
    id: parseInt(post.id) || 0,
    title: extractTitle(post.content) || 'Untitled',
    content: post.content,
    votes: post.likesCount || 0,
    answers: post.commentsCount || 0,
    views: 0, // Backend doesn't track views yet
    tags: post.tags || [],
    timeAgo: formatTimeAgo(post.createdAt),
    author: {
      id: post.userId,
      name: post.author?.name || 'Anonymous',
      reputation: post.author?.reputation || 0,
      avatar: post.author?.picture,
    },
    hasAcceptedAnswer: false,
    userVote: null,
    isBookmarked: false,
  }
}

// Extract title from content (first line or first 100 chars)
const extractTitle = (content: string): string => {
  if (!content) return 'Untitled'
  const firstLine = content.split('\n')[0]
  return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine
}

// Format timestamp to relative time
const formatTimeAgo = (timestamp: string): string => {
  if (!timestamp) return 'just now'
  const date = new Date(timestamp)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`
  return `${Math.floor(seconds / 2592000)} months ago`
}

// Microservice-specific clients updated for API Gateway routing
// Note: Backend uses "posts" but frontend uses "questions" terminology
export const questionsApi = {
  // Get all posts/questions - maps to GET /api/v1/posts/feed
  getQuestions: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Question[]> => {
    const queryParams = new URLSearchParams()
    
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString())
      if (params.limit) queryParams.append('limit', params.limit.toString())
      // Note: Backend doesn't support search/tags/sort yet
      // These will be added to the backend later
    }

    const queryString = queryParams.toString()
    const response = await apiClient.get<any>(`/posts/feed${queryString ? `?${queryString}` : ''}`)
    
    // Transform backend response to frontend format
    if (response.posts && Array.isArray(response.posts)) {
      return response.posts.map(mapPostToQuestion)
    }
    return []
  },
  
  // Get single post/question - maps to GET /api/v1/posts/:id
  getQuestion: async (id: string): Promise<Question> => {
    const response = await apiClient.get<any>(`/posts/${id}`)
    return mapPostToQuestion(response)
  },
    
  // Create post/question - maps to POST /api/v1/posts
  createQuestion: async (data: {
    title: string;
    content: string;
    tags: string[];
  }): Promise<Question> => {
    // Backend expects: { content, mediaUrls?, visibility? }
    // Frontend sends: { title, content, tags }
    // Combine title and content for now
    const postData = {
      content: `${data.title}\n\n${data.content}`,
      visibility: 'PUBLIC',
      // Note: Backend doesn't support tags yet
    }
    
    const response = await apiClient.post<any>('/posts', postData)
    return mapPostToQuestion(response)
  },
    
  // Update post/question - maps to PATCH /api/v1/posts/:id
  updateQuestion: async (id: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
  }): Promise<Question> => {
    const postData: any = {}
    
    if (data.title || data.content) {
      const title = data.title || ''
      const content = data.content || ''
      postData.content = title ? `${title}\n\n${content}` : content
    }
    
    const response = await apiClient.put<any>(`/posts/${id}`, postData)
    return mapPostToQuestion(response)
  },
    
  // Delete post/question - maps to DELETE /api/v1/posts/:id
  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`)
  },
    
  // Vote on post/question - maps to POST /api/v1/posts/:id/like or DELETE /api/v1/posts/:id/like
  voteQuestion: async (id: string, voteType: 'up' | 'down'): Promise<any> => {
    if (voteType === 'up') {
      return await apiClient.post(`/posts/${id}/like`, {})
    } else {
      return await apiClient.delete(`/posts/${id}/like`)
    }
  },
}

export const authApi = {
  // Authentication and user management through API Gateway
  // Note: Using stateless JWT authentication via NextAuth
  
  // Get current user profile - maps to GET /api/v1/users/profile
  getProfile: (): Promise<any> => 
    apiClient.get('/users/profile'),
    
  // Update user profile - maps to PUT /api/v1/users/profile
  updateProfile: (data: {
    name?: string;
    username?: string;
    bio?: string;
    picture?: string;
    preferences?: any;
    profile?: any;
  }): Promise<any> => 
    apiClient.put('/users/profile', data),
    
  // Get user by ID - maps to GET /api/v1/users/:id
  getUserById: (userId: string): Promise<any> => 
    apiClient.get(`/users/${userId}`),
    
  // Get list of users - maps to GET /api/v1/users
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
    return apiClient.get(`/users${queryString ? `?${queryString}` : ''}`)
  },
    
  // Note: Backend doesn't have "top users" endpoint yet
  getTopUsers: (limit = 10): Promise<any> => 
    apiClient.get(`/users?limit=${limit}&sortBy=reputation&sortOrder=desc`),
}

export const tagsApi = {
  // Note: Backend doesn't have tags service yet
  // These endpoints will return mock data until backend is implemented
  getTags: (): Promise<Tag[]> => {
    console.warn('Tags API not implemented in backend yet')
    return Promise.resolve([])
  },
    
  getTag: (id: string): Promise<Tag> => {
    console.warn('Tags API not implemented in backend yet')
    return Promise.reject(new Error('Tags API not implemented'))
  },
    
  createTag: (data: { name: string; description?: string }): Promise<Tag> => {
    console.warn('Tags API not implemented in backend yet')
    return Promise.reject(new Error('Tags API not implemented'))
  },
    
  updateTag: (id: string, data: { name?: string; description?: string }): Promise<Tag> => {
    console.warn('Tags API not implemented in backend yet')
    return Promise.reject(new Error('Tags API not implemented'))
  },
    
  deleteTag: (id: string): Promise<void> => {
    console.warn('Tags API not implemented in backend yet')
    return Promise.reject(new Error('Tags API not implemented'))
  },
}

export const searchApi = {
  // Search through API Gateway to search-service
  // Maps to GET /api/v1/search/posts
  search: async (query: string, filters?: {
    type?: 'questions' | 'users' | 'all';
    tags?: string[];
    dateRange?: string;
  }): Promise<any> => {
    const params = new URLSearchParams({ query })
    
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

    // Backend has /search/posts and /search/users
    const endpoint = filters?.type === 'users' ? '/search/users' : '/search/posts'
    return apiClient.get(`${endpoint}?${params.toString()}`)
  },
  
  // Note: Backend doesn't have suggestions endpoint yet
  getSearchSuggestions: (query: string): Promise<any> => {
    console.warn('Search suggestions not implemented in backend yet')
    return Promise.resolve([])
  },
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
