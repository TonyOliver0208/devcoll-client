# Services Directory

This directory contains all API service modules for communicating with the backend microservices through the API Gateway.

## Architecture

The services follow a modular architecture where each domain has its own service file:

```
services/
├── base-service.ts          # Core API client with auth & retry logic
├── index.ts                 # Central export point
├── questions.service.ts     # Questions/Posts operations
├── answers.service.ts       # Answers operations
├── comments.service.ts      # Comments operations
├── tags.service.ts          # Tags operations
├── auth.service.ts          # User authentication & profiles
├── search.service.ts        # Search operations
├── media.ts                 # Media upload & management
└── savedItems.ts            # Saved items management
```

## Usage

### Import services from the index

```typescript
import { questionsService, answersService, authService } from '@/services'

// Use the service
const questions = await questionsService.getQuestions({ page: 1, limit: 10 })
```

### Available Services

#### **questionsService**
- `getQuestions(params?)` - Get all questions
- `getQuestion(id)` - Get single question
- `createQuestion(data)` - Create new question
- `updateQuestion(id, data)` - Update question
- `deleteQuestion(id)` - Delete question
- `voteQuestion(id, voteType)` - Vote on question

#### **answersService**
- `getAnswers(questionId)` - Get all answers for a question
- `createAnswer(questionId, data)` - Create new answer
- `updateAnswer(answerId, data)` - Update answer
- `deleteAnswer(answerId)` - Delete answer
- `voteAnswer(answerId, voteType)` - Vote on answer
- `acceptAnswer(answerId)` - Accept answer (author only)

#### **commentsService**
- `getComments(postId, params?)` - Get comments for question
- `getAnswerComments(answerId, params?)` - Get comments for answer
- `createComment(postId, data)` - Create comment on question
- `createAnswerComment(answerId, data)` - Create comment on answer
- `updateComment(commentId, data)` - Update comment
- `deleteComment(commentId)` - Delete comment

#### **tagsService**
- `getTags(params?)` - Get all tags
- `getPopularTags(limit?)` - Get popular tags
- `getPostsByTag(tagName, params?)` - Get posts by tag
- `createTag(data)` - Create new tag (admin)

#### **authService**
- `getProfile()` - Get current user profile
- `updateProfile(data)` - Update user profile
- `getUserById(userId)` - Get user by ID
- `getUsers(params?)` - Get list of users
- `getTopUsers(limit?)` - Get top users by reputation

#### **searchService**
- `search(query, filters?)` - Search posts/users
- `getSearchSuggestions(query)` - Get search suggestions (not implemented)

#### **Media Functions**
- `uploadImage(file)` - Upload single image
- `deleteImage(mediaId)` - Delete image
- `getMedia(mediaId)` - Get media details
- `getUserMedia(type?, page?, limit?)` - Get user's media

## Base Service Features

The `base-service.ts` provides:

- ✅ Automatic JWT authentication with token refresh
- ✅ Request/response interceptors
- ✅ Error handling with proper types
- ✅ Retry logic for failed requests
- ✅ Timeout handling
- ✅ TypeScript support

## Backward Compatibility

The old `lib/api-client.ts` file now re-exports from services for backward compatibility:

```typescript
// Old way (still works)
import { questionsApi } from '@/lib/api-client'

// New way (recommended)
import { questionsService } from '@/services'
```

## Error Handling

All services throw errors that can be caught and handled:

```typescript
import { questionsService, handleAPIError } from '@/services'

try {
  const question = await questionsService.getQuestion(id)
} catch (error) {
  const message = handleAPIError(error)
  console.error(message)
}
```

## Environment Configuration

Set the API Gateway URL in your `.env.local`:

```bash
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000/api/v1
```

## Contributing

When adding new services:

1. Create a new `[domain].service.ts` file
2. Import and use `apiClient` from `base-service.ts`
3. Export the service object with typed methods
4. Add exports to `index.ts`
5. Update this README with usage examples

## Migration from Old API Client

If you're updating code that uses the old API client:

```typescript
// Before
import { questionsApi } from '@/lib/api-client'
const questions = await questionsApi.getQuestions()

// After
import { questionsService } from '@/services'
const questions = await questionsService.getQuestions()
```

The API methods remain the same, only the import path changes.
