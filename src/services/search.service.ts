/**
 * Search Service
 * 
 * Handles search operations through the search-service microservice.
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

import { apiClient } from './base-service'

export const searchService = {
  /**
   * Search through posts/questions
   * Maps to GET /api/v1/search/posts or /api/v1/search/users
   */
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

    const endpoint = filters?.type === 'users' ? '/search/users' : '/search/posts'
    return apiClient.get(`${endpoint}?${params.toString()}`)
  },
  
  /**
   * Get search suggestions (not yet implemented in backend)
   */
  getSearchSuggestions: (query: string): Promise<any> => {
    console.warn('Search suggestions not implemented in backend yet')
    return Promise.resolve([])
  },
}
