# Google OAuth Setup Guide

## Fixing "Error 400: redirect_uri_mismatch"

This error occurs when the redirect URI used by your application doesn't match any of the authorized redirect URIs configured in your Google Cloud Console.

## Step 1: Check Your Environment Variables

Make sure you have these environment variables set correctly:

\`\`\`
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=https://your-deployed-app-url.vercel.app
\`\`\`

## Step 2: Configure Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find and edit your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add ALL of these URIs:
   - `https://your-deployed-app-url.vercel.app/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (for local development)
6. Click "Save"

## Step 3: Verify Configuration

1. Visit `/api/auth/oauth-debug` on your deployed app to see the current configuration
2. Make sure ALL the recommended redirect URIs from that endpoint are added to Google Cloud Console
3. The redirect URIs must match EXACTLY (including http vs https, trailing slashes, etc.)

## Step 4: Common Issues

- **Case sensitivity**: URIs are case-sensitive
- **Protocol mismatch**: http vs https must match exactly
- **Trailing slashes**: Must match exactly
- **Subdomain differences**: `www.example.com` is different from `example.com`
- **Changes take time**: After updating Google Cloud Console, changes may take a few minutes to propagate

## Step 5: Testing

After making these changes:
1. Clear your browser cookies
2. Try signing in again
3. Check server logs for any additional errors
