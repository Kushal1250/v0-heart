# Email Troubleshooting Guide

This guide will help you troubleshoot common email issues in the Heart Health Predictor application.

## Common Issues

### 1. Emails Not Being Sent

#### Symptoms:
- No errors, but emails never arrive
- Error messages about connection timeouts
- Authentication failures

#### Solutions:

1. **Check Environment Variables**
   - Ensure all required environment variables are set:
     - `EMAIL_SERVER` - SMTP server hostname (e.g., smtp.gmail.com)
     - `EMAIL_PORT` - SMTP port (usually 587 for TLS or 465 for SSL)
     - `EMAIL_SECURE` - Set to "true" for SSL (port 465) or "false" for TLS (port 587)
     - `EMAIL_USER` - Your email username or address
     - `EMAIL_PASSWORD` - Your email password or app password
     - `EMAIL_FROM` - The sender email address

2. **Gmail-Specific Setup**
   - If using Gmail:
     - Enable 2-Step Verification on your Google account
     - Generate an App Password (Google Account → Security → App Passwords)
     - Use this App Password instead of your regular Gmail password
     - Use smtp.gmail.com as your EMAIL_SERVER
     - Use port 587 and set EMAIL_SECURE to "false"

3. **Network Issues**
   - Some hosting providers block outgoing SMTP connections
   - Try using port 587 with TLS instead of port 465 with SSL
   - Consider using a dedicated email service like SendGrid or Mailgun

4. **Check Logs**
   - Review application logs for detailed error messages
   - Use the Email Diagnostics page to test your configuration

### 2. Emails Going to Spam

#### Symptoms:
- Emails are sent but end up in recipients' spam folders
- Low deliverability rates

#### Solutions:

1. **Set Up Email Authentication**
   - Implement SPF (Sender Policy Framework) records for your domain
   - Set up DKIM (DomainKeys Identified Mail) signing
   - Configure DMARC (Domain-based Message Authentication, Reporting & Conformance) policy

2. **Improve Email Content**
   - Avoid spam trigger words in subject lines and content
   - Maintain a good text-to-image ratio
   - Include proper unsubscribe links
   - Use a consistent sender name and address

3. **Warm Up Your IP Address**
   - Gradually increase email sending volume
   - Maintain consistent sending patterns

### 3. Development vs. Production Behavior

#### Understanding the Difference:

1. **Development Mode**
   - The application automatically uses Ethereal Email for testing
   - No real emails are sent; instead, a preview URL is provided
   - You can view the email content via the preview URL
   - Environment variables are not required in development

2. **Production Mode**
   - Real emails are sent using the configured SMTP server
   - All environment variables must be properly set
   - No preview URLs are generated (except in error messages for debugging)

## Using the Email Diagnostics Tool

The Email Diagnostics tool helps you identify and fix email configuration issues:

1. Navigate to `/admin/email-diagnostics`
2. Check your current email configuration
3. Send a test email to verify functionality
4. Review detailed error messages and solutions

## Alternative Options

If you continue to have issues with email delivery, consider these alternatives:

1. **PDF Download**: Users can download their results as a PDF and share it manually.
2. **Direct Share**: On mobile devices, users can use the native share functionality.
3. **Third-party Email Services**: Services like SendGrid, Mailgun, or Amazon SES offer better deliverability.

## Need More Help?

If you're still experiencing issues after trying these solutions, please:

1. Check the application logs for detailed error messages
2. Verify your email provider's settings and restrictions
3. Contact your email service provider for specific guidance
