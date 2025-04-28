# Email Troubleshooting Guide

If recipients are not receiving emails from HeartPredict or if emails are being marked as spam, follow these troubleshooting steps.

## Common Issues and Solutions

### Emails Being Marked as Spam

1. **Set up proper email authentication**
   - Run `npm run setup-email-auth` to generate instructions for setting up SPF, DKIM, and DMARC records
   - Add the generated DNS records to your domain's DNS settings
   - These records help verify that emails are legitimately from your domain

2. **Use a reputable email service provider**
   - Consider using a transactional email service like SendGrid, Mailgun, or Amazon SES
   - These services have better deliverability rates than self-hosted email servers

3. **Update your email content**
   - Avoid spam trigger words like "free", "risk-free", "guarantee", etc.
   - Keep HTML simple and avoid excessive use of colors, images, or formatting
   - Include a plain text version of your email (already implemented)

### Emails Not Being Delivered to Spanish Recipients

Spain and some other European countries have stricter email regulations due to GDPR and local laws. To improve deliverability:

1. **Ensure explicit consent**
   - Make sure users explicitly consent to receive emails
   - Add a checkbox in the email form confirming consent

2. **Include proper unsubscribe options**
   - Add an unsubscribe link in all emails
   - Honor unsubscribe requests promptly

3. **Translate key parts of the email**
   - Consider adding Spanish translations for important disclaimers
   - Example: "Esta información es confidencial y destinada únicamente al destinatario mencionado."

4. **Use a local email service**
   - If sending primarily to Spanish recipients, consider using a Spanish email service provider
   - They will be more familiar with local regulations and have better deliverability

## Technical Configuration

### SMTP Settings

Ensure your SMTP settings are correctly configured in your environment variables:

\`\`\`
EMAIL_SERVER=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@heartpredict.example.com
\`\`\`

### Testing Email Deliverability

1. Use services like [Mail-Tester](https://www.mail-tester.com/) to check your email's spam score
2. Send test emails to different email providers (Gmail, Outlook, Yahoo, etc.)
3. Check the email headers to see if there are any specific spam flags

### Implementing DKIM Signing

If you're using Nodemailer, you can implement DKIM signing by adding the following to your transporter configuration:

\`\`\`javascript
const transporter = nodemailer.createTransport({
  // ... other settings
  dkim: {
    domainName: 'yourdomain.com',
    keySelector: 'heartpredict',
    privateKey: fs.readFileSync('./email-keys/dkim-private.key', 'utf8')
  }
});
\`\`\`

## Best Practices for Health-Related Emails

1. **Be transparent about the source**
   - Clearly identify your organization in the "From" name and email address
   - Include your physical address in the email footer

2. **Keep content factual and medical**
   - Avoid marketing language or promotional content
   - Stick to factual information about the assessment results

3. **Respect privacy**
   - Only include necessary health information
   - Remind recipients about the confidential nature of the content

4. **Provide context**
   - Explain why the recipient is receiving this email
   - Reference the user who initiated the email sharing

By following these guidelines, you should be able to significantly improve email deliverability, including to recipients in Spain and other countries with strict email regulations.
\`\`\`

Let's update the email API route to implement DKIM signing:

\`\`\`typescriptreact file="app/api/email/route.ts"
[v0-no-op-code-block-prefix]import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER || "smtp.example.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
})

// Helper function to format assessment data as HTML
function formatAssessmentDataAsHtml(data: any) {
  // Get risk level
  const riskLevel = data.result.risk
  const riskScore = data.result.score

  // Format health metrics
  const formatMetric = (name: string, value: string, unit = "") => {
    return `<tr>
      <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${value}${unit ? ` ${unit}` : ""}</td>
    </tr>`
  }

  // Map sex values to readable text
  const getSexText = (value: string) => (value === "1" ? "Male" : "Female")

  // Map chest pain types
  const getChestPainText = (value: string) => {
    const types = ["Typical angina", "Atypical angina", "Non-anginal pain", "Asymptomatic"]
    return types[Number.parseInt(value)] || value
  }

  // Generate risk color - using more muted colors to avoid spam triggers
  const getRiskColor = () => {
    if (riskLevel === "high") return "#d85a5a"
    if (riskLevel === "moderate") return "#d89b5a"
    return "#5a9178"
  }

  // Create HTML email content - simplified to avoid spam triggers
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
      <h2 style="color: #333333; margin-bottom: 20px;">Heart Health Assessment Results</h2>
      
      <div style="background-color: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #333333;">
          ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk Assessment
        </h3>
        <p>Risk Score: ${riskScore}%</p>
        <p style="margin-bottom: 0;">
          This is a health assessment based on provided metrics.
        </p>
      </div>

      <h3 style="border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Health Information</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tbody>
          ${formatMetric("Age", data.age, "years")}
          ${formatMetric("Gender", getSexText(data.sex))}
          ${formatMetric("Blood Pressure", data.trestbps, "mm Hg")}
          ${formatMetric("Cholesterol", data.chol, "mg/dl")}
          ${formatMetric("Chest Pain Type", getChestPainText(data.cp))}
          ${formatMetric("Fasting Blood Sugar > 120 mg/dl", data.fbs === "1" ? "Yes" : "No")}
          ${data.thalach ? formatMetric("Max Heart Rate", data.thalach) : ""}
          ${formatMetric("Exercise Induced Angina", data.exang === "1" ? "Yes" : "No")}
        </tbody>
      </table>

      <p style="font-size: 12px; color: #666666; border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 20px;">
        Assessment generated on ${new Date().toLocaleDateString()}.<br>
        This is an automated message from HeartPredict.
      </p>
    </div>
  `
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, assessmentData } = body

    // Validate email
    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 })
    }

    // Validate subject
    if (!subject || subject.trim().length === 0) {
      return NextResponse.json({ error: "Email subject is required" }, { status: 400 })
    }

    // Create email content - simplified to avoid spam triggers
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333333;">
        <h2 style="color: #333333;">Heart Health Assessment</h2>
        <p>${message || "Please find my heart health assessment results below."}</p>
    `

    // Add assessment data if included
    if (assessmentData) {
      htmlContent += formatAssessmentDataAsHtml(assessmentData)
    } else {
      htmlContent += `
        <p style="margin-top: 20px;">
          <strong>Note:</strong> The sender chose to share only this message without including detailed health metrics.
        </p>
      `
    }

    // Close the HTML content
    htmlContent += `
        <p style="font-size: 12px; color: #666666; border-top: 1px solid #eaeaea; padding-top: 15px; margin-top: 20px;">
          This email was sent via HeartPredict.<br>
          Please contact the sender directly if you have any questions.
        </p>
      </div>
    `

    // Create plain text version for better deliverability
    const textContent = `
Heart Health Assessment

${message || "Please find my heart health assessment results below."}

Risk Level: ${assessmentData ? assessmentData.result.risk.toUpperCase() : "N/A"}
Risk Score: ${assessmentData ? assessmentData.result.score + "%" : "N/A"}

This email was sent via HeartPredict.
Please contact the sender directly if you have any questions.
    `

    // Send email with improved configuration
    const mailOptions = {
      from: {
        name: "HeartPredict",
        address: process.env.EMAIL_FROM || "noreply@heartpredict.example.com",
      },
      to,
      subject,
      text: textContent, // Plain text version
      html: htmlContent,
      headers: {
        "X-Priority": "3", // Normal priority
        "X-MSMail-Priority": "Normal",
        "Importance": "Normal",
        "X-Mailer": "HeartPredict Health Assessment",
      }
    }

    // Check if we have email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log("Email credentials not configured. Would have sent:", mailOptions)

      // For demo purposes, simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 1500))

      return NextResponse.json({ success: true, message: "Email would have been sent (demo mode)" })
    }

    // Configure transporter with improved settings
    let transporterConfig: any = {
      host: process.env.EMAIL_SERVER || "smtp.example.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASSWORD || "",
      },
      tls: {
        rejectUnauthorized: false // For development only, remove in production
      },
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 100
    }

    // Add DKIM signing if keys exist
    const dkimPrivateKeyPath = path.join(process.cwd(), "email-keys", "dkim-private.key")
    if (fs.existsSync(dkimPrivateKeyPath)) {
      try {
        const privateKey = fs.readFileSync(dkimPrivateKeyPath, "utf8")
        transporterConfig.dkim = {
          domainName: process.env.EMAIL_FROM?.split("@")[1] || "heartpredict.example.com",
          keySelector: "heartpredict",
          privateKey: privateKey
        }
        console.log("DKIM signing enabled for emails")
      } catch (error) {
        console.error("Error loading DKIM keys:", error)
      }
    }

    const transporter = nodemailer.createTransport(transporterConfig)

    // Actually send the email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email. Please try again later." }, { status: 500 })
  }
}
