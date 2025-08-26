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
  rawContent?: string; // Raw markdown content for editing
  commentId?: number; // ID of created/updated comment
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
 * FRONTEND: Preview markdown formatting (client-side only)
 * This shows users what their comment will look like while typing
 * NOTE: This is for preview only - backend does the authoritative processing
 */
export function previewMarkdown(content: string): string {
  if (!content) return "";

  // Step 1: Escape HTML characters, but preserve markdown characters
  let result = content
    .replace(/&(?![a-zA-Z0-9#]+;)/g, "&amp;") // Escape & not part of entities
    .replace(/<(?!\/?[a-zA-Z])/g, "&lt;") // Escape < not part of tags
    .replace(/>(?!\/?[a-zA-Z])/g, "&gt;"); // Escape > not part of tags

  // Step 2: Handle mentions (@username)
  result = result.replace(/@(\w+)/g, '<span class="text-blue-600 bg-blue-50 px-1 rounded">@$1</span>');

  // Step 3: Handle inline code (`code`)
  result = result.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');

  // Step 4: Handle bold (**text**)
  result = result.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

  // Step 5: Handle italic (_text_)
  result = result.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // Step 6: Handle markdown links [text](url)
  result = result.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, 
    '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // Step 7: Handle bare URLs
  result = result.replace(/(^|\s)(https?:\/\/[^\s<>"]+)/g, 
    '$1<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$2</a>');

  // Step 8: Handle newlines
  result = result.replace(/\n/g, "<br>");

  return result;
}


/**
 * FRONTEND: Validate markdown syntax and content
 * Checks for common markdown issues before sending to backend
 */
export function validateMarkdown(content: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for unclosed bold
  const boldCount = (content.match(/\*\*/g) || []).length;
  if (boldCount % 2 !== 0) {
    issues.push('Unclosed **bold** formatting detected');
  }

  // Check for unclosed italic
  const italicCount = (content.match(/_/g) || []).length;
  if (italicCount % 2 !== 0) {
    issues.push('Unclosed _italic_ formatting detected');
  }

  // Check for unclosed code
  const codeCount = (content.match(/`/g) || []).length;
  if (codeCount % 2 !== 0) {
    issues.push('Unclosed `code` formatting detected');
  }

  // Check for malformed links
  const malformedLinks = content.match(/\[[^\]]*\]\([^\)]*$/g);
  if (malformedLinks) {
    issues.push('Incomplete link formatting detected');
  }

  // Check for invalid URLs in links
  const links = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
  if (links) {
    links.forEach(link => {
      const url = link.match(/\[([^\]]+)\]\(([^)]+)\)/)?.[2];
      if (url && !url.match(/^https?:\/\//)) {
        issues.push(`Invalid URL in link: ${url} (must start with http:// or https://)`);
      }
    });
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * BACKEND API: Submit comment for processing and storage
 * Sends raw markdown to backend, receives processed HTML back
 */
export async function submitComment(
  postId: number,
  rawContent: string,
  postType: 'question' | 'answer' = 'question'
): Promise<CommentProcessingResult> {
  // Frontend validation first
  const validation = validateComment(rawContent);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  // Validate markdown syntax
  const markdownValidation = validateMarkdown(rawContent);
  if (!markdownValidation.isValid) {
    return {
      success: false,
      errors: markdownValidation.issues
    };
  }

  try {
    // This is where the real API call will go when backend is ready
    // const response = await fetch('/api/comments', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     postId, 
    //     content: rawContent,  // Send raw markdown to backend
    //     postType 
    //   })
    // });
    // 
    // const result = await response.json();
    // 
    // Expected backend response:
    // {
    //   "id": 123,
    //   "rawContent": "Check out this **bold** text!",          // For editing later
    //   "processedContent": "<p>Check out this <strong>bold</strong> text!</p>", // For display
    //   "author": { "name": "UserName", "reputation": 1500 },
    //   "createdAt": "2025-08-26T10:30:00Z",
    //   "votes": 0
    // }
    
    // For now, simulate the backend processing
    console.log('Comment would be submitted to backend:', { 
      postId, 
      rawContent, 
      postType 
    });
    
    // Simulate backend processing and return
    const mockProcessedContent = previewMarkdown(rawContent); // Backend would do more secure processing
    
    return {
      success: true,
      processedContent: mockProcessedContent,
      rawContent: rawContent, // Backend would return this for future editing
      commentId: Math.floor(Math.random() * 1000) // Mock ID
    };
  } catch (error) {
    return {
      success: false,
      errors: ['Failed to submit comment. Please try again.']
    };
  }
}

/**
 * BACKEND API: Edit existing comment
 * Sends updated raw markdown, receives processed HTML back
 */
export async function editComment(
  commentId: number,
  rawContent: string
): Promise<CommentProcessingResult> {
  const validation = validateComment(rawContent);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  const markdownValidation = validateMarkdown(rawContent);
  if (!markdownValidation.isValid) {
    return {
      success: false,
      errors: markdownValidation.issues
    };
  }

  try {
    // Future API call to backend:
    // const response = await fetch(`/api/comments/${commentId}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content: rawContent }) // Send raw markdown
    // });
    // 
    // Backend processes the markdown and returns:
    // {
    //   "id": commentId,
    //   "rawContent": rawContent,
    //   "processedContent": "<processed HTML>",
    //   "updatedAt": "2025-08-26T10:35:00Z"
    // }

    console.log('Comment edit would be sent to backend:', { commentId, rawContent });

    return {
      success: true,
      processedContent: previewMarkdown(rawContent), // Mock processing
      rawContent: rawContent
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
