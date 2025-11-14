import { apiClient } from './client';

export interface VoteQuestionResponse {
  success: boolean;
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  userVote?: 'up' | 'down' | null;
}

export interface FavoriteQuestionResponse {
  success: boolean;
  isFavorited: boolean;
}

export interface FavoriteQuestionItem {
  id: string;
  questionId: string;
  listName: string;
  createdAt: string;
  question?: any; // Full question data
}

export interface UserFavoritesResponse {
  favorites: FavoriteQuestionItem[];
  total: number;
  page: number;
  limit: number;
}

export const questionsApi = {
  /**
   * Vote on a question (up or down)
   * Voting the same type again will toggle it off
   * Voting a different type will change the vote
   */
  voteQuestion: async (questionId: string, voteType: 'up' | 'down'): Promise<VoteQuestionResponse> => {
    const response = await apiClient.post(`/posts/${questionId}/vote`, { voteType });
    return response.data;
  },

  /**
   * Get vote counts for a question
   * If user is authenticated, also returns their vote status
   */
  getQuestionVotes: async (questionId: string): Promise<VoteQuestionResponse> => {
    const response = await apiClient.get(`/posts/${questionId}/votes`);
    return response.data;
  },

  /**
   * Toggle favorite on a question
   * If already favorited, will unfavorite
   * If not favorited, will favorite
   */
  favoriteQuestion: async (questionId: string, listName?: string): Promise<FavoriteQuestionResponse> => {
    const response = await apiClient.post(`/posts/${questionId}/favorite`, {
      listName: listName || 'default'
    });
    return response.data;
  },

  /**
   * Remove favorite from a question
   */
  unfavoriteQuestion: async (questionId: string): Promise<FavoriteQuestionResponse> => {
    const response = await apiClient.delete(`/posts/${questionId}/favorite`);
    return response.data;
  },

  /**
   * Get user's favorite questions
   */
  getUserFavorites: async (params?: {
    listName?: string;
    page?: number;
    limit?: number;
  }): Promise<UserFavoritesResponse> => {
    const response = await apiClient.get('/posts/favorites', { params });
    return response.data;
  },
};
