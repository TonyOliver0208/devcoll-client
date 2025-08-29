// Answer Quality Rules & Validation
export const ANSWER_QUALITY_RULES = {
  minLength: 30,           // Minimum characters
  maxLength: 30000,        // Maximum characters  
  minWords: 10,           // Minimum word count
  requiredElements: {
    codeExample: false,    // Not required but encouraged for technical questions
    explanation: true,     // Must explain the solution
    sources: false         // Optional but encouraged
  },
  
  // Content restrictions
  prohibited: {
    duplicateContent: true,     // No copy-paste from other answers
    linkOnlyAnswers: true,      // Must have substantial content beyond links
    thanksOnlyReplies: true,    // "Thanks!" is not an answer
    meTooPosts: true,           // "I have same problem" posts
    requestsForClarification: true, // Use comments for questions
    advertisingSpam: true,      // No promotional content
    offensiveContent: true      // No harassment, discrimination, etc.
  },

  // Quality indicators
  encouraged: {
    codeExamples: 'Include working code examples when applicable',
    stepByStep: 'Break down complex solutions into steps',
    explanation: 'Explain WHY your solution works, not just HOW',
    testing: 'Show how to test/verify the solution',
    alternatives: 'Mention alternative approaches when relevant',
    sources: 'Cite reliable sources and documentation'
  }
};

// Answer validation function
export const validateAnswerQuality = (content: string, contentJson: any) => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Basic length validation
  const textLength = content.replace(/<[^>]*>/g, '').trim().length;
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  
  if (textLength < ANSWER_QUALITY_RULES.minLength) {
    errors.push(`Answer is too short. Please provide at least ${ANSWER_QUALITY_RULES.minLength} characters of explanation.`);
  }
  
  if (wordCount < ANSWER_QUALITY_RULES.minWords) {
    errors.push(`Please provide a more detailed explanation (at least ${ANSWER_QUALITY_RULES.minWords} words).`);
  }
  
  // Content quality checks
  const lowerContent = content.toLowerCase();
  
  // Check for link-only answers
  const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
  const nonLinkContent = content.replace(/https?:\/\/[^\s]+/g, '').trim();
  if (linkCount > 0 && nonLinkContent.length < 100) {
    errors.push('Link-only answers are not allowed. Please explain the solution in your own words.');
  }
  
  // Check for common low-quality patterns
  const lowQualityPatterns = [
    /^(thanks?|thx|thank you)[\s!.]*$/i,
    /^(me too|same here|i have the same problem)[\s!.]*$/i,
    /^(bump|anyone\?)[\s!.]*$/i,
    /^(did you find.*(solution|answer))[\s!?]*$/i
  ];
  
  if (lowQualityPatterns.some(pattern => pattern.test(content.trim()))) {
    errors.push('This appears to be a comment rather than an answer. Use the comment section for clarifications.');
  }
  
  // Warnings for improvement
  if (!content.includes('```') && lowerContent.includes('code')) {
    warnings.push('Consider adding code examples to illustrate your solution.');
  }
  
  if (!lowerContent.includes('because') && !lowerContent.includes('reason')) {
    warnings.push('Explain WHY your solution works for better answer quality.');
  }
  
  return { errors, warnings, score: calculateQualityScore(content, contentJson) };
};

const calculateQualityScore = (content: string, contentJson: any): number => {
  let score = 0;
  
  // Base score for length
  const textLength = content.replace(/<[^>]*>/g, '').trim().length;
  score += Math.min(textLength / 200, 5); // Up to 5 points for length
  
  // Bonus for code examples
  if (content.includes('```')) score += 2;
  
  // Bonus for structured content (headers, lists)
  if (contentJson) {
    const hasStructure = JSON.stringify(contentJson).includes('"type":"heading"') ||
                        JSON.stringify(contentJson).includes('"type":"bulletList"');
    if (hasStructure) score += 1;
  }
  
  // Bonus for explanatory words
  const explanatoryWords = ['because', 'reason', 'explain', 'why', 'how', 'step'];
  const explanatoryCount = explanatoryWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  score += Math.min(explanatoryCount * 0.5, 2);
  
  return Math.min(score, 10); // Max score of 10
};
