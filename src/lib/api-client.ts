/**
 * API Client (Legacy)
 * 
 * This file is maintained for backward compatibility.
 * New code should import from '@/services' instead.
 * 
 * @deprecated Use '@/services' instead
 * @see /services/index.ts
 */

// Re-export everything from services for backward compatibility
export {
  apiClient,
  handleAPIError,
  questionsService as questionsApi,
  answersService as answersApi,
  commentsService as commentsApi,
  tagsService as tagsApi,
  authService as authApi,
  searchService as searchApi,
  MockAIService,
  uploadImage,
  deleteImage,
  getMedia,
  getUserMedia,
  mapPostToQuestion,
  savedItemsService,
  savedItemsApi,
} from '@/services'

// Re-export types
export type { 
  UploadImageResponse, 
  MediaError,
  AISuggestion,
  TagSuggestion,
  SavedItem,
  SavedList,
  SaveItemRequest,
  CreateSavedListRequest,
} from '@/services'

// Legacy media API for compatibility
export const mediaApi = {
  uploadImage: async (file: File) => {
    const { uploadImage } = await import('@/services')
    const response = await uploadImage(file)
    return {
      url: response.url,
      publicId: response.publicId,
      mediaId: response.id,
    }
  },
  uploadImages: async (files: File[]) => {
    const { uploadImage } = await import('@/services')
    const uploadPromises = files.map(async (file) => {
      const response = await uploadImage(file)
      return {
        url: response.url,
        publicId: response.publicId,
        mediaId: response.id,
      }
    })
    return Promise.all(uploadPromises)
  },
}
