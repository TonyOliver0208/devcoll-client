// Comment processing utilities for frontend validation and future API integration

export interface CommentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  characterCount: number;
}

export interface CommentProcessingResult {
  success: boolean;
  processedContent?: string;
  errors?: string[];
}

/**
 * Frontend validation for comments
 * This runs before sending to backend
 */
export function validateComment(content: string): CommentValidation {
  const trimmed = content.trim();
  const errors: string[] = [];
  const warnings: string[] = [];

  // Length validation
  if (trimmed.length < 15) {
    errors.push(`Comment must be at least 15 characters (currently ${trimmed.length})`);
  }

  if (trimmed.length > 600) {
    errors.push(`Comment cannot exceed 600 characters (currently ${trimmed.length})`);
  }

  // Content quality checks
  if (trimmed.toLowerCase().includes('thank you')) {
    warnings.push('Consider if this adds value - "thank you" comments may be removed');
  }

  if (trimmed.split(' ').length < 3) {
    warnings.push('Very short comments may not provide enough context');
  }

  // Basic spam detection
  const wordCount = trimmed.split(' ').length;
  const uniqueWords = new Set(trimmed.toLowerCase().split(' ')).size;
  if (wordCount > 5 && uniqueWords / wordCount < 0.5) {
    warnings.push('Comment appears repetitive');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    characterCount: trimmed.length
  };
}

/**
 * Preview markdown formatting
 * This shows users what their comment will look like
 */
export function previewMarkdown(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800" target="_blank" rel="noopener noreferrer">$1</a>');
}

/**
 * Future API integration functions
 * These will be implemented when backend is ready
 */

export async function submitComment(
  postId: number,
  content: string,
  postType: 'question' | 'answer' = 'question'
): Promise<CommentProcessingResult> {
  // Validate first
  const validation = validateComment(content);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  try {
    // Future API call will go here
    // const response = await fetch('/api/comments', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ postId, content, postType })
    // });
    
    // For now, simulate success
    console.log('Comment would be submitted:', { postId, content, postType });
    
    return {
      success: true,
      processedContent: content // Backend will return processed/sanitized content
    };
  } catch (error) {
    return {
      success: false,
      errors: ['Failed to submit comment. Please try again.']
    };
  }
}

export async function editComment(
  commentId: number,
  content: string
): Promise<CommentProcessingResult> {
  const validation = validateComment(content);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  try {
    // Future API call
    // const response = await fetch(`/api/comments/${commentId}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content })
    // });

    console.log('Comment would be edited:', { commentId, content });

    return {
      success: true,
      processedContent: content
    };
  } catch (error) {
    return {
      success: false,
      errors: ['Failed to update comment. Please try again.']
    };
  }
}

export async function deleteComment(commentId: number): Promise<CommentProcessingResult> {
  try {
    // Future API call
    // const response = await fetch(`/api/comments/${commentId}`, {
    //   method: 'DELETE'
    // });

    console.log('Comment would be deleted:', commentId);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      errors: ['Failed to delete comment. Please try again.']
    };
  }
}
