# Rich Text Architecture for Microservice Backend

## Storage Strategy: Tiptap JSON Format

### Database Schema
```sql
CREATE TABLE answers (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content JSONB NOT NULL,  -- Store Tiptap JSON here
  content_html TEXT,       -- Cached sanitized HTML (optional)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for content search
CREATE INDEX idx_answers_content_gin ON answers USING gin(content);
```

### Example Tiptap JSON Storage
```json
{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "This is "
        },
        {
          "type": "text",
          "marks": [{"type": "bold"}],
          "text": "bold text"
        },
        {
          "type": "text",
          "text": " and this is "
        },
        {
          "type": "text",
          "marks": [{"type": "code"}],
          "text": "inline code"
        }
      ]
    },
    {
      "type": "codeBlock",
      "attrs": {"language": "javascript"},
      "content": [
        {
          "type": "text",
          "text": "const example = 'Hello World';"
        }
      ]
    },
    {
      "type": "bulletList",
      "content": [
        {
          "type": "listItem",
          "content": [
            {
              "type": "paragraph",
              "content": [
                {
                  "type": "text",
                  "text": "List item 1"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Security Considerations

### 1. Backend Content Validation
```javascript
// Express.js middleware example
const validateTiptapContent = (req, res, next) => {
  const { content } = req.body;
  
  // Validate JSON structure
  if (!content || typeof content !== 'object' || content.type !== 'doc') {
    return res.status(400).json({ error: 'Invalid content format' });
  }
  
  // Validate allowed node types
  const allowedNodeTypes = [
    'doc', 'paragraph', 'text', 'heading', 'codeBlock', 
    'bulletList', 'orderedList', 'listItem', 'blockquote'
  ];
  
  const allowedMarkTypes = [
    'bold', 'italic', 'code', 'link'
  ];
  
  if (!validateNodeTypes(content, allowedNodeTypes, allowedMarkTypes)) {
    return res.status(400).json({ error: 'Invalid content nodes' });
  }
  
  next();
};

// Recursive validation function
function validateNodeTypes(node, allowedNodes, allowedMarks) {
  if (!allowedNodes.includes(node.type)) {
    return false;
  }
  
  if (node.marks) {
    for (const mark of node.marks) {
      if (!allowedMarks.includes(mark.type)) {
        return false;
      }
    }
  }
  
  if (node.content) {
    for (const child of node.content) {
      if (!validateNodeTypes(child, allowedNodes, allowedMarks)) {
        return false;
      }
    }
  }
  
  return true;
}
```

### 2. HTML Generation on Backend (Optional Caching)
```javascript
// Convert Tiptap JSON to sanitized HTML
const { generateHTML } = require('@tiptap/html');
const { StarterKit } = require('@tiptap/starter-kit');
const DOMPurify = require('isomorphic-dompurify');

function generateSafeHTML(tiptapJSON) {
  const html = generateHTML(tiptapJSON, [
    StarterKit,
    // Include only extensions you allow
  ]);
  
  // Sanitize the HTML
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['class']
  });
}
```

## API Design

### Create/Update Answer
```http
POST /api/answers
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "questionId": 123,
  "content": {
    "type": "doc",
    "content": [...]  // Tiptap JSON
  }
}
```

### Response
```json
{
  "id": 456,
  "questionId": 123,
  "userId": 789,
  "content": {
    "type": "doc",
    "content": [...]
  },
  "contentHtml": "<p>Optional cached HTML</p>",  // Optional
  "createdAt": "2025-08-27T10:00:00Z",
  "updatedAt": "2025-08-27T10:00:00Z"
}
```

## Performance Considerations

1. **Caching**: Store sanitized HTML in `content_html` column for faster reads
2. **Indexing**: Use JSONB GIN index for content search
3. **CDN**: Cache static HTML responses for popular content
4. **Rate Limiting**: Prevent content spam/abuse

## Migration Strategy

1. Update frontend to send Tiptap JSON instead of HTML
2. Update backend to accept and validate JSON format  
3. Create new content renderer component for JSON
4. Migrate existing data from current format to JSON
