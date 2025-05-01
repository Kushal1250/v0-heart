import nodemailer from "nodemailer"
import { logError } from "./error-logger"
import crypto from "crypto"

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
 * Create a DKIM signature for email
 * @param options Options for creating the DKIM signature
 * @returns The DKIM signature
 */
export function createDKIMSignature(options: {
  domain: string
  selector: string
  privateKey: string
  headerFields?: string[]
  body: string
  headers: Record<string, string>
}): string {
  const { domain, selector, privateKey, headerFields = ["from", "to", "subject", "date"], body, headers } = options

  // Create canonicalization of headers
  const canonicalizedHeaders = headerFields
    .map((field) => {
      const value = headers[field] || ""
      return `${field.toLowerCase()}:${value.trim()}\r\n`
    })
    .join("")

  // Create canonicalization of body
  const canonicalizedBody = body.trim() + "\r\n"

  // Create the string to sign
  const stringToSign = canonicalizedHeaders + canonicalizedBody

  // Create the signature
  const signer = crypto.createSign("sha256")
  signer.update(stringToSign)
  const signature = signer.sign(privateKey, "base64")

  // Create the DKIM header
  return `v=1; a=rsa-sha256; c=relaxed/relaxed; d=${domain}; s=${selector}; h=${headerFields.join(":")}; bh=${crypto
    .createHash("sha256")
    .update(canonicalizedBody)
    .digest("base64")}; b=${signature}`
}

/**
 * Send an email
 * @param options Email options including recipient, subject, and content
 * @returns Success status and message
 */
export async function sendEmail(options: {
  to: string
  subject: string
  text?: string
  html: string
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport(emailConfig)

    // Send email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@example.com",
      to: options.to,
      subject: options.subject,
      text: options.text || options.html.replace(/<[^>]*>/g, ""),
      html: options.html,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    logError("Email sending failed", { error, to: options.to, subject: options.subject })
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

  return await sendEmail({
    to,
    subject,
    html,
    text,
  })
}

/**
 * Send a verification email with a code
 * @param to Recipient email address
 * @param subject Email subject
 * @param message Email message (can include the code)
 * @returns Success status and message
 */
export async function sendVerificationEmail(to: string, subject: string, message: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #0070f3; color: white; padding: 10px 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { font-size: 12px; color: #666; text-align: center; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verification Required</h1>
        </div>
        <div class="content">
          <p>${message}</p>
        </div>
        <div class="footer">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to,
    subject,
    html,
  })
}
