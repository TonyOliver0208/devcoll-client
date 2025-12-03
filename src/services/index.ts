/**
 * Services Index
 * 
 * Central export point for all API services.
 * Import services from here instead of individual files.
 * 
 * @author DevColl Team
 * @version 2.0.0
 * 
 * @example
 * import { questionsService, answersService } from '@/services'
 */

// Base client and utilities
export { apiClient, handleAPIError } from './base-service'

// Domain services
export { questionsService, mapPostToQuestion } from './questions.service'
export { answersService } from './answers.service'
export { commentsService } from './comments.service'
export { tagsService } from './tags.service'
export { authService } from './auth.service'
export { searchService } from './search.service'

// AI service (mock)
export { MockAIService } from './mockAIService'
export type { AISuggestion, TagSuggestion } from './mockAIService'

// Media service
export { uploadImage, deleteImage, getMedia, getUserMedia } from './media'
export type { UploadImageResponse, MediaError } from './media'

// Saved items service
export { savedItemsService, savedItemsApi } from './savedItems'
export type { SavedItem, SavedList, SaveItemRequest, CreateSavedListRequest } from './savedItems'
