/**
 * Questions Service
 * 
 * Handles all question/post-related API operations.
 * Backend uses "posts" terminology but frontend uses "questions".
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

import { apiClient } from './base-service'
import type { Question } from '@/types/questions'

/**
 * Data transformation helpers
 */

// Extract title from content (first line or first 100 chars)
const extractTitle = (content: string): string => {
  if (!content) return 'Untitled';
  const lines = content.split('\n');
  const firstLine = lines[0]?.trim() || 'Untitled';
  return firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine;
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

// Map backend Post model to frontend Question model
export const mapPostToQuestion = (post: any): Question => {
  const fullContent = post.content || '';
  const title = extractTitle(fullContent);
  const contentBody = extractContentBody(fullContent);
  
  // Transform tags: backend returns array of objects with {id, name, description}
  // frontend expects array of strings (tag names)
  const tags = Array.isArray(post.tags) 
    ? post.tags.map((tag: any) => {
        if (typeof tag === 'string') return tag;
        if (tag && typeof tag === 'object' && tag.name) return tag.name;
        return '';
      }).filter((tag: string) => tag !== '')
    : [];
  
  return {
    id: post.id,
    title: title,
    content: fullContent,
    excerpt: extractExcerpt(contentBody),
    votes: post.totalVotes !== undefined ? post.totalVotes : (post.likesCount || 0),
    answers: post.answersCount !== undefined ? post.answersCount : (post.commentsCount || 0),
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
    userVote: post.userVote || null,
    isBookmarked: post.isFavorited || false,
  }
}

/**
 * Questions API Service
 */
export const questionsService = {
  /**
   * Get all questions/posts
   * Maps to GET /api/v1/posts/feed
   */
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
    }

    const queryString = queryParams.toString()
    const response = await apiClient.get<any>(`/posts/feed${queryString ? `?${queryString}` : ''}`)
    
    if (response.posts && Array.isArray(response.posts)) {
      return response.posts.map(mapPostToQuestion)
    }
    return []
  },
  
  /**
   * Get single question by ID
   * Maps to GET /api/v1/posts/:id
   */
  getQuestion: async (id: string): Promise<Question> => {
    const response = await apiClient.get<any>(`/posts/${id}`)
    return mapPostToQuestion(response)
  },
    
  /**
   * Create a new question
   * Maps to POST /api/v1/posts
   */
  createQuestion: async (data: {
    title: string;
    content: string;
    tags: string[];
    mediaUrls?: string[];
  }): Promise<Question> => {
    let contentText = data.content;
    if (typeof data.content === 'object' && (data as any).contentHtml) {
      contentText = (data as any).contentHtml;
    }
    
    const postData: any = {
      content: `${data.title}\n\n${contentText}`,
      privacy: 'PUBLIC',
      tags: data.tags,
    }
    
    if (data.mediaUrls && data.mediaUrls.length > 0) {
      postData.mediaUrls = data.mediaUrls;
    }
    
    console.log('[Questions Service] Creating question:', postData);
    
    const response = await apiClient.post<any>('/posts', postData)
    return mapPostToQuestion(response)
  },
    
  /**
   * Update an existing question
   * Maps to PATCH /api/v1/posts/:id
   */
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
    
  /**
   * Delete a question
   * Maps to DELETE /api/v1/posts/:id
   */
  deleteQuestion: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`)
  },
    
  /**
   * Vote on a question (up or down)
   * Maps to POST /api/v1/posts/:id/like or DELETE /api/v1/posts/:id/like
   */
  voteQuestion: async (id: string, voteType: 'up' | 'down'): Promise<any> => {
    if (voteType === 'up') {
      return await apiClient.post(`/posts/${id}/like`, {})
    } else {
      return await apiClient.delete(`/posts/${id}/like`)
    }
  },

  /**
   * Get user's favorited questions
   * Maps to GET /api/v1/posts/favorites
   */
  getUserFavorites: async (params?: { 
    page?: number; 
    limit?: number;
    listName?: string;
  }): Promise<{ 
    favorites: any[]; 
    total: number;
    page: number;
    limit: number;
  }> => {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.listName) queryParams.append('listName', params.listName)
    
    const queryString = queryParams.toString()
    const response = await apiClient.get<any>(`/posts/favorites${queryString ? `?${queryString}` : ''}`)
    
    return {
      favorites: response.favorites || [],
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 20,
    }
  },

  /**
   * Toggle favorite status for a question
   * Maps to POST /api/v1/posts/:id/favorite (toggles on/off automatically)
   */
  favoriteQuestion: async (id: string, listName?: string): Promise<{ 
    success: boolean; 
    isFavorited: boolean;
  }> => {
    const body = listName ? { listName } : {}
    const response = await apiClient.post(`/posts/${id}/favorite`, body)
    return {
      success: response.success !== false,
      isFavorited: response.isFavorited || false,
    }
  },

  /**
   * Unfavorite a question
   * Maps to DELETE /api/v1/posts/:id/favorite
   */
  unfavoriteQuestion: async (id: string): Promise<{ 
    success: boolean; 
    isFavorited: boolean;
  }> => {
    const response = await apiClient.delete(`/posts/${id}/favorite`)
    return {
      success: response.success !== false,
      isFavorited: false,
    }
  },
}
