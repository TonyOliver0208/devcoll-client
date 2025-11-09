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
      
      // Wait before retry (exponential backoff)
      if (i < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, i)))
      }
    }
    
    return null
  }

  /**
   * Refresh access token by forcing NextAuth to re-evaluate the JWT
   * This works by setting the access token expiry to the past, triggering NextAuth's refresh logic
   */
  private async refreshAccessToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = (async () => {
      try {
        console.log('[API Client] 🔄 Manual token refresh triggered (401 received)...')
        
        // Get current session
        const sessionResponse = await fetch('/api/auth/session')
        if (!sessionResponse.ok) {
          throw new Error('Could not get session')
        }
        
        const currentSession = await sessionResponse.json()
        if (!currentSession?.refreshToken) {
          console.error('[API Client] ❌ No refresh token in session - user must re-login')
          throw new Error('No refresh token in current session')
        }

        console.log('[API Client] 🔍 Current session state:', {
          hasAccessToken: !!currentSession.accessToken,
          hasRefreshToken: !!currentSession.refreshToken,
          accessTokenPreview: currentSession.accessToken?.substring(0, 30),
          refreshTokenPreview: currentSession.refreshToken?.substring(0, 30)
        })

        // Call NextAuth's session update endpoint with trigger=update
        // This forces NextAuth to call the jwt() callback, which will check
        // if the access token is expired and refresh if needed
        console.log('[API Client] 📞 Calling session update...')
        const updateResponse = await fetch('/api/auth/session', {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        })

        if (!updateResponse.ok) {
          throw new Error(`Session update failed: ${updateResponse.status}`)
        }

        const updatedSession = await updateResponse.json()
        
        if (!updatedSession?.accessToken) {
          console.error('[API Client] ❌ No access token after session update')
          throw new Error('Session update did not return access token')
        }

        const tokenChanged = updatedSession.accessToken !== currentSession.accessToken

        console.log('[API Client] ✅ Session updated', {
          hasAccessToken: !!updatedSession.accessToken,
          hasRefreshToken: !!updatedSession.refreshToken,
          accessTokenChanged: tokenChanged,
          newAccessTokenPreview: updatedSession.accessToken?.substring(0, 30),
          newRefreshTokenPreview: updatedSession.refreshToken?.substring(0, 30)
        })

        if (!tokenChanged) {
          console.warn('[API Client] ⚠️  Access token did not change - may still be using expired token')
          // This can happen if NextAuth hasn't detected expiration yet
          // Wait a moment and try one more time
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
        return true
      } catch (error) {
        console.error('[API Client] ❌ Token refresh failed:', error)
        console.error('[API Client] 🔍 Error details:', {
          message: error instanceof Error ? error.message : String(error),
          name: error instanceof Error ? error.name : 'Unknown'
        })
        
        // Session is invalid, redirect to sign in
        if (typeof window !== 'undefined') {
          const currentUrl = window.location.href
          console.log('[API Client] 🔄 Session invalid - redirecting to sign in...')
          window.location.href = `/api/auth/signin?callbackUrl=${encodeURIComponent(currentUrl)}`
        }
        
        return false
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
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

      // Get session token for authentication
      try {
        if (typeof window === 'undefined') {
          // Server-side: safe to call auth()
          const session = await auth()
          if (session?.accessToken) {
            headers['Authorization'] = `Bearer ${session.accessToken}`
            console.log('[API Client] Adding internal JWT token to request (server)')
          }
        } else {
          // Client-side: wait for session with retry logic
          const session = await this.waitForSession()
          
          if (session?.accessToken) {
            headers['Authorization'] = `Bearer ${session.accessToken}`
            console.log('[API Client] Adding internal JWT token to request (client)')
          } else {
            console.warn('[API Client] Client-side request - no access token available after retries')
          }
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
    attempt = 1,
    retryOn401 = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const headers = await this.getAuthHeaders()
      
      // If body is FormData, remove Content-Type header (browser will set it with boundary)
      if (options.body instanceof FormData) {
        delete headers['Content-Type']
      }
      
      console.log(`[API Request] ${options.method || 'GET'} ${endpoint}`, {
        attempt,
        url,
        hasToken: !!headers['Authorization'],
        authHeader: headers['Authorization'] ? `${headers['Authorization'].substring(0, 20)}...` : 'none'
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

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && retryOn401 && typeof window !== 'undefined') {
        console.log('[API Client] 401 Unauthorized - attempting token refresh')
        
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Retry the request with new token (only once)
          console.log('[API Client] Retrying request with new token')
          return this.request<T>(endpoint, options, attempt, false)
        } else {
          // Refresh failed, throw the 401 error
          const apiError: ApiError = {
            message: 'Authentication failed - please sign in again',
            status: 401,
            code: 'UNAUTHENTICATED',
          }
          throw apiError
        }
      }

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
    // Check if data is FormData - if so, don't stringify it
    const body = data instanceof FormData 
      ? data 
      : data ? JSON.stringify(data) : undefined;
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      ...options,
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    // Check if data is FormData - if so, don't stringify it
    const body = data instanceof FormData 
      ? data 
      : data ? JSON.stringify(data) : undefined;
    
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
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
  const fullContent = post.content || '';
  const title = extractTitle(fullContent);
  const contentBody = extractContentBody(fullContent);
  
  // Transform tags: backend returns array of objects with {id, name, description}
  // frontend expects array of strings (tag names)
  const tags = Array.isArray(post.tags) 
    ? post.tags.map((tag: any) => {
        // If tag is already a string, return it
        if (typeof tag === 'string') return tag;
        // If tag is an object with name property, extract the name
        if (tag && typeof tag === 'object' && tag.name) return tag.name;
        // Fallback: return empty string and filter out later
        return '';
      }).filter((tag: string) => tag !== '')
    : [];
  
  return {
    id: post.id, // Keep as string (UUID from backend) or number (mock data)
    title: title,
    content: fullContent,
    excerpt: extractExcerpt(contentBody),
    votes: post.likesCount || 0,
    answers: post.commentsCount || 0,
    views: 0, // Backend doesn't track views yet
    tags: tags,
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
  const lines = content.split('\n')
  const firstLine = lines[0]?.trim() || 'Untitled'
  return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine
}

// Extract content body (everything after first line)
const extractContentBody = (content: string): string => {
  if (!content) return ''
  const lines = content.split('\n')
  return lines.slice(1).join('\n').trim()
}

// Extract excerpt from content body (first 200 chars, strip HTML tags)
const extractExcerpt = (content: string): string => {
  if (!content) return ''
  
  // Remove HTML tags
  const strippedContent = content.replace(/<[^>]*>/g, '')
  
  // Get first 200 characters
  const excerpt = strippedContent.substring(0, 200).trim()
  
  return excerpt.length < strippedContent.length ? excerpt + '...' : excerpt
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
    mediaUrls?: string[];
  }): Promise<Question> => {
    // Backend expects: { content, mediaUrls?, privacy?, tags? }
    // Frontend sends: { title, content, tags, mediaUrls? }
    // Note: content might be from Tiptap editor (contentHtml) or plain string
    
    // If content is an object (Tiptap editor state), we need contentHtml
    let contentText = data.content;
    if (typeof data.content === 'object' && (data as any).contentHtml) {
      contentText = (data as any).contentHtml;
    }
    
    const postData: any = {
      content: `${data.title}\n\n${contentText}`,
      privacy: 'PUBLIC',
      tags: data.tags, // Send tags to backend
    }
    
    // Add media URLs if provided
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      postData.mediaUrls = data.mediaUrls;
    }
    
    console.log('[API Client] Creating post with data:', postData);
    
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
  // Get all tags with pagination
  getTags: (params?: { page?: number; limit?: number }): Promise<{ tags: Tag[]; total: number }> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return apiClient.get(`/posts/tags${queryString ? `?${queryString}` : ''}`)
  },
    
  // Get popular tags (default 5)
  getPopularTags: (limit = 5): Promise<{ tags: Tag[]; total: number }> => {
    return apiClient.get(`/posts/tags/popular?limit=${limit}`)
  },
    
  // Get posts by tag name
  getPostsByTag: async (tagName: string, params?: { page?: number; limit?: number }): Promise<any> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    const response = await apiClient.get<any>(`/posts/tags/${encodeURIComponent(tagName)}${queryString ? `?${queryString}` : ''}`)
    
    // Transform posts to questions format with proper tag handling
    if (response.posts && Array.isArray(response.posts)) {
      return {
        ...response,
        posts: response.posts.map(mapPostToQuestion)
      }
    }
    return response
  },
    
  // Create a new tag (admin only)
  createTag: (data: { name: string; description?: string }): Promise<Tag> => {
    return apiClient.post('/posts/tags', data)
  },
}

export const commentsApi = {
  // Get comments for a post
  getComments: (postId: string, params?: { page?: number; limit?: number }): Promise<any> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return apiClient.get(`/posts/${postId}/comments${queryString ? `?${queryString}` : ''}`)
  },

  // Create a comment on a post
  createComment: (postId: string, data: { content: string; parentId?: string }): Promise<any> => {
    return apiClient.post(`/posts/${postId}/comments`, data)
  },

  // Delete a comment
  deleteComment: (commentId: string): Promise<any> => {
    return apiClient.delete(`/posts/comments/${commentId}`)
  },
}

export const mediaApi = {
  // Upload a single image file
  uploadImage: async (file: File): Promise<{ url: string; publicId: string; mediaId: string }> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'image')
    
    // Don't pass headers option - let apiClient.post handle all headers including auth
    // Browser will automatically set Content-Type with boundary for FormData
    const response = await apiClient.post<any>('/media/upload', formData)
    
    return {
      url: response.url,
      publicId: response.publicId,
      mediaId: response.id || response._id,
    }
  },
  
  // Upload multiple images
  uploadImages: async (files: File[]): Promise<Array<{ url: string; publicId: string; mediaId: string }>> => {
    const uploadPromises = files.map(file => mediaApi.uploadImage(file))
    return Promise.all(uploadPromises)
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
