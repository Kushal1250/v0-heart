# Google OAuth Setup Guide

The error "Error 400: redirect_uri_mismatch" occurs when the redirect URI used by your application doesn't match any of the authorized redirect URIs configured in the Google Cloud Console.

## Step 1: Check Your Current Redirect URI

Your application is currently using this redirect URI:
\`\`\`
https://heartguide3.vercel.app/api/auth/google/callback
\`\`\`

## Step 2: Configure Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find and edit your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add the following URIs:
   - `https://heartguide3.vercel.app/api/auth/google/callback`
   - `https://heartguide2.vercel.app/api/auth/google/callback` (if you use this domain)
   - `https://heartguide.vercel.app/api/auth/google/callback` (if you use this domain)
   - `http://localhost:3000/api/auth/google/callback` (for local development)
6. Click "Save"

## Step 3: Verify Environment Variables

Make sure your environment variables are correctly set:

\`\`\`
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=https://heartguide3.vercel.app
\`\`\`

## Step 4: Important Notes

- The redirect URI is case-sensitive and must match exactly
- The protocol (http vs https) must match exactly
- Wait a few minutes after updating Google Cloud Console settings for changes to propagate
- Clear your browser cookies and try again
