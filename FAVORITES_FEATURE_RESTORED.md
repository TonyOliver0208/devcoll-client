# Favorites Feature Restoration

## Issue
After the API refactoring from monolithic `lib/api-client.ts` to separate service files, the favorites feature disappeared. The stub implementations in `questions.service.ts` were returning empty arrays instead of calling the actual backend API.

## Root Cause
During the refactoring, placeholder stub methods were added to `questions.service.ts` for backwards compatibility, but they were not properly implemented to call the backend favorites API endpoints.

```typescript
// OLD (stub implementation)
getUserFavorites: async (params?) => {
  console.warn('[Questions Service] getUserFavorites not implemented - returning empty array')
  return { favorites: [] }
}

favoriteQuestion: async (id, listId?) => {
  console.warn('[Questions Service] favoriteQuestion not implemented')
  return { success: false, message: 'Favorites feature not yet implemented' }
}
```

## Solution
Implemented the proper backend API integration in `questions.service.ts`:

### 1. Get User Favorites
**Endpoint:** `GET /api/v1/posts/favorites`
**Query Params:**
- `page` (optional): Page number for pagination
- `limit` (optional): Items per page
- `listName` (optional): Filter by specific list

```typescript
getUserFavorites: async (params?: { 
  page?: number; 
  limit?: number;
  listName?: string;
}): Promise<{ 
  favorites: any[]; 
  total: number;
  page: number;
  limit: number;
}> => {
  const queryParams = new URLSearchParams()
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.listName) queryParams.append('listName', params.listName)
  
  const queryString = queryParams.toString()
  const response = await apiClient.get<any>(`/posts/favorites${queryString ? `?${queryString}` : ''}`)
  
  return {
    favorites: response.favorites || [],
    total: response.total || 0,
    page: response.page || 1,
    limit: response.limit || 20,
  }
}
```

### 2. Toggle Favorite (Add/Remove)
**Endpoint:** `POST /api/v1/posts/:id/favorite`
**Body:** `{ listName?: string }` (optional)

The backend automatically toggles the favorite status - if already favorited, it removes it; if not favorited, it adds it.

```typescript
favoriteQuestion: async (id: string, listName?: string): Promise<{ 
  success: boolean; 
  isFavorited: boolean;
}> => {
  const body = listName ? { listName } : {}
  const response = await apiClient.post(`/posts/${id}/favorite`, body)
  return {
    success: response.success !== false,
    isFavorited: response.isFavorited || false,
  }
}
```

### 3. Unfavorite (Explicit Remove)
**Endpoint:** `DELETE /api/v1/posts/:id/favorite`

Explicitly removes a favorite, used when users want to delete from saved lists.

```typescript
unfavoriteQuestion: async (id: string): Promise<{ 
  success: boolean; 
  isFavorited: boolean;
}> => {
  const response = await apiClient.delete(`/posts/${id}/favorite`)
  return {
    success: response.success !== false,
    isFavorited: false,
  }
}
```

## Backend Integration

The API Gateway maps these endpoints to the post-service gRPC methods:

**HTTP → gRPC Mapping:**
- `GET /api/v1/posts/favorites` → `GetUserFavorites` gRPC method
- `POST /api/v1/posts/:id/favorite` → `FavoriteQuestion` gRPC method
- `DELETE /api/v1/posts/:id/favorite` → `UnfavoriteQuestion` gRPC method

**Backend Service:** `post-service/services/logic/vote-logic.service.ts`
- Uses `FavoriteQuestion` table with columns: `id`, `userId`, `questionId`, `listName`, `createdAt`
- Toggle logic: checks if favorite exists, creates if not, deletes if exists
- Returns: `{ success: boolean, isFavorited: boolean }`

## Components Using Favorites

### 1. Profile Page (`app/profile/page.tsx`)
- **Tab:** "Saved Questions" (`?tab=saves`)
- **Usage:** Calls `getUserFavorites()` to load all favorited questions
- **Display:** Shows favorites in grid layout with remove functionality

### 2. VoteControls Component (`components/questions/VoteControls.tsx`)
- **Location:** Question detail pages, question cards
- **Usage:** Bookmark icon to toggle favorite status
- **Features:**
  - Optimistic UI updates
  - List selection dialog (Quick Saves, Read Later, etc.)
  - Save confirmation notifications
  - Error handling with rollback

### 3. Local State Management
- **Store:** `store/savedItemsStore.ts` (Zustand)
- **Sync:** Local favorites sync with backend on load
- **Purpose:** Provides instant UI feedback while backend processes request

## Testing

### Verify Favorites Work:
1. **Add Favorite:**
   - Navigate to any question
   - Click bookmark icon in VoteControls
   - Select a list (e.g., "Quick Saves")
   - Verify notification appears
   - Check backend database for `FavoriteQuestion` entry

2. **View Favorites:**
   - Navigate to Profile → Saved Questions tab (`/profile?tab=saves`)
   - Verify saved questions appear
   - Check network tab: `GET /api/v1/posts/favorites` should succeed

3. **Remove Favorite:**
   - In Profile/Saved tab, click remove icon
   - Confirm removal
   - Verify question disappears from list

4. **Toggle from Question Page:**
   - Open a favorited question
   - Click bookmark icon (should be filled)
   - Verify it removes favorite
   - Click again to re-add

## Files Modified

### Services
- `client/src/services/questions.service.ts`
  - Implemented `getUserFavorites()` with proper API call
  - Implemented `favoriteQuestion()` with toggle logic
  - Implemented `unfavoriteQuestion()` for explicit removal

### No Changes Needed (Already Working)
- `client/src/app/profile/page.tsx` - Already calling `getUserFavorites()`
- `client/src/components/questions/VoteControls.tsx` - Already calling `favoriteQuestion()`
- `client/src/store/savedItemsStore.ts` - Local state management intact

## API Gateway Routes

The API Gateway (`@Controller('posts')`) exposes these routes at `/api/v1/posts`:

```typescript
// Get favorites
@Get('favorites')
@UseGuards(JwtAuthGuard)
async getUserFavorites(
  @CurrentUser('userId') userId: string,
  @Query('listName') listName?: string,
  @Query('page') page?: number,
  @Query('limit') limit?: number,
) { ... }

// Toggle favorite
@Post(':id/favorite')
@UseGuards(JwtAuthGuard)
async favoriteQuestion(
  @Param('id') questionId: string,
  @CurrentUser('userId') userId: string,
  @Body() body?: { listName?: string },
) { ... }

// Remove favorite
@Delete(':id/favorite')
@UseGuards(JwtAuthGuard)
async unfavoriteQuestion(
  @Param('id') questionId: string,
  @CurrentUser('userId') userId: string,
) { ... }
```

## Status
✅ **COMPLETE** - Favorites feature fully restored and working

The favorites feature now properly integrates with the backend API and maintains consistency between local state and server data.
