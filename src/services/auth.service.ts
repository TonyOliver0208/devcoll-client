/**
 * Auth & Users Service
 * 
 * Handles authentication and user profile management.
 * Uses NextAuth for authentication with JWT tokens.
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

import { apiClient } from './base-service'

export const authService = {
  /**
   * Get current user profile
   * Maps to GET /api/v1/users/profile
   */
  getProfile: (): Promise<any> => 
    apiClient.get('/users/profile'),
    
  /**
   * Update user profile
   * Maps to PUT /api/v1/users/profile
   */
  updateProfile: (data: {
    name?: string;
    username?: string;
    bio?: string;
    picture?: string;
    preferences?: any;
    profile?: any;
  }): Promise<any> => 
    apiClient.put('/users/profile', data),
    
  /**
   * Get user by ID
   * Maps to GET /api/v1/users/:id
   */
  getUserById: (userId: string): Promise<any> => 
    apiClient.get(`/users/${userId}`),
    
  /**
   * Get list of users
   * Maps to GET /api/v1/users
   */
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
    
  /**
   * Get top users by reputation
   * Maps to GET /api/v1/users with sorting
   */
  getTopUsers: (limit = 10): Promise<any> => 
    apiClient.get(`/users?limit=${limit}&sortBy=reputation&sortOrder=desc`),
}
