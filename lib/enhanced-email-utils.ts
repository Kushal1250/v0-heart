import nodemailer from "nodemailer"
import { systemLogger } from "./system-logger"
import { logError } from "./error-logger"

// Email configuration interface
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  from: string
}

// Email send result interface
interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  details?: any
  previewUrl?: string
}

/**
 * Get email configuration from environment variables with validation
 */
export function getEmailConfig(): { config: EmailConfig; isValid: boolean; missing: string[] } {
  const requiredVars = ["EMAIL_SERVER", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASSWORD", "EMAIL_FROM"]
  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  const config = {
    host: process.env.EMAIL_SERVER || "",
    port: Number(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
    from: process.env.EMAIL_FROM || "",
  }

  return {
    config,
    isValid: missingVars.length === 0,
    missing: missingVars,
  }
}

/**
 * Create a nodemailer transport based on environment
 */
export function createEmailTransport() {
  const { config, isValid, missing } = getEmailConfig()

  // In development, use ethereal email for testing
  if (process.env.NODE_ENV === "development" || !isValid) {
    systemLogger.info("Email", "Using development email transport")

    // Create a test account on ethereal.email
    return nodemailer
      .createTestAccount()
      .then((testAccount) => {
        systemLogger.info("Email", "Created test email account", {
          user: testAccount.user,
          server: testAccount.smtp.host,
        })

        return nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })
      })
      .catch((error) => {
        systemLogger.error("Email", "Failed to create test account", { error })
        // Fallback to a mock transport
        return {
          sendMail: async (options: any) => {
            systemLogger.info("Email", "Mock email sent", { to: options.to, subject: options.subject })
            return { messageId: "mock-id", preview: null }
          },
        }
      })
  }

  // In production, use the configured SMTP server
  systemLogger.info("Email", "Using production email transport", {
    host: config.host,
    port: config.port,
  })

  return Promise.resolve(
    nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
      // Add additional options for better deliverability
      pool: true, // Use pooled connections
      maxConnections: 5,
      maxMessages: 100,
      // Add TLS options
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false,
      },
    }),
  )
}

/**
 * Send an email with enhanced error handling and logging
 */
export async function sendEnhancedEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
  attachments?: any[],
): Promise<EmailResult> {
  try {
    systemLogger.info("Email", "Sending email", { to, subject })

    const { config, isValid } = getEmailConfig()

    if (!isValid && process.env.NODE_ENV === "production") {
      systemLogger.error("Email", "Invalid email configuration", { config })
      return {
        success: false,
        error: "Email configuration is incomplete. Check server environment variables.",
      }
    }

    // Create transport
    const transport = await createEmailTransport()

    // Prepare email options
    const mailOptions = {
      from: config.from || `"Heart Health App" <${config.auth.user}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML if text not provided
      html,
      attachments: attachments || [],
    }

    // Send email
    const info = await transport.sendMail(mailOptions)

    // Handle development preview URL
    let previewUrl = null
    if (process.env.NODE_ENV === "development" && info.messageId) {
      previewUrl = nodemailer.getTestMessageUrl(info)
      systemLogger.info("Email", "Development email sent", {
        messageId: info.messageId,
        previewUrl,
      })
    } else {
      systemLogger.info("Email", "Production email sent", { messageId: info.messageId })
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
    }
  } catch (error) {
    systemLogger.error("Email", "Failed to send email", { error })
    logError("Email sending failed", { error, to, subject })

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: error,
    }
  }
}

/**
 * Send a password reset email with enhanced error handling
 */
export async function sendEnhancedPasswordResetEmail(
  to: string,
  resetLink: string,
  username?: string,
): Promise<EmailResult> {
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

  return await sendEnhancedEmail(to, subject, html, text)
}

/**
 * Verify email configuration by testing connection
 */
export async function verifyEmailConfiguration(): Promise<{
  success: boolean
  message: string
  config?: any
}> {
  try {
    const { config, isValid, missing } = getEmailConfig()

    if (!isValid) {
      return {
        success: false,
        message: `Missing required email configuration: ${missing.join(", ")}`,
        config: {
          server: config.host || "(not set)",
          port: config.port || "(not set)",
          secure: config.secure ? "Yes" : "No",
          user: config.auth.user ? "✓ Set" : "✗ Not set",
          from: config.from || "(not set)",
        },
      }
    }

    // Create transport
    const transport = await createEmailTransport()

    // Verify connection
    await transport.verify()

    return {
      success: true,
      message: "Email configuration is valid and connection successful",
      config: {
        server: config.host,
        port: config.port,
        secure: config.secure ? "Yes" : "No",
        user: "✓ Set",
        from: config.from,
      },
    }
  } catch (error) {
    systemLogger.error("Email", "Failed to verify email configuration", { error })

    return {
      success: false,
      message: `Failed to verify email configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      config: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    }
  }
}

/**
 * Send a test email to verify configuration
 */
export async function sendTestEmail(to: string): Promise<EmailResult> {
  const subject = "Test Email from Heart Health App"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #0070f3;">Test Email</h1>
      <p>This is a test email from the Heart Health App to verify that email sending is working correctly.</p>
      <p>If you're receiving this email, it means your email configuration is working properly!</p>
      <p style="margin-top: 30px; font-size: 12px; color: #666;">
        Sent at: ${new Date().toLocaleString()}
      </p>
    </div>
  `

  return await sendEnhancedEmail(to, subject, html)
}
