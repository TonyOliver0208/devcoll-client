/**
 * Media Service
 * 
 * Handles image uploads and media operations with the backend media-service.
 * Supports file uploads to Cloudinary via the media microservice.
 * 
 * @author DevColl Team
 * @version 1.0.0
 */

import { apiClient } from './client';

export interface UploadImageResponse {
  id: string;
  url: string;
  publicId: string;
  format: string;
  size: number;
  width: number;
  height: number;
  resourceType: string;
  userId: string;
  createdAt: string;
}

export interface MediaError {
  message: string;
  statusCode: number;
}

/**
 * Upload an image file to the media service
 * @param file - The image file to upload
 * @returns Promise with upload result containing image URL and metadata
 */
export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  try {
    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 10MB');
    }

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);

    // Upload to media service
    const response = await apiClient.post<UploadImageResponse>(
      '/media/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for large uploads
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('Media Service: Upload failed:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to upload image');
    }
  }
};

/**
 * Delete an image from the media service
 * @param mediaId - The ID of the media to delete
 * @returns Promise that resolves when deletion is complete
 */
export const deleteImage = async (mediaId: string): Promise<void> => {
  try {
    await apiClient.delete(`/media/${mediaId}`);
  } catch (error: any) {
    console.error('Media Service: Delete failed:', error);
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to delete image');
    }
  }
};

/**
 * Get media details by ID
 * @param mediaId - The ID of the media to retrieve
 * @returns Promise with media details
 */
export const getMedia = async (mediaId: string): Promise<UploadImageResponse> => {
  try {
    const response = await apiClient.get<UploadImageResponse>(`/media/${mediaId}`);
    return response.data;
  } catch (error: any) {
    console.error('Media Service: Get media failed:', error);
    throw new Error(error.response?.data?.message || 'Failed to get media');
  }
};

/**
 * Get all media uploaded by the current user
 * @param type - Optional filter by resource type (image, video, etc.)
 * @param page - Page number for pagination
 * @param limit - Number of items per page
 * @returns Promise with array of media items
 */
export const getUserMedia = async (
  type?: string,
  page: number = 1,
  limit: number = 20
): Promise<UploadImageResponse[]> => {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.get<UploadImageResponse[]>(
      `/media/user?${params.toString()}`
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Media Service: Get user media failed:', error);
    throw new Error(error.response?.data?.message || 'Failed to get user media');
  }
};

export default {
  uploadImage,
  deleteImage,
  getMedia,
  getUserMedia,
};
