import nodemailer from "nodemailer"
import { logError } from "./error-logger"

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_SERVER || "",
  port: Number.parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
}

// For development/testing
let testAccount: nodemailer.TestAccount | null = null

/**
 * Get a test account for development
 */
async function getTestAccount() {
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount()
    console.log("Created test account:", testAccount)
  }
  return testAccount
}

/**
 * Get email transport configuration
 */
async function getTransport() {
  // Use Ethereal for development if no email config is provided
  if (
    process.env.NODE_ENV === "development" &&
    (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass)
  ) {
    console.log("Using Ethereal test account for email")
    const testAccount = await getTestAccount()
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  }

  // Use configured email service
  return nodemailer.createTransport(emailConfig)
}

/**
 * Send an email
 * @param options Email options including to, subject, html, and text
 * @returns Success status and message
 */
export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    console.log("Sending email to:", options.to)
    console.log("Email subject:", options.subject)

    // Get transport
    const transporter = await getTransport()

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@heartpredict.com",
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
      html: options.html,
    })

    console.log("Email sent:", info.messageId)

    // Get preview URL for development
    const previewUrl = nodemailer.getTestMessageUrl(info)
    if (previewUrl) {
      console.log("Preview URL:", previewUrl)
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    }
  } catch (error) {
    console.error("Error sending email:", error)
    logError("Email sending failed", { error, to: options.to, subject: options.subject })
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}

/**
 * Send a password reset email
 * @param to Recipient email address
 * @param resetLink Password reset link
 * @param username Optional username for personalization
 * @returns Success status and message
 */
export async function sendPasswordResetEmail(to: string, resetLink: string, username?: string) {
  const subject = "Reset Your Password"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0070f3; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; 
                 text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${username || "there"},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <p style="text-align: center;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </p>
          <p>If you didn't request a password reset, you can ignore this email.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p>${resetLink}</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Password Reset Request
    
    Hello ${username || "there"},
    
    We received a request to reset your password. Please visit the following link to create a new password:
    
    ${resetLink}
    
    If you didn't request a password reset, you can ignore this email.
    
    This link will expire in 1 hour for security reasons.
    
    This is an automated message, please do not reply to this email.
  `

  return await sendEmail({
    to,
    subject,
    html,
    text,
  })
}

/**
 * Send a verification code email
 * @param to Recipient email address
 * @param code Verification code
 * @returns Success status and message
 */
export async function sendVerificationCodeEmail(to: string, code: string) {
  const subject = "Your Verification Code"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0070f3; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .code { background-color: #eee; padding: 15px; text-align: center; font-size: 24px; 
               letter-spacing: 5px; font-weight: bold; margin: 20px 0; }
        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Verification Code</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested a verification code. Use the following code to complete your request:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Your Verification Code
    
    Hello,
    
    You requested a verification code. Use the following code to complete your request:
    
    ${code}
    
    This code will expire in 15 minutes.
    
    If you didn't request this code, please ignore this email.
    
    This is an automated message, please do not reply to this email.
  `

  return await sendEmail({
    to,
    subject,
    html,
    text,
  })
}
