/**
 * Answers Service
 * 
 * Handles all answer-related API operations.
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

import { apiClient } from './base-service'

export const answersService = {
  /**
   * Create an answer to a question
   * Maps to POST /api/v1/posts/:questionId/answers
   */
  createAnswer: (questionId: string, data: { content: string }): Promise<any> => {
    const url = `/posts/${questionId}/answers`;
    console.log('[Answers Service] Creating answer:', { questionId, url, contentLength: data.content?.length });
    return apiClient.post(url, data)
  },

  /**
   * Get all answers for a question
   * Maps to GET /api/v1/posts/:questionId/answers
   */
  getAnswers: (questionId: string): Promise<any> => {
    return apiClient.get(`/posts/${questionId}/answers`)
  },

  /**
   * Update an existing answer
   * Maps to PATCH /api/v1/posts/answers/:answerId
   */
  updateAnswer: (answerId: string, data: { content: string }): Promise<any> => {
    return apiClient.patch(`/posts/answers/${answerId}`, data)
  },

  /**
   * Delete an answer
   * Maps to DELETE /api/v1/posts/answers/:answerId
   */
  deleteAnswer: (answerId: string): Promise<any> => {
    return apiClient.delete(`/posts/answers/${answerId}`)
  },

  /**
   * Vote on an answer (up or down)
   * Maps to POST /api/v1/posts/answers/:answerId/vote
   */
  voteAnswer: (answerId: string, voteType: 'up' | 'down'): Promise<any> => {
    return apiClient.post(`/posts/answers/${answerId}/vote`, { voteType })
  },

  /**
   * Accept an answer (question author only)
   * Maps to POST /api/v1/posts/answers/:answerId/accept
   */
  acceptAnswer: (answerId: string): Promise<any> => {
    return apiClient.post(`/posts/answers/${answerId}/accept`, {})
  },

  /**
   * Get vote counts for an answer
   * Maps to GET /api/v1/posts/answers/:answerId/votes
   */
  getAnswerVotes: (answerId: string): Promise<any> => {
    return apiClient.get(`/posts/answers/${answerId}/votes`)
  },
}
