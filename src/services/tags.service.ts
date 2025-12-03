/**
 * Tags Service
 * 
 * Handles all tag-related API operations.
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

import { apiClient } from './base-service'
import { mapPostToQuestion } from './questions.service'
import type { Tag } from '@/types/tag'

export const tagsService = {
  /**
   * Get all tags with pagination
   * Maps to GET /api/v1/posts/tags
   */
  getTags: (params?: { page?: number; limit?: number }): Promise<{ tags: Tag[]; total: number }> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return apiClient.get(`/posts/tags${queryString ? `?${queryString}` : ''}`)
  },
    
  /**
   * Get popular tags
   * Maps to GET /api/v1/posts/tags/popular
   */
  getPopularTags: (limit = 5): Promise<{ tags: Tag[]; total: number }> => {
    return apiClient.get(`/posts/tags/popular?limit=${limit}`)
  },
    
  /**
   * Get posts by tag name
   * Maps to GET /api/v1/posts/tags/:tagName
   */
  getPostsByTag: async (tagName: string, params?: { page?: number; limit?: number }): Promise<any> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    const response = await apiClient.get<any>(`/posts/tags/${encodeURIComponent(tagName)}${queryString ? `?${queryString}` : ''}`)
    
    // Transform posts to questions format
    if (response.posts && Array.isArray(response.posts)) {
      return {
        ...response,
        posts: response.posts.map(mapPostToQuestion)
      }
    }
    return response
  },
    
  /**
   * Create a new tag (admin only)
   * Maps to POST /api/v1/posts/tags
   */
  createTag: (data: { name: string; description?: string }): Promise<Tag> => {
    return apiClient.post('/posts/tags', data)
  },
}
