// Mock AI service for development - replace with real API calls later

export interface AISuggestion {
  improvements: string[];
  tags: TagSuggestion[];
  quality_score: number;
  missing_elements: string[];
}

export interface TagSuggestion {
  name: string;
  confidence: number;
  usage_count: number;
}

// Mock tag database
const mockTagDatabase = [
  { name: "javascript", category: "language", usage_count: 25000 },
  { name: "python", category: "language", usage_count: 22000 },
  { name: "node.js", category: "framework", usage_count: 15000 },
  { name: "react", category: "framework", usage_count: 18000 },
  { name: "html", category: "language", usage_count: 12000 },
  { name: "css", category: "language", usage_count: 11000 },
  { name: "sql", category: "database", usage_count: 9000 },
  { name: "database", category: "category", usage_count: 8500 },
  { name: "sequelize", category: "orm", usage_count: 8750 },
  { name: "postgresql", category: "database", usage_count: 6800 },
  { name: "mysql", category: "database", usage_count: 7200 },
  { name: "mongodb", category: "database", usage_count: 5900 },
  { name: "api", category: "category", usage_count: 7500 },
  { name: "typescript", category: "language", usage_count: 7000 },
  { name: "express", category: "framework", usage_count: 6500 },
  { name: "performance", category: "category", usage_count: 5400 },
  { name: "optimization", category: "category", usage_count: 4200 },
  { name: "debugging", category: "category", usage_count: 3800 },
  { name: "error-handling", category: "category", usage_count: 3500 },
  { name: "async-await", category: "concept", usage_count: 4100 }
];

// Mock AI responses based on keywords
const mockResponses: { [key: string]: AISuggestion } = {
  database: {
    improvements: [
      "Consider adding specific error messages you're encountering",
      "Include your current database configuration and connection details",
      "Specify which queries are slow and their execution times",
      "Add sample code showing your current implementation"
    ],
    tags: [
      { name: "database", confidence: 0.95, usage_count: 8500 },
      { name: "sql", confidence: 0.88, usage_count: 9000 },
      { name: "performance", confidence: 0.82, usage_count: 5400 },
      { name: "optimization", confidence: 0.75, usage_count: 4200 }
    ],
    quality_score: 75,
    missing_elements: ["error_messages", "code_examples", "expected_results"]
  },
  react: {
    improvements: [
      "Include the exact error message you're seeing",
      "Add your component code and relevant imports",
      "Specify which React version you're using",
      "Describe the expected vs actual behavior"
    ],
    tags: [
      { name: "react", confidence: 0.95, usage_count: 18000 },
      { name: "javascript", confidence: 0.90, usage_count: 25000 },
      { name: "hooks", confidence: 0.75, usage_count: 4800 },
      { name: "components", confidence: 0.70, usage_count: 3200 }
    ],
    quality_score: 80,
    missing_elements: ["error_messages", "code_examples"]
  },
  nodejs: {
    improvements: [
      "Include your Node.js version and package.json dependencies",
      "Add the complete error stack trace",
      "Show your server configuration and middleware setup",
      "Specify your development environment details"
    ],
    tags: [
      { name: "node.js", confidence: 0.95, usage_count: 15000 },
      { name: "javascript", confidence: 0.88, usage_count: 25000 },
      { name: "express", confidence: 0.75, usage_count: 6500 },
      { name: "api", confidence: 0.70, usage_count: 7500 }
    ],
    quality_score: 70,
    missing_elements: ["error_messages", "environment_details", "dependencies"]
  },
  css: {
    improvements: [
      "Add your current CSS code that isn't working",
      "Include the HTML structure you're trying to style",
      "Specify which browsers you've tested",
      "Describe the visual result you want to achieve"
    ],
    tags: [
      { name: "css", confidence: 0.95, usage_count: 11000 },
      { name: "html", confidence: 0.85, usage_count: 12000 },
      { name: "styling", confidence: 0.75, usage_count: 2800 },
      { name: "layout", confidence: 0.70, usage_count: 3100 }
    ],
    quality_score: 85,
    missing_elements: ["code_examples", "browser_testing"]
  }
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAIService {
  static async analyzeQuestion(title: string, description: string): Promise<AISuggestion> {
    // Simulate API delay
    await delay(1500 + Math.random() * 1000);

    const content = (title + " " + description).toLowerCase();
    
    // Determine which mock response to use based on content
    let responseKey = 'default';
    
    if (content.includes('database') || content.includes('sql') || content.includes('sequelize')) {
      responseKey = 'database';
    } else if (content.includes('react') || content.includes('component')) {
      responseKey = 'react';
    } else if (content.includes('node') || content.includes('express') || content.includes('server')) {
      responseKey = 'nodejs';
    } else if (content.includes('css') || content.includes('style') || content.includes('center')) {
      responseKey = 'css';
    }

    // Return mock response or generate dynamic response
    if (mockResponses[responseKey]) {
      return mockResponses[responseKey];
    }

    // Generate dynamic response for unknown content
    const suggestedTags = this.generateRelevantTags(content);
    
    return {
      improvements: [
        "Consider adding specific error messages you're encountering",
        "Include relevant code examples that demonstrate the issue",
        "Describe what you expected to happen vs. what actually happened",
        "Add details about your development environment and setup"
      ],
      tags: suggestedTags,
      quality_score: 65 + Math.floor(Math.random() * 20),
      missing_elements: ["code_examples", "error_messages", "expected_results"]
    };
  }

  static generateRelevantTags(content: string): TagSuggestion[] {
    const relevantTags: TagSuggestion[] = [];
    
    mockTagDatabase.forEach(tag => {
      if (content.includes(tag.name.toLowerCase()) || 
          content.includes(tag.name.replace('-', ' ').replace('.', ''))) {
        relevantTags.push({
          name: tag.name,
          confidence: 0.8 + Math.random() * 0.2,
          usage_count: tag.usage_count
        });
      }
    });

    // Add some general tags if no specific matches
    if (relevantTags.length === 0) {
      relevantTags.push(
        { name: "programming", confidence: 0.7, usage_count: 15000 },
        { name: "debugging", confidence: 0.6, usage_count: 3800 }
      );
    }

    // Sort by confidence and limit to 5
    return relevantTags
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  static async suggestTags(title: string, description: string, partialTag?: string): Promise<TagSuggestion[]> {
    await delay(300);

    const content = (title + " " + description).toLowerCase();
    let filteredTags = mockTagDatabase;

    // Filter by partial tag input if provided
    if (partialTag) {
      filteredTags = mockTagDatabase.filter(tag => 
        tag.name.toLowerCase().includes(partialTag.toLowerCase())
      );
    } else {
      // Generate contextual suggestions
      filteredTags = mockTagDatabase.filter(tag =>
        content.includes(tag.name.toLowerCase()) ||
        content.includes(tag.name.replace('-', ' ').replace('.', ''))
      );
    }

    return filteredTags
      .slice(0, 8)
      .map(tag => ({
        name: tag.name,
        confidence: 0.7 + Math.random() * 0.3,
        usage_count: tag.usage_count
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }
}
