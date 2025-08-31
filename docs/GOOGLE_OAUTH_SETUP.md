# Google OAuth App Setup & Configuration Guide

## 🔧 Issue 1: Update Google OAuth App Configuration

### Step 1: Create New Google OAuth App (if needed)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your current project or create a new one
3. Navigate to **APIs & Services** > **Credentials**

### Step 2: Configure OAuth 2.0 Client ID
1. Click **"Create Credentials"** > **"OAuth client ID"**
2. Choose **"Web application"** as application type
3. Configure the following settings:

#### Application Details:
```
Name: DevColl Forum App (or your preferred name)
Application Type: Web application
```

#### Authorized JavaScript Origins:
```
http://localhost:3000
https://yourdomain.com (for production)
```

#### Authorized Redirect URIs:
```
http://localhost:3000/api/auth/callback/google
https://yourdomain.com/api/auth/callback/google (for production)
```

### Step 3: Update Environment Variables
After creating the new OAuth client, update your `.env.local` file:

```bash
# Replace with your new credentials
AUTH_SECRET="S5GQVEQSDfRFYBxpbg1G4G96VgcuIYPsfGP2kqdYE08="
AUTH_GOOGLE_ID="YOUR_NEW_GOOGLE_CLIENT_ID"
AUTH_GOOGLE_SECRET="YOUR_NEW_GOOGLE_CLIENT_SECRET"
```

### Step 4: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Fill in the required information:

```
App name: DevColl Forum
User support email: your-email@gmail.com
Developer contact information: your-email@gmail.com
```

3. Add scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`

4. Add test users (for development):
   - Add your Gmail accounts that you want to test with

## 🖼️ Issue 2: Image Configuration Error - FIXED ✅

I've updated your `next.config.ts` to include Google's image domain:

```typescript
images: {
  domains: [
    'res.cloudinary.com', 
    'img.freepik.com', 
    'lh3.googleusercontent.com' // Added for Google profile images
  ],
  remotePatterns: [
    // ... existing patterns
    {
      protocol: 'https',
      hostname: 'lh3.googleusercontent.com',
      pathname: '/**',
    },
  ],
}
```

## 🚀 Complete Setup Checklist

### ✅ Immediate Fixes Applied:
- [x] Added Google image domain to Next.js config
- [x] Added remote patterns for `lh3.googleusercontent.com`

### 📋 Action Items for You:
1. **Update Google OAuth Credentials**:
   - Create new OAuth client in Google Console
   - Copy new Client ID and Client Secret
   - Update `.env.local` with new credentials

2. **Configure OAuth Consent Screen**:
   - Set app name to "DevColl Forum" or similar
   - Add required contact information
   - Add necessary scopes

3. **Add Test Users** (for development):
   - Add your Gmail accounts to test users list

4. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## 🔍 Testing Instructions

### After completing the setup:

1. **Clear browser cache and cookies** for localhost:3000
2. **Restart your development server**
3. **Navigate to** `http://localhost:3000`
4. **Click "Log in" or "Sign up"**
5. **Select your Google account**
6. **Verify**:
   - No image configuration errors
   - Successful login redirect
   - User profile image displays correctly
   - Header shows user information

## 🐛 Troubleshooting

### If you still see the old app name:
- Clear browser cache completely
- Use incognito/private browsing mode
- Check that you're using the correct Client ID in `.env.local`

### If images still don't load:
- Restart the development server after changing `next.config.ts`
- Check browser developer tools for any remaining errors
- Verify the image URL format matches the configured pattern

### If OAuth still fails:
- Double-check redirect URIs match exactly
- Ensure OAuth consent screen is configured
- Verify test users are added (for development)

## 📞 Support

If you encounter any issues:
1. Check the browser developer console for errors
2. Verify all environment variables are set correctly
3. Ensure Google OAuth app settings match your domain/localhost
4. Test with incognito mode to rule out cache issues

The image configuration error is now fixed! You just need to update your Google OAuth credentials to point to your new app. 🎉
