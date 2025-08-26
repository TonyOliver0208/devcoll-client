# Comments API Specification for Backend Microservice

## Architecture Overview

**Frontend Responsibilities:**
- Live markdown preview (client-side only)
- Basic validation (length, syntax)
- User experience enhancements

**Backend Responsibilities:**
- Authoritative markdown processing
- HTML sanitization and security
- Data persistence
- User mention notifications
- Content moderation

## API Endpoints

### 1. Create Comment

```http
POST /api/comments
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "postId": 123,
  "postType": "question", // or "answer"
  "content": "Check out this **bold** text and `code` example! Also @john, what do you think about [this link](https://example.com)?"
}
```

**Backend Processing Steps:**
1. **Authentication**: Verify JWT token
2. **Validation**: 
   - Content length (15-600 characters)
   - Post exists and user can comment
   - Rate limiting check
3. **Markdown Processing**:
   - Parse markdown safely (use library like `marked` with DOMPurify)
   - Sanitize HTML output (prevent XSS)
   - Process user mentions (@username)
   - Validate and sanitize URLs
4. **Storage**: Save both raw and processed content
5. **Notifications**: Send notifications for mentions
6. **Response**: Return processed content

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "rawContent": "Check out this **bold** text and `code` example! Also @john, what do you think about [this link](https://example.com)?",
    "processedContent": "<p>Check out this <strong>bold</strong> text and <code>code</code> example! Also <a href=\"/users/john\" class=\"mention\">@john</a>, what do you think about <a href=\"https://example.com\" target=\"_blank\" rel=\"noopener noreferrer\">this link</a>?</p>",
    "author": {
      "id": 789,
      "name": "CurrentUser",
      "reputation": 1500,
      "avatar": "/avatars/789.jpg"
    },
    "createdAt": "2025-08-26T10:30:00Z",
    "votes": 0,
    "postId": 123,
    "postType": "question"
  }
}
```

### 2. Get Comments

```http
GET /api/comments?postId=123&postType=question&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 456,
        "processedContent": "<p>Processed HTML content here...</p>",
        "author": {...},
        "createdAt": "2025-08-26T10:30:00Z",
        "votes": 5,
        "isEdited": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "hasMore": true
    }
  }
}
```

### 3. Edit Comment

```http
PATCH /api/comments/456
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "content": "Updated **bold** content with new `code`!"
}
```

**Backend Processing:**
1. **Authorization**: User owns comment or has mod privileges
2. **Edit Window**: Check if within edit time limit
3. **Processing**: Same markdown processing as creation
4. **Storage**: Update both raw and processed content
5. **Audit**: Log edit history

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "rawContent": "Updated **bold** content with new `code`!",
    "processedContent": "<p>Updated <strong>bold</strong> content with new <code>code</code>!</p>",
    "updatedAt": "2025-08-26T10:35:00Z",
    "isEdited": true
  }
}
```

### 4. Vote on Comment

```http
POST /api/comments/456/vote
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "type": "up" // or "down" or "remove"
}
```

## Database Schema

### Comments Table
```sql
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL,
  post_type VARCHAR(20) NOT NULL, -- 'question' or 'answer'
  author_id BIGINT NOT NULL,
  raw_content TEXT NOT NULL,        -- Original markdown
  processed_content TEXT NOT NULL,  -- Sanitized HTML
  votes_up INTEGER DEFAULT 0,
  votes_down INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_edited BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  
  FOREIGN KEY (author_id) REFERENCES users(id),
  INDEX idx_post_comments (post_id, post_type),
  INDEX idx_author_comments (author_id)
);
```

### Comment Votes Table
```sql
CREATE TABLE comment_votes (
  id BIGSERIAL PRIMARY KEY,
  comment_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  vote_type VARCHAR(10) NOT NULL, -- 'up' or 'down'
  created_at TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (comment_id) REFERENCES comments(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_vote (comment_id, user_id)
);
```

## Security Considerations

### 1. Markdown Processing
```javascript
// Use a secure markdown processor
const marked = require('marked');
const DOMPurify = require('isomorphic-dompurify');

function processMarkdown(rawContent) {
  // Configure marked for security
  const renderer = new marked.Renderer();
  
  // Custom link renderer for security
  renderer.link = (href, title, text) => {
    // Only allow http/https links
    if (!href.match(/^https?:\/\//)) {
      return text;
    }
    return `<a href="${DOMPurify.sanitize(href)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  };
  
  // Process markdown
  const html = marked(rawContent, { renderer });
  
  // Sanitize HTML output
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'code', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });
}
```

### 2. User Mentions
```javascript
function processMentions(content, postId) {
  return content.replace(/@(\w+)/g, (match, username) => {
    // Verify user exists
    const user = getUserByUsername(username);
    if (user) {
      // Queue notification
      queueMentionNotification(user.id, postId);
      return `<a href="/users/${user.id}" class="mention">@${user.name}</a>`;
    }
    return match;
  });
}
```

## Frontend Integration

The frontend should:

1. **Store raw content** for editing
2. **Display processed content** for viewing
3. **Handle API errors** gracefully
4. **Update UI optimistically** for better UX

```typescript
// Example frontend integration
const CommentItem = ({ comment }: { comment: Comment }) => (
  <div className="comment">
    {/* Display processed HTML */}
    <div 
      dangerouslySetInnerHTML={{ __html: comment.processedContent }}
      className="comment-content"
    />
    
    {/* Edit button shows form with raw content */}
    {isEditing && (
      <textarea 
        value={comment.rawContent} // Edit the raw markdown
        onChange={handleEdit}
      />
    )}
  </div>
);
```

This architecture ensures:
- **Security**: Backend sanitizes all content
- **Performance**: Frontend shows instant previews
- **Consistency**: All clients see the same processed content
- **Flexibility**: Raw content preserved for editing
- **User Experience**: Real-time feedback while typing
