# SMS Verification Troubleshooting Guide

This guide will help you diagnose and fix common issues with the SMS verification system.

## Common Issues and Solutions

### "An error occurred" message

This generic error usually means there's an issue with the server-side code. Check the server logs for more details.

#### Possible causes:
- Missing environment variables
- Invalid Twilio credentials
- Server-side code errors

#### Solutions:
1. Check that all required environment variables are set:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
2. Verify your Twilio credentials in the Twilio dashboard
3. Check server logs for detailed error messages

### SMS not being sent

#### Possible causes:
- Insufficient Twilio credits
- Phone number not verified (in trial accounts)
- Invalid phone number format
- Network connectivity issues

#### Solutions:
1. Check your Twilio account balance
2. In trial accounts, verify the recipient's phone number in the Twilio console
3. Ensure phone numbers are in E.164 format (+1XXXXXXXXXX)
4. Check network connectivity to Twilio's API

### "Module not found" errors

#### Possible causes:
- Server-only modules being imported in client components
- Missing 'use server' directive
- Incorrect import paths

#### Solutions:
1. Ensure all server-side code is properly marked with 'use server'
2. Use dynamic imports for server-only modules
3. Create client-safe versions of validation functions
4. Check import paths for typos

## Diagnostic Tools

### Admin Diagnostics Page

Visit `/admin/diagnostics` to access the diagnostics page. This page provides tools to:
- Check environment variables
- Test SMS functionality
- View detailed error information

### Environment Variable Check

The diagnostics page can verify if all required environment variables are set correctly without exposing their values.

### SMS Test Tool

The SMS test tool allows you to send a test message to any phone number. It provides detailed error information if the message fails to send.

## Deployment Considerations

### Vercel Deployment

When deploying to Vercel:
1. Ensure all environment variables are set in the Vercel project settings
2. Use the "Preview Environment Variables" feature to set variables for preview deployments
3. Check build logs for any errors related to server-only modules

### Local Development

In development mode, SMS messages are simulated and logged to the console. To test actual SMS delivery:
1. Set all required environment variables in your `.env.local` file
2. Use the diagnostics page to send test messages

## Getting Help

If you're still experiencing issues after following this guide:
1. Check the error ID from the diagnostics page
2. Look for the corresponding error details in the server logs
3. Contact support with the error ID and any relevant information
