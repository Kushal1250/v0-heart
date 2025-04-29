# SMS Verification Troubleshooting Guide

This guide will help you diagnose and fix common issues with the SMS verification system.

## Common Issues and Solutions

### "Failed to send verification code via SMS" message

#### Possible causes:
- Missing or incorrect Twilio credentials
- Network connectivity issues
- Invalid phone number format
- Insufficient Twilio credits
- Trial account limitations

#### Solutions:
1. Check that all required environment variables are set:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
2. Verify your Twilio credentials in the Twilio dashboard
3. Ensure your Twilio account has sufficient credits
4. For trial accounts, verify the recipient's phone number in the Twilio console
5. Check that your Twilio phone number is capable of sending SMS

### Invalid phone number format errors

#### Possible causes:
- Phone number missing country code
- Phone number contains invalid characters
- Phone number too short or too long

#### Solutions:
1. Ensure phone numbers are in E.164 format (+1XXXXXXXXXX)
2. Remove any special characters (except the leading +)
3. Include the country code (e.g., +1 for US numbers)

### Twilio-specific error codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| 21211 | Invalid phone number | Check the phone number format |
| 21214 | Not a mobile number | Use a mobile phone number |
| 21608 | Cannot receive SMS | Try a different phone number |
| 21610 | Blocked number | Contact Twilio support |
| 21612 | Number not reachable | Try a different phone number |
| 21614 | Unverified number (trial accounts) | Verify the number in Twilio console |
| 20003 | Authentication error | Check your Twilio credentials |

## Diagnostic Tools

### Admin SMS Diagnostics Page

Visit `/admin/sms-diagnostics` to access the SMS diagnostics page. This page provides tools to:
- Check SMS configuration
- Test SMS functionality
- View detailed error information

### SMS Test Tool

The SMS test tool allows you to send a test message to any phone number. It provides detailed error information if the message fails to send.

## Deployment Considerations

### Vercel Deployment

When deploying to Vercel:
1. Ensure all environment variables are set in the Vercel project settings
2. Use the "Preview Environment Variables" feature to set variables for preview deployments

### Local Development

In development mode, SMS messages are simulated and logged to the console. To test actual SMS delivery:
1. Set all required environment variables in your `.env.local` file
2. Use the diagnostics page to send test messages

## Getting Help

If you're still experiencing issues after following this guide:
1. Check the error details from the diagnostics page
2. Look for the corresponding error code in the Twilio documentation
3. Contact support with the error details and any relevant information
