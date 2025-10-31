# Backend API Integration Guide

## Overview

This document describes the integration between the DevColl frontend (Next.js) and the DevColl backend (NestJS microservices).

**Status**: ✅ Mock data disabled, API integration active

**Last Updated**: October 31, 2025

---

## Configuration

### Environment Variables

Create `.env.local` in the frontend root:

```bash
# API Configuration
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production

# Google OAuth (must match backend)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Backend Configuration

The backend API Gateway runs on:
- **Port**: 4000
- **Base URL**: `http://localhost:4000`
- **API Prefix**: `/api/v1`
- **Full URL**: `http://localhost:4000/api/v1`

---

## API Mapping

### Terminology Mapping

The frontend uses **"Questions"** terminology (Stack Overflow style), while the backend uses **"Posts"** (social network style). The `api-client.ts` automatically handles this mapping.

| Frontend Concept | Backend Concept | Notes |
|-----------------|-----------------|-------|
| Questions | Posts | Posts are displayed as questions |
| Question Title | Post Content (first line) | Extracted from content |
| Question Content | Post Content | Full markdown content |
| Answers | Comments | Top-level comments are answers |
| Answer Comments | Nested Comments | Replies to answers |
| Votes | Likes | Upvotes map to likes |
| Tags | Not Implemented | Backend doesn't support tags yet |

---

## Endpoints Mapping

### 🟢 Implemented Endpoints

#### Posts/Questions

| Frontend API | Backend Endpoint | HTTP Method | Status |
|-------------|------------------|-------------|--------|
| `questionsApi.getQuestions()` | `/api/v1/posts/feed` | GET | ✅ |
| `questionsApi.getQuestion(id)` | `/api/v1/posts/:id` | GET | ✅ |
| `questionsApi.createQuestion()` | `/api/v1/posts` | POST | ✅ |
| `questionsApi.updateQuestion(id)` | `/api/v1/posts/:id` | PATCH | ✅ |
| `questionsApi.deleteQuestion(id)` | `/api/v1/posts/:id` | DELETE | ✅ |
| `questionsApi.voteQuestion(id, 'up')` | `/api/v1/posts/:id/like` | POST | ✅ |
| `questionsApi.voteQuestion(id, 'down')` | `/api/v1/posts/:id/like` | DELETE | ✅ |

#### Comments

| Frontend API | Backend Endpoint | HTTP Method | Status |
|-------------|------------------|-------------|--------|
| `commentsApi.getComments()` | `/api/v1/posts/:id/comments` | GET | ✅ |
| `commentsApi.createComment()` | `/api/v1/posts/:id/comments` | POST | ✅ |
| `commentsApi.deleteComment(id)` | `/api/v1/posts/comments/:id` | DELETE | ✅ |

#### Users

| Frontend API | Backend Endpoint | HTTP Method | Status |
|-------------|------------------|-------------|--------|
| `authApi.getProfile()` | `/api/v1/users/profile` | GET | ✅ |
| `authApi.updateProfile()` | `/api/v1/users/profile` | PUT | ✅ |
| `authApi.getUserById(id)` | `/api/v1/users/:id` | GET | ✅ |
| `authApi.getUsers()` | `/api/v1/users` | GET | ✅ |

#### Search

| Frontend API | Backend Endpoint | HTTP Method | Status |
|-------------|------------------|-------------|--------|
| `searchApi.search()` | `/api/v1/search/posts` | GET | ✅ |
| `searchApi.search()` (users) | `/api/v1/search/users` | GET | ✅ |

### 🔴 Not Implemented Yet

These features exist in the frontend but are not yet available in the backend:

| Feature | Status | Notes |
|---------|--------|-------|
| Tags System | ❌ | Backend doesn't have tags service |
| Search Suggestions | ❌ | Autocomplete not implemented |
| Advanced Filtering | ⚠️ | Backend doesn't support search/tags/sort params |
| Views Counter | ❌ | Backend doesn't track post views |
| Accepted Answers | ❌ | No accepted answer feature |
| Bounties | ❌ | No bounty system |
| User Reputation | ⚠️ | Partial - needs calculation logic |

---

## Data Transformation

### Post → Question Transformation

The `mapPostToQuestion()` function transforms backend post data to frontend question format:

```typescript
// Backend Response
{
  id: "uuid-string",
  userId: "user-uuid",
  content: "Question Title\n\nQuestion body content...",
  likesCount: 5,
  commentsCount: 3,
  visibility: "PUBLIC",
  createdAt: "2025-10-31T10:00:00Z",
  updatedAt: "2025-10-31T10:00:00Z"
}

// Frontend Format
{
  id: 123, // Parsed as integer
  title: "Question Title", // Extracted from content
  content: "Question body content...",
  votes: 5, // From likesCount
  answers: 3, // From commentsCount
  views: 0, // Not tracked yet
  tags: [], // Not available
  timeAgo: "2 hours ago",
  author: {
    id: "user-uuid",
    name: "User Name",
    reputation: 0,
    avatar: "avatar-url"
  },
  hasAcceptedAnswer: false,
  userVote: null,
  isBookmarked: false
}
```

---

## Authentication Flow

### JWT Token Flow

1. **Login**: User authenticates via NextAuth.js (Google OAuth or credentials)
2. **Token Storage**: NextAuth stores JWT token in session
3. **API Requests**: Frontend automatically adds `Authorization: Bearer <token>` header
4. **Backend Validation**: API Gateway validates JWT using `JwtAuthGuard`
5. **User Context**: Backend extracts user ID from token via `@CurrentUser()` decorator

### Token Management

- **Access Token**: Stored in NextAuth session
- **Expiration**: 15 minutes (configurable in backend)
- **Refresh**: Handled by NextAuth.js automatically
- **Storage**: HTTP-only cookies (secure)

---

## Error Handling

### API Error Response Format

```typescript
// Backend Error Response
{
  success: false,
  message: "Error message",
  error: "Detailed error",
  timestamp: "2025-10-31T10:00:00Z",
  requestId: "req-uuid"
}
```

### Frontend Error Handling

The `handleAPIError()` utility provides user-friendly error messages:

```typescript
try {
  await questionsApi.createQuestion(data)
} catch (error) {
  const message = handleAPIError(error)
  // Display message to user
}
```

### HTTP Status Codes

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| 200 | Success | Continue |
| 201 | Created | Show success message |
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show not found page |
| 429 | Rate Limited | Show retry message |
| 500 | Server Error | Show generic error |

---

## Testing

### Local Development Setup

1. **Start Backend Services**:
   ```bash
   cd devcoll-api/social-network-microservices
   docker-compose up -d  # Start databases
   npm run start:dev     # Start API Gateway
   ```

2. **Start Frontend**:
   ```bash
   cd devcoll-client
   npm run dev
   ```

3. **Access**:
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000/api/v1
   - API Docs: http://localhost:3000/api/docs

### Testing Endpoints

Use the Swagger documentation at `http://localhost:3000/api/docs` to test backend endpoints directly.

---

## Migration Checklist

- [x] Update API base URL configuration
- [x] Turn off mock data flag
- [x] Map questions API to posts endpoints
- [x] Add data transformation layer
- [x] Update authentication headers
- [x] Configure CORS on backend
- [x] Test all CRUD operations
- [ ] Handle missing features gracefully
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Test authentication flow
- [ ] Test real-time updates

---

## Known Limitations

1. **Tags**: Backend doesn't support tags yet - returns empty array
2. **Search Filters**: Backend doesn't support advanced filtering (tags, date range)
3. **Sorting**: Backend doesn't support custom sorting yet
4. **Views**: Backend doesn't track post views
5. **Reputation**: Backend doesn't calculate user reputation scores
6. **Accepted Answers**: No concept of accepted answers in backend
7. **Bounties**: No bounty system

---

## Future Enhancements

### Backend TODOs

- [ ] Implement tags service
- [ ] Add search filtering and sorting
- [ ] Add views counter
- [ ] Implement reputation system
- [ ] Add accepted answers feature
- [ ] Add bounty system
- [ ] Add real-time notifications (WebSocket)
- [ ] Add file upload for media

### Frontend TODOs

- [ ] Add fallback UI for missing features
- [ ] Improve error messages
- [ ] Add retry logic for failed requests
- [ ] Add optimistic updates
- [ ] Add offline support
- [ ] Add loading skeletons

---

## Support

For issues or questions:
1. Check backend API docs: http://localhost:3000/api/docs
2. Review backend logs for errors
3. Check browser console for frontend errors
4. Review this documentation

---

**Note**: This is a living document. Update it as the API evolves.
