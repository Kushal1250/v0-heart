# SMS Verification Feature

This document provides information about the SMS verification feature in the HeartPredict application.

## Overview

The SMS verification feature allows users to receive verification codes via SMS for account-related actions such as:

- Password reset
- Two-factor authentication
- Account verification

## Technical Implementation

### Dependencies

- **Twilio**: Used for sending SMS messages
- **Next.js Server Actions**: Used for server-side SMS sending logic

### Configuration

The following environment variables are required:

\`\`\`
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
\`\`\`

### Server-Side Implementation

The SMS functionality is implemented as server-side code to prevent exposing API keys and to handle Node.js-specific modules properly. The main components are:

1. **SMS Utility Functions**: Located in `lib/sms-utils.ts`
2. **Verification API Endpoints**: Located in `app/api/verification/`
3. **Database Functions**: For storing and validating verification codes

### Client-Side Implementation

The client-side code only handles:

1. User interface for entering phone numbers and verification codes
2. Form validation
3. API calls to the server-side endpoints

## Security Considerations

- Verification codes expire after 15 minutes
- Rate limiting is implemented to prevent abuse
- Phone numbers are validated before sending SMS
- All sensitive operations require authentication

## Troubleshooting

### Common Issues

1. **SMS not being sent**:
   - Check that Twilio credentials are correctly configured
   - Verify the phone number is in a valid format (E.164)
   - Check Twilio console for error messages

2. **Invalid phone number errors**:
   - Ensure phone numbers include country code
   - Format should be: +1XXXXXXXXXX (for US numbers)

3. **Rate limiting**:
   - There's a limit to how many SMS can be sent to the same number
   - Wait before trying again

## Testing

You can test the SMS functionality using the admin verification settings page:

1. Navigate to `/admin/verification-settings`
2. Enter a test phone number
3. Click "Send Test SMS"
4. You should receive an SMS with a verification code

## Future Improvements

- Add support for international phone numbers
- Implement SMS templates for different scenarios
- Add analytics for SMS usage and delivery rates
