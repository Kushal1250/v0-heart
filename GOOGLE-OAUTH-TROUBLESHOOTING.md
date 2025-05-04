# Google OAuth Troubleshooting Guide

## Fixing "Error 400: redirect_uri_mismatch"

This error occurs when the redirect URI used by your application doesn't match any of the authorized redirect URIs configured in your Google Cloud Console.

## Step 1: Identify the Exact Redirect URI Being Used

Visit `/api/auth/oauth-debug` on your deployed app to see the exact redirect URI being used.

The current redirect URI is:
\`\`\`
https://heart-disease-predictor.vercel.app/api/auth/google/callback
\`\`\`

## Step 2: Update Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find and edit your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add EXACTLY:
   \`\`\`
   https://heart-disease-predictor.vercel.app/api/auth/google/callback
   \`\`\`
6. Click "Save"
7. Wait a few minutes for changes to propagate

## Step 3: Common Mistakes to Avoid

- **Exact Match Required**: The URI must match EXACTLY (including http vs https, trailing slashes, etc.)
- **No Typos**: Check for typos in the domain name
- **Case Sensitivity**: URIs are case-sensitive
- **Multiple Domains**: If your app is accessible via multiple domains, add a redirect URI for each one
- **Local Development**: For local testing, also add `http://localhost:3000/api/auth/google/callback`

## Step 4: Verify Configuration

After updating the Google Cloud Console:
1. Wait a few minutes for changes to propagate
2. Clear your browser cookies
3. Try signing in again
4. Check server logs for any additional errors

## Step 5: Still Having Issues?

If you're still encountering the error:
1. Double-check that you've added the EXACT redirect URI to Google Cloud Console
2. Ensure you're using the correct Google Cloud project
3. Try creating a new OAuth 2.0 Client ID
4. Check if there are any restrictions on your Google Cloud project
\`\`\`

Let's create a simple test page to verify the OAuth configuration:
