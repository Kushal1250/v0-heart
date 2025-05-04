# Google OAuth Setup Guide

This guide will help you set up Google OAuth for your deployed application.

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a name for your project and click "Create"
5. Select your new project from the project dropdown

## Step 2: Configure OAuth Consent Screen

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Select "External" as the user type (unless you have a Google Workspace organization)
3. Click "Create"
4. Fill in the required information:
   - App name: Your application name
   - User support email: Your email address
   - Developer contact information: Your email address
5. Click "Save and Continue"
6. Under "Scopes", click "Add or Remove Scopes"
7. Add the following scopes:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
8. Click "Save and Continue"
9. Under "Test users", you can add test users if you want to restrict access during testing
10. Click "Save and Continue"
11. Review your settings and click "Back to Dashboard"

## Step 3: Create OAuth Client ID

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Enter a name for your OAuth client
5. Under "Authorized JavaScript origins", add your application's domain:
   - For production: `https://your-app-domain.com`
   - For local development: `http://localhost:3000`
6. Under "Authorized redirect URIs", add:
   - For production: `https://your-app-domain.com/api/auth/google/callback`
   - For local development: `http://localhost:3000/api/auth/google/callback`
7. Click "Create"
8. A popup will show your client ID and client secret. Copy these values.

## Step 4: Add Environment Variables

Add the following environment variables to your application:

\`\`\`
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_APP_URL=https://your-app-domain.com
\`\`\`

For Vercel deployment:
1. Go to your project in the Vercel dashboard
2. Go to "Settings" > "Environment Variables"
3. Add the environment variables listed above
4. Click "Save"
5. Redeploy your application

## Step 5: Verify Configuration

1. Visit `/admin/oauth-status` on your deployed application
2. Verify that the client ID and client secret are configured
3. Check that the redirect URI matches what you configured in the Google Cloud Console
4. Click "Test Google Sign In" to test the authentication flow

## Troubleshooting

If you encounter the "Error 400: redirect_uri_mismatch" error:

1. Check that the redirect URI in your Google Cloud Console **exactly** matches the one shown in the OAuth status page
2. Make sure there are no typos, extra slashes, or other differences
3. If you've made changes to the Google Cloud Console, wait a few minutes for them to propagate
4. Clear your browser cookies and try again

## Moving to Production

When your application is ready for production:

1. In the Google Cloud Console, go to "APIs & Services" > "OAuth consent screen"
2. Click "Publish App" to make it available to all users
3. Update your environment variables with the production URLs
4. Make sure your production redirect URI is added to the Google Cloud Console
