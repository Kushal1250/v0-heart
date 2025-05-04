# Google OAuth Configuration Guide

## Fixing "Error 400: redirect_uri_mismatch"

This error occurs when the redirect URI used by your application doesn't match any of the authorized redirect URIs configured in your Google Cloud Console.

### Step 1: Check Current Redirect URIs

Make sure ALL of these URIs are added to your Google Cloud Console:

\`\`\`
https://heartgudie3.vercel.app/api/auth/google/callback
https://heartguide3.vercel.app/api/auth/google/callback
https://heart-disease-predictor.vercel.app/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
\`\`\`

Note: Pay special attention to the spelling of "heartgudie3" (with "gudie" not "guide").

### Step 2: Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find and edit your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add ALL the URIs listed above
6. Click "Save"

### Step 3: Verify Environment Variables

Ensure your .env.local or Vercel environment variables include:

\`\`\`
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=https://heartgudie3.vercel.app
\`\`\`

### Step 4: Testing

After making these changes:
1. Clear your browser cookies
2. Try signing in again
3. Check server logs for any additional errors
