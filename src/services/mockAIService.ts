/**
 * Mock AI Service
 * 
 * Mock implementation of AI-powered question analysis.
 * In production, this should call a real AI service like Google Gemini.
 * 
 * @author DevColl Team
 * @version 2.0.0
 */

export interface TagSuggestion {
  name: string;
  confidence: number;
  usage_count: number;
}

export interface AISuggestion {
  improvements: string[];
  tags: TagSuggestion[];
  quality_score: number;
  missing_elements: string[];
}

/**
 * Mock AI Service for question analysis
 * TODO: Replace with real AI service integration (Google Gemini, OpenAI, etc.)
 */
export class MockAIService {
  /**
   * Analyze a question and provide AI suggestions
   * @param title - Question title
   * @param content - Question content/description
   * @returns AI-powered suggestions for improvement
   */
  static async analyzeQuestion(title: string, content: string): Promise<AISuggestion> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock analysis based on content
    const improvements: string[] = [];
    const tags: TagSuggestion[] = [];
    const missing_elements: string[] = [];
    let quality_score = 70;

    // Analyze title
    if (!title || title.length < 10) {
      improvements.push('Your title is too short. Consider making it more descriptive (at least 15 characters).');
      quality_score -= 10;
    }

    if (title && !title.includes('?') && !title.toLowerCase().includes('how') && !title.toLowerCase().includes('what')) {
      improvements.push('Consider phrasing your title as a question for better engagement.');
    }

    // Analyze content
    if (!content || content.length < 50) {
      improvements.push('Your question needs more detail. Explain your problem clearly with context.');
      missing_elements.push('Detailed problem description');
      quality_score -= 15;
    }

    if (content && !content.toLowerCase().includes('tried')) {
      improvements.push('Mention what you have already tried to solve this problem.');
      missing_elements.push('What you have tried');
      quality_score -= 5;
    }

    if (content && !content.toLowerCase().includes('error') && !content.toLowerCase().includes('expected')) {
      missing_elements.push('Expected vs actual behavior');
    }

    // Suggest tags based on content keywords
    const contentLower = (title + ' ' + content).toLowerCase();
    
    const tagMapping: { [key: string]: string[] } = {
      'javascript': ['javascript', 'js', 'ecmascript'],
      'typescript': ['typescript', 'ts'],
      'react': ['react', 'reactjs', 'react.js'],
      'nextjs': ['next', 'nextjs', 'next.js'],
      'node': ['node', 'nodejs', 'node.js'],
      'python': ['python', 'py'],
      'database': ['database', 'db', 'sql'],
      'api': ['api', 'rest', 'graphql'],
      'css': ['css', 'styling', 'styles'],
      'html': ['html', 'markup'],
    };

    for (const [tag, keywords] of Object.entries(tagMapping)) {
      if (keywords.some(keyword => contentLower.includes(keyword))) {
        tags.push({
          name: tag,
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
          usage_count: Math.floor(Math.random() * 10000) + 1000,
        });
      }
    }

    // Sort tags by confidence
    tags.sort((a, b) => b.confidence - a.confidence);

    // Add quality boost for code examples
    if (content && (content.includes('```') || content.includes('<code>'))) {
      quality_score += 10;
    } else if (content && content.length > 100) {
      improvements.push('Consider adding code examples to illustrate your problem.');
    }

    // Ensure quality score is between 0-100
    quality_score = Math.max(0, Math.min(100, quality_score));

    return {
      improvements,
      tags: tags.slice(0, 5), // Top 5 tags
      quality_score,
      missing_elements,
    };
  }

  /**
   * Get tag suggestions based on partial input
   * @param title - Question title
   * @param content - Question content
   * @param partialTag - Partial tag input from user
   * @returns Suggested tags
   */
  static async suggestTags(
    title: string,
    content: string,
    partialTag?: string
  ): Promise<TagSuggestion[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get all suggestions first
    const analysis = await this.analyzeQuestion(title, content);
    
    // Filter by partial tag if provided
    if (partialTag) {
      return analysis.tags.filter(tag =>
        tag.name.toLowerCase().includes(partialTag.toLowerCase())
      );
    }

    return analysis.tags;
  }
}

// Export default instance
export default MockAIService;
