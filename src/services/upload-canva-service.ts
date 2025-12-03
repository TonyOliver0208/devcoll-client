/**
 * Upload Service (Canvas/Editor)
 * 
 * Handles file uploads and AI image generation for the canvas editor.
 * Integrates with the media-service for uploads and AI operations.
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

import { apiClient } from "./base-service";

export interface AIImageGenerationResponse {
  id: string;
  url: string;
  prompt: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  userId: string;
  createdAt: string;
}

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

/**
 * Upload a file with authentication
 * @param file - The file to upload
 * @param metaData - Additional metadata for the upload
 * @returns Promise with upload result
 */
export async function uploadFileWithAuth(file: File, metaData: Record<string, any> = {}): Promise<UploadImageResponse> {
  try {
    // Validate file
    if (!file) {
      throw new Error("File is required");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", "image");

    Object.entries(metaData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const response = await apiClient.post<UploadImageResponse>("/media/upload", formData);
    return response;
  } catch (error: any) {
    console.error("Upload Service: Upload failed:", error);
    throw new Error(error.message || "Upload Failed");
  }
}

/**
 * Generate an image using AI based on a text prompt
 * @param prompt - Text description of the image to generate
 * @returns Promise with generated image URL and metadata
 */
export async function generateImageFromAI(prompt: string): Promise<{ data: AIImageGenerationResponse }> {
  try {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt is required for AI image generation");
    }

    const response = await apiClient.post<AIImageGenerationResponse>(
      "/media/ai/generate-image",
      { prompt: prompt.trim() }
    );

    return { data: response };
  } catch (error: any) {
    console.error("Upload Service: AI image generation failed:", error);
    throw new Error(error.message || "Failed to generate AI image");
  }
}
