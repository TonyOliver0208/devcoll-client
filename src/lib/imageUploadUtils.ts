/**
 * Image Upload Utilities
 * 
 * Handles batch upload of images and replacing placeholders in content
 */

import { uploadImage } from '@/services/media';
import type { PendingImage } from '@/components/questions/TiptapEditor';

export interface ImageUploadResult {
  id: string;
  url: string;
  alt: string;
}

/**
 * Upload all pending images and return their URLs
 * @param pendingImages - Array of images to upload
 * @returns Array of uploaded image results
 */
export async function uploadPendingImages(
  pendingImages: PendingImage[]
): Promise<ImageUploadResult[]> {
  const uploadPromises = pendingImages.map(async (img) => {
    try {
      const result = await uploadImage(img.file);
      return {
        id: img.id,
        url: result.url,
        alt: img.alt,
      };
    } catch (error) {
      console.error(`Failed to upload image ${img.id}:`, error);
      throw new Error(`Failed to upload image "${img.alt}"`);
    }
  });

  return await Promise.all(uploadPromises);
}

/**
 * Replace image placeholders in HTML content with actual image tags
 * @param html - HTML content with image placeholders
 * @param uploadResults - Results from image uploads
 * @returns HTML with placeholders replaced by img tags
 */
export function replaceImagePlaceholders(
  html: string,
  uploadResults: ImageUploadResult[]
): string {
  let updatedHtml = html;

  uploadResults.forEach((result) => {
    // Replace placeholder link with actual image tag
    const placeholderPattern = new RegExp(
      `<a[^>]*href=["']#image:${result.id}["'][^>]*>([^<]+)</a>`,
      'gi'
    );
    
    const imageTag = `<img src="${result.url}" alt="${result.alt}" class="rounded-lg max-w-full h-auto my-4" />`;
    
    updatedHtml = updatedHtml.replace(placeholderPattern, imageTag);
  });

  return updatedHtml;
}

/**
 * Replace image placeholders in JSON content with actual image nodes
 * @param json - TipTap JSON content
 * @param uploadResults - Results from image uploads
 * @returns Updated JSON with image nodes
 */
export function replaceImagePlaceholdersInJSON(
  json: any,
  uploadResults: ImageUploadResult[]
): any {
  if (!json || !json.content) return json;

  const updatedContent = json.content.map((node: any) => {
    if (node.type === 'paragraph' && node.content) {
      const updatedParagraphContent: any[] = [];
      
      node.content.forEach((item: any) => {
        // Check if this is a link with an image placeholder
        if (item.type === 'text' && item.marks) {
          const linkMark = item.marks.find(
            (mark: any) => mark.type === 'link' && mark.attrs.href?.startsWith('#image:')
          );
          
          if (linkMark) {
            const imageId = linkMark.attrs.href.replace('#image:', '');
            const uploadResult = uploadResults.find((r) => r.id === imageId);
            
            if (uploadResult) {
              // Replace with actual image node
              updatedParagraphContent.push({
                type: 'image',
                attrs: {
                  src: uploadResult.url,
                  alt: uploadResult.alt,
                  title: uploadResult.alt,
                },
              });
              return;
            }
          }
        }
        
        // Keep non-image content as is
        updatedParagraphContent.push(item);
      });
      
      return {
        ...node,
        content: updatedParagraphContent,
      };
    }
    
    return node;
  });

  return {
    ...json,
    content: updatedContent,
  };
}

/**
 * Process content before submission: upload images and replace placeholders
 * @param html - HTML content from editor
 * @param json - JSON content from editor
 * @param pendingImages - Pending images to upload
 * @returns Processed content with uploaded images
 */
export async function processContentWithImages(
  html: string,
  json: any,
  pendingImages: PendingImage[]
): Promise<{ html: string; json: any }> {
  if (!pendingImages || pendingImages.length === 0) {
    return { html, json };
  }

  // Upload all images
  const uploadResults = await uploadPendingImages(pendingImages);

  // Replace placeholders
  const updatedHtml = replaceImagePlaceholders(html, uploadResults);
  const updatedJson = replaceImagePlaceholdersInJSON(json, uploadResults);

  return {
    html: updatedHtml,
    json: updatedJson,
  };
}
