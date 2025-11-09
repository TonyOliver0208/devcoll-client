import { apiClient } from './api-client';

export interface UploadImageResponse {
  success: boolean;
  data?: {
    id: string;
    url: string;
    type: string;
    filename: string;
    publicId?: string;
  };
  error?: string;
}

export const uploadImage = async (file: File): Promise<UploadImageResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<any>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error('Image upload failed:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to upload image',
    };
  }
};
