# ✅ Mock Data Removal - Verification Checklist

## Changes Applied

All pages have been updated to use actual API instead of mock data when `NEXT_PUBLIC_USE_MOCK_DATA=false`.

### Updated Files

1. ✅ **`src/app/page.tsx`** (Home page)
   - Changed: `questions={mockQuestions}` 
   - To: `questions={USE_MOCK_DATA ? mockQuestions : undefined}`

2. ✅ **`src/app/questions/page.tsx`** (Questions list)
   - Already correct: `questions={USE_MOCK_DATA ? mockQuestions : undefined}`

3. ✅ **`src/app/questions/[id]/page.tsx`** (Individual question)
   - Changed from: Server component with mock data only
   - To: Client component with `useQuestion()` hook for API data

4. ✅ **`src/app/questions/tagged/[tag]/page.tsx`** (Tagged questions)
   - Added: API mode with note about backend tag support

5. ✅ **`src/components/shared/QuestionsContainer.tsx`**
   - Fixed: `shouldUseQuery` logic now checks for `undefined` explicitly
   - Changed: `!legacyQuestions || legacyQuestions.length === 0`
   - To: `legacyQuestions === undefined`

---

## How It Works

### Configuration Flag
```env
NEXT_PUBLIC_USE_MOCK_DATA=false  # Use API
NEXT_PUBLIC_USE_MOCK_DATA=true   # Use mock data
```

### Data Flow

#### When `USE_MOCK_DATA = false` (API Mode):
```
Page Component
    ↓
questions={undefined}
    ↓
QuestionsContainer
    ↓
shouldUseQuery = true
    ↓
useQuestions() hook
    ↓
React Query
    ↓
api-client.ts
    ↓
GET http://localhost:4000/api/v1/posts/feed
    ↓
Backend API
```

#### When `USE_MOCK_DATA = true` (Mock Mode):
```
Page Component
    ↓
questions={mockQuestions}
    ↓
QuestionsContainer
    ↓
shouldUseQuery = false
    ↓
Display mock data
```

---

## Verification Steps

### 1. Check Environment Variable
```bash
cd devcoll-client
cat .env.local | grep NEXT_PUBLIC_USE_MOCK_DATA
# Should show: NEXT_PUBLIC_USE_MOCK_DATA=false
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser DevTools
- Open: http://localhost:3001
- Press F12 to open DevTools
- Go to Network tab

### 4. Check API Requests

**Home Page** (`/`):
- Should see: `GET http://localhost:4000/api/v1/posts/feed`
- Status: 200 (if backend is running)
- Status: Failed (if backend is not running - expected)

**Questions Page** (`/questions`):
- Should see: `GET http://localhost:4000/api/v1/posts/feed`

**Individual Question** (`/questions/1`):
- Should see: `GET http://localhost:4000/api/v1/posts/1`

### 5. Check Console Logs
Open browser console and look for:
- ✅ `[API Request] GET /posts/feed`
- ✅ No mock data warnings
- ❌ Should NOT see "Using mock data" messages

---

## Expected Behavior

### With Backend Running (Port 3000)
- ✅ Questions load from API
- ✅ Can create new questions → posts
- ✅ Can vote on questions → like/unlike
- ✅ Can view individual questions
- ✅ Loading spinner appears while fetching
- ✅ Error message if API fails

### Without Backend (Backend Not Running)
- ⏳ Loading spinner appears
- ❌ Error message: "Oops! We're having trouble loading questions"
- 🔄 "Try Again" button to retry
- 🚫 Network error in DevTools

---

## Testing Checklist

Run through these tests:

### Test 1: Home Page
- [ ] Navigate to http://localhost:3001
- [ ] Open Network tab
- [ ] Verify API request to `/posts/feed`
- [ ] Check if questions render (if backend is up)
- [ ] Check loading state appears

### Test 2: Questions Page
- [ ] Navigate to http://localhost:3001/questions
- [ ] Verify API request to `/posts/feed`
- [ ] Check filters are working
- [ ] Verify question list renders

### Test 3: Individual Question
- [ ] Click on any question
- [ ] Verify API request to `/posts/{id}`
- [ ] Check question details render
- [ ] Verify loading state

### Test 4: Tagged Questions
- [ ] Navigate to http://localhost:3001/questions/tagged/javascript
- [ ] Verify API request (will show all posts since tags not supported yet)
- [ ] Check tag name displays in header

### Test 5: Error Handling
- [ ] Stop backend server
- [ ] Refresh page
- [ ] Verify error message appears
- [ ] Click "Try Again" button
- [ ] Verify retry request is sent

---

## Troubleshooting

### Issue: Still showing mock data

**Symptom**: Questions show mock data (IDs like 1, 2, 3) instead of API data (UUID format)

**Solution**:
1. Check `.env.local`: `NEXT_PUBLIC_USE_MOCK_DATA=false`
2. Restart Next.js dev server: `npm run dev`
3. Hard refresh browser: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
4. Clear browser cache

### Issue: No API requests in Network tab

**Symptom**: Network tab shows no requests to `localhost:3000`

**Solution**:
1. Verify `.env.local` exists and has correct values
2. Restart dev server after changing `.env.local`
3. Check browser console for JavaScript errors
4. Verify `USE_MOCK_DATA` is imported correctly in pages

### Issue: API request fails (401 Unauthorized)

**Symptom**: API returns 401 status

**Solution**:
1. User needs to be logged in for protected endpoints
2. Check if JWT token is in request headers
3. Login with Google OAuth first
4. Check NextAuth configuration

### Issue: API request fails (404 Not Found)

**Symptom**: API returns 404 status

**Solution**:
1. Verify backend is running on port 3000
2. Check API Gateway URL: `http://localhost:3000/api/v1`
3. Test endpoint with curl: `curl http://localhost:3000/api/v1/health`
4. Check backend logs for errors

---

## Quick Debug Commands

### Check if backend is running
```bash
curl http://localhost:4000/api/v1/health
```

### Test posts endpoint
```bash
curl -X GET "http://localhost:4000/api/v1/posts/feed?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check environment variable in runtime
Open browser console and run:
```javascript
console.log('Mock data enabled:', process.env.NEXT_PUBLIC_USE_MOCK_DATA)
```

---

## Success Indicators

When everything is working correctly, you should see:

### Browser Console
```
[API Request] GET /posts/feed { attempt: 1, url: 'http://localhost:3000/api/v1/posts/feed', hasToken: true }
[API Response] 200 /posts/feed { success: true, message: 'Success', hasData: true }
```

### Network Tab
```
Request URL: http://localhost:4000/api/v1/posts/feed?page=1&limit=20
Request Method: GET
Status Code: 200 OK
Response Headers:
  - Content-Type: application/json
  - access-control-allow-origin: http://localhost:3001
```

### UI
- ✅ Loading spinner appears briefly
- ✅ Questions render with proper data
- ✅ Vote counts update in real-time
- ✅ Can interact with questions (vote, comment)
- ✅ No mock data IDs (1, 2, 3) - should be UUIDs
- ✅ Timestamps show real backend data

---

## Rollback Instructions

If you need to switch back to mock data temporarily:

1. Edit `.env.local`:
   ```env
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

2. Restart dev server:
   ```bash
   npm run dev
   ```

3. Refresh browser

---

**Status**: ✅ Configuration Complete

**Next Steps**: 
1. Start backend server
2. Test all pages
3. Verify API integration works end-to-end

**Last Updated**: October 31, 2025
