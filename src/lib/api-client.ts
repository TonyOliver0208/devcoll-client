import { ApiError, NetworkError } from '@/lib/errors'

// API Client for microservices architecture
import type { Question } from '@/types/questions'
import type { Tag } from '@/types/tag'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        
        const apiError: ApiError = {
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: errorData.code,
          details: errorData.details,
        }
        
        throw apiError
      }

      return response.json()
    } catch (error) {
      // Network or parsing errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError: NetworkError = new Error('Network connection failed')
        networkError.code = 'NETWORK_ERROR'
        throw networkError
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

// Microservice-specific clients
export const questionsApi = {
  getQuestions: (params?: any): Promise<Question[]> => apiClient.get('/questions', { ...params }),
  getQuestion: (id: string): Promise<Question> => apiClient.get(`/questions/${id}`),
  createQuestion: (data: any): Promise<Question> => apiClient.post('/questions', data),
  updateQuestion: (id: string, data: any): Promise<Question> => apiClient.put(`/questions/${id}`, data),
  deleteQuestion: (id: string): Promise<void> => apiClient.delete(`/questions/${id}`),
}

export const authApi = {
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data: any) => apiClient.put('/auth/profile', data),
}

export const tagsApi = {
  getTags: (): Promise<Tag[]> => apiClient.get('/tags'),
  getTag: (id: string) => apiClient.get(`/tags/${id}`),
}
