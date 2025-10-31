# 🔧 Port Configuration Update

## Issue Resolved
Port 3000 was already in use by the frontend (Next.js), causing the backend API Gateway to fail with `EADDRINUSE` error.

## Solution
Changed backend API Gateway to use **port 4000** instead.

---

## Port Allocation

| Service | Port | URL |
|---------|------|-----|
| **Frontend (Next.js)** | 3000 | http://localhost:3000 |
| **Next.js Dev Server** | 3001 | http://localhost:3001 |
| **Backend API Gateway** | 4000 | http://localhost:4000 |
| **Swagger Docs** | 4000 | http://localhost:4000/api/docs |

### Microservices (gRPC - Internal)
| Service | Port |
|---------|------|
| Auth Service | 50051 |
| User Service | 50052 |
| Post Service | 50053 |
| Media Service | 50054 |
| Search Service | 50055 |

---

## Changes Made

### Backend Changes

#### File: `devcoll-api/social-network-microservices/.env`
```diff
- API_GATEWAY_PORT=3000
+ API_GATEWAY_PORT=4000

- CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:3001
+ CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:3001,http://localhost:4000
```

### Frontend Changes

#### File: `devcoll-client/.env.local`
```diff
- NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000/api/v1
+ NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000/api/v1

- NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
+ NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api/v1
```

#### File: `src/config/data-source.ts`
```diff
- apiBaseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000/api/v1'
+ apiBaseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'
```

#### File: `src/lib/api-client.ts`
```diff
- const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000/api/v1'
+ const API_BASE_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:4000/api/v1'
```

#### File: `src/auth.ts`
```diff
- const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:3000/api/v1";
+ const API_GATEWAY_URL = process.env.API_GATEWAY_URL || "http://localhost:4000/api/v1";
```

---

## Updated Documentation

All documentation files have been updated to reflect port 4000:
- ✅ `API_INTEGRATION_SETUP.md`
- ✅ `API_ENDPOINTS_REFERENCE.md`
- ✅ `docs/API_BACKEND_INTEGRATION.md`
- ✅ `MOCK_DATA_REMOVAL_VERIFICATION.md`

---

## How to Start

### 1. Start Backend (API Gateway on Port 4000)
```bash
cd devcoll-api/social-network-microservices
docker-compose up -d
npm run start:dev
```

Expected output:
```
🚀 API Gateway is running on: http://localhost:4000
📚 Swagger docs available at: http://localhost:4000/api/docs
```

### 2. Start Frontend (Port 3001)
```bash
cd devcoll-client
npm run dev
```

Expected output:
```
- Local:        http://localhost:3001
- Network:      http://192.168.x.x:3001
```

---

## Verification

### Test Backend API
```bash
curl http://localhost:4000/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T...",
  "uptime": 123
}
```

### Test Frontend to Backend Connection
1. Open http://localhost:3001 in browser
2. Open DevTools → Network tab
3. Look for requests to `http://localhost:4000/api/v1/posts/feed`
4. Should see Status: 200 OK

---

## Port Conflict Resolution

If you still get port conflicts:

### Check What's Using a Port
```bash
# Check port 4000
lsof -i :4000

# Check port 3001
lsof -i :3001
```

### Kill Process Using Port
```bash
# Kill process on port 4000
kill -9 $(lsof -t -i:4000)

# Kill process on port 3001
kill -9 $(lsof -t -i:3001)
```

### Alternative: Use Different Ports

If ports 4000/3001 are still in use, you can change to different ports:

**Backend** (`devcoll-api/.env`):
```env
API_GATEWAY_PORT=5000  # or any available port
```

**Frontend** (Next.js config or `.env.local`):
```env
PORT=3002  # or any available port
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:5000/api/v1
```

---

## Troubleshooting

### Issue: Backend won't start on port 4000

**Check if port is in use:**
```bash
lsof -i :4000
```

**Try a different port:**
Edit `.env`:
```env
API_GATEWAY_PORT=5000
```

Don't forget to update frontend `.env.local` too!

### Issue: Frontend can't reach backend

**Verify backend is running:**
```bash
curl http://localhost:4000/api/v1/health
```

**Check CORS configuration:**
Make sure `CORS_ORIGIN` in backend `.env` includes frontend URL:
```env
CORS_ORIGIN=http://localhost:3001
```

### Issue: 404 Not Found on API calls

**Check the full URL:**
- ✅ Correct: `http://localhost:4000/api/v1/posts/feed`
- ❌ Wrong: `http://localhost:3000/api/v1/posts/feed`
- ❌ Wrong: `http://localhost:4000/posts/feed` (missing /api/v1)

---

## Environment Variables Summary

### Backend (`.env`)
```env
API_GATEWAY_PORT=4000
API_GATEWAY_HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3001,http://localhost:4000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:4000/api/v1
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCK_DATA=false
```

---

## Quick Reference

**Backend API Endpoints:**
- Health Check: http://localhost:4000/api/v1/health
- Get Posts: http://localhost:4000/api/v1/posts/feed
- Swagger Docs: http://localhost:4000/api/docs

**Frontend:**
- App URL: http://localhost:3001
- Home: http://localhost:3001
- Questions: http://localhost:3001/questions

---

**Status**: ✅ Configuration Updated

**Tested**: Port conflict resolved, backend now runs on 4000

**Last Updated**: October 31, 2025
