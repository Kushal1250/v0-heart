# Email Sharing Feature

The HeartPredict application includes functionality to share heart disease risk assessment results via email. This feature allows users to send their assessment results directly to healthcare providers or family members.

## How It Works

1. The email sharing feature uses Nodemailer to:
   - Format the assessment results as HTML email
   - Send the email to the specified recipient
   - Include appropriate privacy notices and disclaimers

2. The email includes:
   - Complete assessment results with risk level
   - All health metrics provided by the user (optional)
   - Custom message from the user
   - Date of assessment
   - Disclaimer about medical advice

## Implementation Details

- The email sending happens on the server side via a Next.js API route
- The email content is formatted as responsive HTML
- Users can choose whether to include detailed health metrics
- Success/error states are properly handled and displayed to the user

## Configuration

To enable email sending, you need to configure the following environment variables:

\`\`\`
EMAIL_SERVER=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@heartpredict.example.com
\`\`\`

If these variables are not set, the application will run in "demo mode" where emails are simulated but not actually sent.

## Privacy Considerations

- Users are informed that they are consenting to share their health information
- A disclaimer is included about the security of information once it leaves the server
- The email includes a confidentiality notice for recipients

## Usage

Users can share their assessment results via email by clicking the "Email Results" button on the results page. They can then enter the recipient's email address, customize the subject and message, and choose whether to include detailed health metrics.
