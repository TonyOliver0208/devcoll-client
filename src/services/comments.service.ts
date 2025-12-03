/**
 * Comments Service
 * 
 * Handles all comment-related API operations for questions and answers.
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

import { apiClient } from './base-service'

export const commentsService = {
  /**
   * Get comments for a question/post
   * Maps to GET /api/v1/posts/:postId/comments
   */
  getComments: (postId: string, params?: { page?: number; limit?: number }): Promise<any> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return apiClient.get(`/posts/${postId}/comments${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Get comments for an answer
   * Maps to GET /api/v1/posts/answers/:answerId/comments
   */
  getAnswerComments: (answerId: string, params?: { page?: number; limit?: number }): Promise<any> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    const queryString = queryParams.toString()
    return apiClient.get(`/posts/answers/${answerId}/comments${queryString ? `?${queryString}` : ''}`)
  },

  /**
   * Create a comment on a question/post
   * Maps to POST /api/v1/posts/:postId/comments
   */
  createComment: (postId: string, data: { content: string; parentId?: string }): Promise<any> => {
    return apiClient.post(`/posts/${postId}/comments`, data)
  },

  /**
   * Create a comment on an answer
   * Maps to POST /api/v1/posts/answers/:answerId/comments
   */
  createAnswerComment: (answerId: string, data: { content: string; parentId?: string }): Promise<any> => {
    return apiClient.post(`/posts/answers/${answerId}/comments`, data)
  },

  /**
   * Update a comment
   * Maps to PATCH /api/v1/posts/comments/:commentId
   */
  updateComment: (commentId: string, data: { content: string }): Promise<any> => {
    return apiClient.patch(`/posts/comments/${commentId}`, data)
  },

  /**
   * Delete a comment
   * Maps to DELETE /api/v1/posts/comments/:commentId
   */
  deleteComment: (commentId: string): Promise<any> => {
    return apiClient.delete(`/posts/comments/${commentId}`)
  },
}
