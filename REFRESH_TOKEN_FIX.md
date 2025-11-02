# Refresh Token Issue - Quick Fix

## Problem
Your refresh token is invalid/expired, causing continuous 401 errors when trying to refresh access tokens.

## Immediate Solution

1. **Clear your browser cookies/session:**
   - Open DevTools (F12)
   - Go to Application tab → Cookies
   - Delete all cookies for localhost:3000
   - OR use incognito/private browsing

2. **Sign in again** to get fresh tokens

## Why This Happened
- Old session with expired/invalid refresh token is persisted
- Backend is rejecting the refresh token (401 "Invalid refresh token")
- Session keeps trying to use the bad token

## Prevention
The code fix below will automatically handle this by signing out users when refresh fails.
