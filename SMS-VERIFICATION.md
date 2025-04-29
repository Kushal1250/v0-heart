# SMS Verification Feature

This document provides an overview of the SMS verification feature in HeartPredict.

## Overview

The SMS verification feature allows users to receive verification codes via SMS for:

- Password reset
- Account verification
- Two-factor authentication

## Technical Implementation

### Components

1. **Twilio Integration**: We use Twilio as our SMS service provider.
2. **Verification Codes Table**: Stores temporary verification codes in the database.
3. **SMS Utility Functions**: Handles sending SMS messages and phone number validation.
4. **API Endpoints**: For sending, verifying, and resending verification codes.

### Database Schema

The `verification_codes` table has the following structure:

\`\`\`sql
CREATE TABLE verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes')
)
\`\`\`

### Environment Variables

The following environment variables are required:

\`\`\`
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
\`\`\`

## User Flow

1. User initiates a password reset or account verification
2. User chooses SMS as the verification method
3. System generates a 6-digit code and sends it via SMS
4. User enters the code on the verification page
5. System verifies the code and allows the user to proceed

## Testing

You can test the SMS verification feature using the admin verification settings page:

1. Go to `/admin/verification-settings`
2. Check if SMS verification is properly configured
3. Send a test SMS to verify the configuration

## Troubleshooting

If SMS verification is not working:

1. Check if Twilio environment variables are correctly set
2. Verify that the phone number is in E.164 format (+1XXXXXXXXXX)
3. Check Twilio logs for any delivery issues
4. Ensure the verification_codes table exists in the database

## Security Considerations

- Verification codes expire after 15 minutes
- Codes are single-use and are deleted after verification
- The system uses rate limiting to prevent abuse
- Phone numbers are validated before sending SMS
\`\`\`

Let's update the user profile page to allow adding a phone number:
