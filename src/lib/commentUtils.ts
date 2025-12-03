// Comment processing utilities for frontend validation and future API integration

export interface CommentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  characterCount: number;
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

// NOTE: API functions (submitComment, editComment, deleteComment) have been moved to services/comments.service.ts
// This file now only contains validation and preview utilities used by the comment UI components
