# 🔌 API Endpoints Quick Reference

## Base URLs

```
Backend API Gateway: http://localhost:4000/api/v1
Frontend: http://localhost:3001
Swagger Docs: http://localhost:4000/api/docs
```

---

## 📋 Posts (Questions)

### Get Feed (All Posts)
```http
GET /api/v1/posts/feed?page=1&limit=20
Authorization: Bearer {token}
```

**Response**:
```json
{
  "posts": [
    {
      "id": "uuid",
      "userId": "uuid",
      "content": "Post content",
      "likesCount": 5,
      "commentsCount": 3,
      "visibility": "PUBLIC",
      "createdAt": "2025-10-31T10:00:00Z",
      "updatedAt": "2025-10-31T10:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### Get Single Post
```http
GET /api/v1/posts/:id
Authorization: Bearer {token}
```

### Create Post
```http
POST /api/v1/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Post content here",
  "mediaUrls": ["https://example.com/image.jpg"],
  "visibility": "PUBLIC"
}
```

### Update Post
```http
PATCH /api/v1/posts/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Updated content",
  "visibility": "PUBLIC"
}
```

### Delete Post
```http
DELETE /api/v1/posts/:id
Authorization: Bearer {token}
```

### Like Post (Vote Up)
```http
POST /api/v1/posts/:id/like
Authorization: Bearer {token}
```

### Unlike Post (Vote Down)
```http
DELETE /api/v1/posts/:id/like
Authorization: Bearer {token}
```

---

## 💬 Comments (Answers)

### Get Comments
```http
GET /api/v1/posts/:postId/comments?page=1&limit=20
Authorization: Bearer {token}
```

### Create Comment
```http
POST /api/v1/posts/:postId/comments
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Comment content",
  "parentId": "optional-parent-comment-id"
}
```

### Delete Comment
```http
DELETE /api/v1/posts/comments/:id
Authorization: Bearer {token}
```

---

## 👤 Users

### Get Current User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "username": "username",
  "picture": "https://example.com/avatar.jpg",
  "bio": "User bio",
  "createdAt": "2025-10-31T10:00:00Z"
}
```

### Update Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Name",
  "username": "newusername",
  "bio": "New bio",
  "picture": "https://example.com/new-avatar.jpg"
}
```

### Get User by ID
```http
GET /api/v1/users/:id
Authorization: Bearer {token}
```

### Get Users List
```http
GET /api/v1/users?page=1&limit=20&search=john
Authorization: Bearer {token}
```

---

## 🔐 Authentication

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 900,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name"
    }
  }
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Google OAuth
```http
POST /api/v1/auth/google
Content-Type: application/json

{
  "token": "google-id-token",
  "tokenType": "id_token"
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

---

## 🔍 Search

### Search Posts
```http
GET /api/v1/search/posts?query=javascript&page=1&limit=20
Authorization: Bearer {token}
```

### Search Users
```http
GET /api/v1/search/users?query=john&page=1&limit=20
Authorization: Bearer {token}
```

---

## 📁 Media

### Upload Media
```http
POST /api/v1/media/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <binary-file-data>
```

**Response**:
```json
{
  "url": "https://cloudinary.com/uploaded-file.jpg",
  "publicId": "file-public-id",
  "format": "jpg",
  "resourceType": "image"
}
```

---

## 🏥 Health Check

### API Gateway Health
```http
GET /api/v1/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T10:00:00Z",
  "uptime": 123456,
  "services": {
    "auth": "healthy",
    "user": "healthy",
    "post": "healthy",
    "media": "healthy",
    "search": "healthy"
  }
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2025-10-31T10:00:00Z",
  "requestId": "uuid"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error description",
  "timestamp": "2025-10-31T10:00:00Z",
  "requestId": "uuid"
}
```

---

## 🔑 Authentication Headers

All protected endpoints require JWT authentication:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📝 Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

### Sorting
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`

### Filtering
- `search`: Search query string
- `tags`: Array of tag names (not implemented yet)
- `dateRange`: Date range filter (not implemented yet)

---

## ⚠️ Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Success |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily down |

---

## 🧪 Testing with cURL

### Get Feed
```bash
curl -X GET "http://localhost:3000/api/v1/posts/feed?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Post
```bash
curl -X POST "http://localhost:3000/api/v1/posts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "My first post!",
    "visibility": "PUBLIC"
  }'
```

### Like Post
```bash
curl -X POST "http://localhost:3000/api/v1/posts/POST_ID/like" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🌐 Frontend Integration

### Using API Client
```typescript
import { questionsApi } from '@/lib/api-client'

// Get questions (maps to posts/feed)
const questions = await questionsApi.getQuestions({ page: 1, limit: 20 })

// Create question (maps to posts)
const newQuestion = await questionsApi.createQuestion({
  title: 'Question title',
  content: 'Question content',
  tags: ['javascript', 'react']
})

// Vote on question (maps to like/unlike)
await questionsApi.voteQuestion('post-id', 'up')
```

---

## 📚 Additional Resources

- **Swagger UI**: http://localhost:3000/api/docs
- **Integration Guide**: `docs/API_BACKEND_INTEGRATION.md`
- **Setup Guide**: `API_INTEGRATION_SETUP.md`
- **Changes Summary**: `CHANGES_SUMMARY.md`

---

**Last Updated**: October 31, 2025
