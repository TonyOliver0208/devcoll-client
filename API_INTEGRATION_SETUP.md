# 🚀 API Integration Setup - Quick Start Guide

## ✅ Changes Made

Mock data has been **disabled** and the application is now configured to use the **actual backend API**.

### Updated Files

1. **`.env.local`** - Created with proper API configuration
2. **`src/config/data-source.ts`** - Mock data disabled, API URL updated
3. **`src/lib/api-client.ts`** - Updated endpoints to match backend
4. **`src/auth.ts`** - Updated API Gateway URL
5. **`docs/API_BACKEND_INTEGRATION.md`** - Complete integration documentation

---

## 🔧 Configuration Summary

### Frontend Configuration
- **URL**: `http://localhost:3001`
- **Mock Data**: ❌ Disabled (`NEXT_PUBLIC_USE_MOCK_DATA=false`)
- **API Target**: `http://localhost:4000/api/v1`

### Backend Configuration
- **API Gateway**: `http://localhost:4000`
- **API Prefix**: `/api/v1`
- **Full API URL**: `http://localhost:4000/api/v1`
- **Swagger Docs**: `http://localhost:4000/api/docs`

---

## 🎯 API Endpoint Mapping

### Questions ↔ Posts Mapping

The frontend uses "Questions" terminology, but the backend uses "Posts". The API client automatically handles this:

| Frontend | Backend | Endpoint |
|----------|---------|----------|
| Get Questions | Get Feed | `GET /api/v1/posts/feed` |
| Get Question | Get Post | `GET /api/v1/posts/:id` |
| Create Question | Create Post | `POST /api/v1/posts` |
| Update Question | Update Post | `PATCH /api/v1/posts/:id` |
| Delete Question | Delete Post | `DELETE /api/v1/posts/:id` |
| Vote Question | Like/Unlike Post | `POST/DELETE /api/v1/posts/:id/like` |

### Data Transformation

The API client automatically transforms:
- **Post content** → Question title (first line) + content
- **Likes count** → Votes
- **Comments count** → Answers count
- **Post timestamps** → Relative time (e.g., "2 hours ago")

---

## 🏃 How to Run

### 1. Start Backend Services

```bash
# Navigate to backend directory
cd devcoll-api/social-network-microservices

# Start databases (PostgreSQL, MongoDB, Redis, RabbitMQ)
docker-compose up -d

# Wait for databases to be ready (~10 seconds)
sleep 10

# Run database migrations
cd apps/auth-service && npx prisma migrate dev && cd ../..
cd apps/user-service && npx prisma migrate dev && cd ../..
cd apps/post-service && npx prisma migrate dev && cd ../..

# Start all microservices
npm run start:dev
```

The API Gateway will start on **port 3000**.

### 2. Start Frontend

```bash
# Navigate to frontend directory
cd devcoll-client

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The frontend will start on **port 3001**.

### 3. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:4000/api/v1
- **API Documentation**: http://localhost:4000/api/docs

---

## ✅ Verification Checklist

### Backend Verification

1. ✅ API Gateway running: `curl http://localhost:4000/api/v1/health`
2. ✅ Swagger docs accessible: Open `http://localhost:4000/api/docs`
3. ✅ Database connected: Check logs for "Database connected"
4. ✅ All services running: Check `docker ps` shows all containers

### Frontend Verification

1. ✅ Environment file exists: `.env.local` present
2. ✅ Mock data disabled: Check browser console (no mock data warnings)
3. ✅ API calls working: Open Network tab, see requests to `localhost:3000`
4. ✅ No CORS errors: Check console for CORS-related errors

---

## 🔍 Testing the Integration

### Test 1: View Questions/Posts

1. Navigate to http://localhost:3001
2. Open Browser DevTools → Network tab
3. You should see requests to `http://localhost:4000/api/v1/posts/feed`
4. Questions should load from the backend (not mock data)

### Test 2: Create a Question/Post

1. Click "Ask Question" button
2. Fill in the form
3. Submit
4. Check Network tab for `POST http://localhost:4000/api/v1/posts`
5. New post should appear in the feed

### Test 3: Vote on Question

1. Click upvote/downvote on any question
2. Check Network tab for `POST/DELETE http://localhost:4000/api/v1/posts/:id/like`
3. Vote count should update

### Test 4: Authentication

1. Click "Sign In"
2. Login with Google
3. Check Network tab for requests to `/api/v1/auth/google`
4. After login, you should have a JWT token in session

---

## 🐛 Troubleshooting

### Issue: Frontend can't connect to backend

**Symptoms**: 
- Network errors in console
- "Failed to fetch" errors
- Empty question feed

**Solutions**:
1. Check backend is running: `curl http://localhost:4000/api/v1/health`
2. Check backend logs for errors
3. Verify `.env.local` has correct `NEXT_PUBLIC_API_GATEWAY_URL`
4. Check CORS configuration in backend `main.ts`

### Issue: CORS errors

**Symptoms**:
- "Access-Control-Allow-Origin" errors in console
- Requests blocked by browser

**Solutions**:
1. Backend CORS is configured for `http://localhost:3001`
2. Make sure frontend runs on port 3001 (not 3000)
3. Check backend `.env` for `CORS_ORIGIN` setting

### Issue: Authentication not working

**Symptoms**:
- Login fails
- "401 Unauthorized" errors
- JWT token missing

**Solutions**:
1. Check Google OAuth credentials match in both `.env` files
2. Verify `NEXTAUTH_URL` is set to `http://localhost:3001`
3. Check backend auth service is running
4. Clear browser cookies and try again

### Issue: No data showing / Empty feed

**Symptoms**:
- Questions page is empty
- No API requests in Network tab
- Mock data still showing

**Solutions**:
1. Verify `NEXT_PUBLIC_USE_MOCK_DATA=false` in `.env.local`
2. Restart frontend after changing `.env.local`
3. Clear browser cache
4. Check if backend has any posts in database

### Issue: Backend database connection failed

**Symptoms**:
- Backend crashes on startup
- "Connection refused" errors
- Prisma errors in logs

**Solutions**:
1. Ensure Docker containers are running: `docker ps`
2. Check database URLs in backend `.env`
3. Run migrations: `npx prisma migrate dev`
4. Reset databases if needed: `docker-compose down -v && docker-compose up -d`

---

## 📊 Backend Database

### Create Test Data

You can use Prisma Studio to add test data:

```bash
cd devcoll-api/social-network-microservices

# For posts
cd apps/post-service
npx prisma studio

# For users
cd apps/user-service
npx prisma studio
```

Or use the API documentation at http://localhost:3000/api/docs to create posts directly.

---

## 🔄 Known Limitations

The following features are **not yet implemented** in the backend:

1. ❌ **Tags System** - Backend doesn't support tags
2. ❌ **Search Filtering** - Advanced filters not available
3. ❌ **Sorting Options** - Custom sorting not implemented
4. ❌ **Views Counter** - Post views not tracked
5. ❌ **Accepted Answers** - No accepted answer feature
6. ❌ **Bounties** - Bounty system not implemented
7. ❌ **User Reputation** - Reputation calculation missing

These features will fall back to default/empty values until backend support is added.

---

## 📚 Additional Documentation

- **Full Integration Guide**: `docs/API_BACKEND_INTEGRATION.md`
- **Backend API Spec**: Check Swagger at `http://localhost:4000/api/docs`
- **Authentication Flow**: `docs/AUTHENTICATION_IMPLEMENTATION.md`
- **Backend Architecture**: `../devcoll-api/social-network-microservices/ARCHITECTURE.md`

---

## 🆘 Getting Help

If you encounter issues:

1. Check backend logs in terminal
2. Check frontend browser console
3. Review Network tab for failed requests
4. Check Swagger docs for correct API format
5. Review `docs/API_BACKEND_INTEGRATION.md`
6. Check backend `.env` and frontend `.env.local` match

---

## ✨ Success!

If everything is working:
- ✅ Backend API Gateway running on port 4000
- ✅ Frontend running on port 3001
- ✅ Questions loading from backend (not mock data)
- ✅ Can create/edit/delete posts
- ✅ Can vote on posts
- ✅ Authentication working
- ✅ No CORS errors
- ✅ No console errors

**You're ready to develop!** 🎉

---

**Last Updated**: October 31, 2025
