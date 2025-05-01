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

/**
 * Send an email
 * @param to Recipient email address
 * @param subject Email subject
 * @param html HTML content
 * @param text Plain text content (optional)
 * @returns Success status and message
 */
export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig)

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""),
      html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    logError("Email sending failed", { error, to, subject })
    return { success: false, error: "Failed to send email" }
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

  return await sendEmail(to, subject, html, text)
}

/**
 * Send a verification email with a code
 * @param to Recipient email address
 * @param code Verification code
 * @param username Optional username for personalization
 * @returns Success status and message
 */
export async function sendVerificationEmail(to: string, code: string, username?: string) {
  const subject = "Verify Your Email Address"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0070f3; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .code { font-size: 24px; font-weight: bold; text-align: center; 
                letter-spacing: 5px; margin: 20px 0; padding: 10px; 
                background-color: #e9e9e9; border-radius: 4px; }
        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello ${username || "there"},</p>
          <p>Please use the following code to verify your email address:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this verification, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Email Verification
    
    Hello ${username || "there"},
    
    Please use the following code to verify your email address:
    
    ${code}
    
    This code will expire in 15 minutes.
    
    If you didn't request this verification, you can safely ignore this email.
    
    This is an automated message, please do not reply to this email.
  `

  return await sendEmail(to, subject, html, text)
}
