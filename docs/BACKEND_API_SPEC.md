# Microservice Backend API Integration Setup

## � **Project Structure & Conventions**

Following enterprise-level conventions for API service organization:

```
src/
├── services/           # 🔥 API Services Layer
│   ├── client.ts      # HTTP client configuration
│   ├── savedItems.ts  # Saved items service
│   └── mockAIService.ts
├── lib/               # Utilities & helpers
│   ├── utils.ts
│   ├── database/
│   ├── middleware/
│   └── validations/
├── store/             # State management (Zustand)
└── components/        # UI components
```

## 🛠️ **Environment Configuration**

Create `.env.local` file in your project root:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# 🚀 Backend Microservice Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
# Production: NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com

# Optional: External API Keys
OPENAI_API_KEY=your-openai-api-key-if-needed
```

## �🛠️ **Backend API Endpoints Your Microservice Must Implement**

### **Base URL**: `http://localhost:8080/api/v1` (or your production URL)

### **Required Endpoints**:

#### **Saved Lists Management**
```http
# Get all saved lists for a user
GET /api/v1/saved-lists
Headers: 
  - Authorization: Bearer {jwt_token}
  - X-User-ID: {user_id}

Response:
{
  "lists": [
    {
      "id": "list-uuid",
      "userId": "user-uuid",
      "name": "For later",
      "description": "Items saved for later reading",
      "isDefault": true,
      "itemCount": 5,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}

# Create a new saved list
POST /api/v1/saved-lists
Headers: 
  - Authorization: Bearer {jwt_token}
  - X-User-ID: {user_id}
Body:
{
  "name": "My Reading List",
  "description": "Articles to read later"
}

# Update a saved list
PUT /api/v1/saved-lists/{listId}
# Delete a saved list
DELETE /api/v1/saved-lists/{listId}

# Get items in a specific list
GET /api/v1/saved-lists/{listId}/items
```

#### **Saved Items Management**
```http
# Save a new item
POST /api/v1/saved-items
Headers: 
  - Authorization: Bearer {jwt_token}
  - X-User-ID: {user_id}
Body:
{
  "itemType": "question",
  "itemId": "79745814",
  "listId": "for-later",
  "title": "How to implement authentication?",
  "content": "Question content...",
  "tags": ["authentication", "nextjs"],
  "votes": 15,
  "views": "1.2k",
  "answers": 3,
  "author": {
    "id": "author-id",
    "name": "John Doe",
    "reputation": "2,534",
    "avatar": "https://avatar-url"
  },
  "url": "/questions/79745814"
}

# Get all saved items for user
GET /api/v1/saved-items

# Remove a saved item
DELETE /api/v1/saved-items/{itemId}

# Move item between lists
PUT /api/v1/saved-items/{itemId}/move
Body:
{
  "toListId": "new-list-id"
}
```

## 🔧 **Authentication & Authorization**

Your backend should:
1. **Validate JWT tokens** from the `Authorization` header
2. **Extract user ID** from the `X-User-ID` header or JWT payload
3. **Ensure data isolation** - users can only access their own saved items
4. **Return 401** for unauthorized requests
5. **Return 403** for forbidden access attempts

## 📊 **Database Schema Suggestions**

```sql
-- Saved Lists Table
CREATE TABLE saved_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_id (user_id)
);

-- Saved Items Table
CREATE TABLE saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  list_id UUID NOT NULL,
  item_type ENUM('question', 'answer') NOT NULL,
  item_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  tags JSON,
  votes INT DEFAULT 0,
  views VARCHAR(10) DEFAULT '0',
  answers INT DEFAULT 0,
  author_data JSON,
  url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (list_id) REFERENCES saved_lists(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_list_id (list_id),
  UNIQUE KEY unique_user_item (user_id, item_type, item_id)
);
```

## 🚀 **Setup Instructions**

### **Step 1: Environment Setup**
```bash
# 1. Copy environment variables
cp .env.local.example .env.local

# 2. Update with your values
# - Add your Google OAuth credentials
# - Set your backend API URL
# - Configure NextAuth secret
```

### **Step 2: Google OAuth Setup**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### **Step 3: Backend Integration**
1. **Deploy your microservice backend** with the required endpoints
2. **Update `.env.local`**: Set `NEXT_PUBLIC_API_BASE_URL` to your backend URL
3. **Test endpoints** match the specification above
4. **Frontend will automatically work!** No code changes needed ✅

## ✅ **Testing Your Integration**

1. **Start your backend service** on the configured port
2. **Start the frontend**: `npm run dev`
3. **Test the endpoints** with the expected request/response formats
4. **Frontend will automatically connect** to your backend

### **Development Testing**
```bash
# Test backend endpoints with curl
curl -X GET "http://localhost:8080/api/v1/saved-lists" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-User-ID: user-123"
```

## 📋 **Checklist for Integration**

- [ ] Environment variables configured in `.env.local`
- [ ] Google OAuth credentials set up
- [ ] Backend microservice deployed with required endpoints
- [ ] Database schema implemented
- [ ] JWT authentication working
- [ ] API endpoints return expected response formats
- [ ] CORS configured for your frontend domain
- [ ] Error handling implemented (401, 403, 500)
- [ ] Data validation on backend
- [ ] User data isolation enforced

## 🔄 **Migration from Mock to Real Backend**

No frontend changes needed! The service layer automatically handles the transition:

```typescript
// src/services/savedItems.ts - Already configured ✅
export class SavedItemsService {
  private readonly basePath = '/api/v1';  // Points to your backend
  
  async getSavedLists(): Promise<SavedList[]> {
    // Makes real API calls to your microservice
    const response = await apiClient.get(`${this.basePath}/saved-lists`);
    return response.data.lists || response.data;
  }
}
```

Your microservice backend is now ready to handle saved items functionality following enterprise-level conventions! 🚀
