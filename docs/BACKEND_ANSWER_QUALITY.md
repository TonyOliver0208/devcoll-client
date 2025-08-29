# Backend Answer Quality Control System

## Server-Side Validation (Express.js/Node.js)

```javascript
// Quality control middleware
const answerQualityMiddleware = async (req, res, next) => {
  const { contentJson, questionId } = req.body;
  const userId = req.user.id;
  
  // 1. Basic validation
  const htmlContent = generateHTML(contentJson, extensions);
  const textLength = htmlContent.replace(/<[^>]*>/g, '').trim().length;
  
  if (textLength < 30) {
    return res.status(400).json({
      error: 'Answer too short',
      message: 'Please provide at least 30 characters of explanation'
    });
  }
  
  // 2. Duplicate detection
  const existingAnswers = await Answer.findAll({
    where: { questionId, authorId: { [Op.ne]: userId } }
  });
  
  const similarity = checkContentSimilarity(htmlContent, existingAnswers);
  if (similarity > 0.8) {
    return res.status(400).json({
      error: 'Duplicate content detected',
      message: 'This answer appears very similar to an existing answer'
    });
  }
  
  // 3. Rate limiting
  const recentAnswers = await Answer.count({
    where: {
      authorId: userId,
      createdAt: { [Op.gte]: new Date(Date.now() - 60000) } // Last minute
    }
  });
  
  if (recentAnswers >= 3) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Please wait before posting another answer'
    });
  }
  
  // 4. Content filtering
  const hasProhibitedContent = detectProhibitedContent(htmlContent);
  if (hasProhibitedContent.violations.length > 0) {
    return res.status(400).json({
      error: 'Content violations detected',
      violations: hasProhibitedContent.violations
    });
  }
  
  next();
};

// Spam and low-quality detection
function detectProhibitedContent(content) {
  const violations = [];
  const lowerContent = content.toLowerCase();
  
  // Check for link spam
  const linkCount = (content.match(/https?:\/\/[^\s]+/g) || []).length;
  const contentLength = content.replace(/<[^>]*>/g, '').trim().length;
  if (linkCount > 2 && contentLength < 200) {
    violations.push('Excessive links with minimal explanation');
  }
  
  // Check for common spam patterns
  const spamPatterns = [
    /buy now|click here|visit our website|special offer/i,
    /\+\d{10,}/,  // Phone numbers
    /discount|sale|promo/i
  ];
  
  spamPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      violations.push('Promotional content detected');
    }
  });
  
  // Check for low-quality responses
  const lowQualityPatterns = [
    /^(thanks?|thx)[\s!.]*$/i,
    /^(me too|same problem)[\s!.]*$/i,
    /^(bump|anyone)[\s!?]*$/i
  ];
  
  if (lowQualityPatterns.some(pattern => pattern.test(content.trim()))) {
    violations.push('This appears to be a comment rather than an answer');
  }
  
  return { violations };
}

// Content similarity checker
function checkContentSimilarity(newContent, existingAnswers) {
  // Simple implementation - you'd use more sophisticated algorithms
  const newWords = newContent.toLowerCase().split(/\s+/);
  
  let maxSimilarity = 0;
  
  existingAnswers.forEach(answer => {
    const existingWords = answer.content.toLowerCase().split(/\s+/);
    const intersection = newWords.filter(word => existingWords.includes(word));
    const similarity = intersection.length / Math.max(newWords.length, existingWords.length);
    maxSimilarity = Math.max(maxSimilarity, similarity);
  });
  
  return maxSimilarity;
}
```

## Community Moderation Features

```javascript
// Auto-moderation system
const autoModerationRules = {
  lowQualityScore: 3,     // Scores below 3 get flagged
  minimumReputation: 15,  // New users get extra scrutiny
  
  actions: {
    shadowBan: false,     // Don't hide, but mark for review
    requireApproval: true, // Require mod approval for low-rep users
    communityReview: true  // Let community vote on quality
  }
};

// Post-submission processing
app.post('/api/answers', answerQualityMiddleware, async (req, res) => {
  const { questionId, contentJson } = req.body;
  const user = req.user;
  
  const answer = await Answer.create({
    questionId,
    contentJson,
    authorId: user.id,
    qualityScore: calculateQualityScore(contentJson),
    status: user.reputation > 15 ? 'published' : 'pending_review'
  });
  
  // Trigger community review for borderline content
  if (answer.qualityScore < 5) {
    await QueueForReview.create({
      answerId: answer.id,
      reason: 'Low quality score',
      priority: 'medium'
    });
  }
  
  res.json({ success: true, answerId: answer.id });
});
```

## Progressive Quality Enforcement

```javascript
// User reputation-based restrictions
const getAnswerLimits = (userReputation) => {
  if (userReputation < 15) {
    return {
      dailyLimit: 5,
      requiresApproval: true,
      minCharacters: 50,
      maxLinks: 1
    };
  } else if (userReputation < 50) {
    return {
      dailyLimit: 10,
      requiresApproval: false,
      minCharacters: 30,
      maxLinks: 3
    };
  } else {
    return {
      dailyLimit: 50,
      requiresApproval: false,
      minCharacters: 20,
      maxLinks: 5
    };
  }
};
```
