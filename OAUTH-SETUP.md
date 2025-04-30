# OAuth Configuration Guide

This guide explains how to properly configure OAuth providers for the HeartPredict application.

## Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the following URLs to the "Authorized JavaScript origins":
   - `http://localhost:3000`
   - `https://heartguide3.vercel.app`
   - `https://heartguide2.vercel.app`
   - `https://heartguide.vercel.app`
7. Add the following URLs to the "Authorized redirect URIs":
   - `http://localhost:3000/api/auth/google/callback`
   - `https://heartguide3.vercel.app/api/auth/google/callback`
   - `https://heartguide2.vercel.app/api/auth/google/callback`
   - `https://heartguide.vercel.app/api/auth/google/callback`
8. Click "Create" and note your Client ID and Client Secret
9. Add these values to your environment variables:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

## Facebook OAuth Setup

1. Go to the [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Navigate to "Facebook Login" > "Settings"
4. Add the following URLs to the "Valid OAuth Redirect URIs":
   - `http://localhost:3000/api/auth/facebook/callback`
   - `https://heartguide3.vercel.app/api/auth/facebook/callback`
   - `https://heartguide2.vercel.app/api/auth/facebook/callback`
   - `https://heartguide.vercel.app/api/auth/facebook/callback`
5. Save changes
6. Get your App ID and App Secret from the app dashboard
7. Add these values to your environment variables:
   - `FACEBOOK_CLIENT_ID`
   - `FACEBOOK_CLIENT_SECRET`

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App" or select an existing app
3. Fill in the application details
4. For "Authorization callback URL", add one of the following:
   - `http://localhost:3000/api/auth/github/callback`
   - `https://heartguide3.vercel.app/api/auth/github/callback`
   - `https://heartguide2.vercel.app/api/auth/github/callback`
   - `https://heartguide.vercel.app/api/auth/github/callback`
5. Click "Register application"
6. Note your Client ID and generate a Client Secret
7. Add these values to your environment variables:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`

## Important Notes

1. **Exact Matching**: OAuth providers require exact matching of redirect URIs, including trailing slashes and protocol (http vs https)
2. **Multiple Environments**: If you deploy to multiple environments, you need to add all possible redirect URIs to each provider
3. **Error Debugging**: If you see "redirect_uri_mismatch" errors, double-check that the exact URI is listed in your provider settings
4. **Local Development**: For local development, make sure `http://localhost:3000` is included in your authorized origins and redirect URIs
