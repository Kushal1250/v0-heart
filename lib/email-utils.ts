"\"use server"

import nodemailer from "nodemailer"
import { logError } from "./error-logger"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
  attachments?: any[]
}

// Create a development test account for email testing when in development
async function createTestAccount() {
  try {
    const testAccount = await nodemailer.createTestAccount()
    console.log("Created test email account:", testAccount)
    return {
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }
  } catch (error) {
    console.error("Failed to create test account:", error)
    return null
  }
}

export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean
  message: string
  previewUrl?: string
}> {
  try {
    // Log that we're attempting to send an email
    console.log(`Attempting to send email to ${options.to} with subject: ${options.subject}`)

    let transportConfig
    let isTestMode = false

    // Check if email configuration exists
    if (
      !process.env.EMAIL_SERVER ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD
    ) {
      console.warn("Email configuration is incomplete. Attempting to use test account.")

      // Only in development, create a test account
      if (process.env.NODE_ENV !== "production") {
        const testConfig = await createTestAccount()
        if (testConfig) {
          transportConfig = testConfig
          isTestMode = true
          console.log("Using ethereal test account for email")
        } else {
          throw new Error("Failed to create test email account and no email configuration exists")
        }
      } else {
        throw new Error("Email configuration is missing in production environment")
      }
    } else {
      // Use the configured email settings
      transportConfig = {
        host: process.env.EMAIL_SERVER,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        tls: {
          // Do not fail on invalid certificates
          rejectUnauthorized: false,
        },
      }
    }

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport(transportConfig)

    // Add the from field
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Heart Health Predictor" <${transportConfig.auth.user}>`,
      ...options,
    }

    // Send the email
    console.log(
      "Sending email with options:",
      JSON.stringify({
        to: mailOptions.to,
        subject: mailOptions.subject,
        from: mailOptions.from,
      }),
    )

    const info = await transporter.sendMail(mailOptions)

    console.log("Email sent successfully:", info.messageId)

    // If using test account, provide preview URL
    let previewUrl
    if (isTestMode) {
      previewUrl = nodemailer.getTestMessageUrl(info)
      console.log("Preview URL:", previewUrl)
    }

    // For development environments, return a preview URL
    if (process.env.NODE_ENV === "development" && info.messageId) {
      return {
        success: true,
        message: "Email sent successfully (development mode)",
        previewUrl: nodemailer.getTestMessageUrl(info),
      }
    }

    return {
      success: true,
      message: "Email sent successfully",
    }
  } catch (error) {
    console.error("Failed to send email:", error)
    await logError("sendEmail", error, { to: options.to, subject: options.subject })
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred while sending email",
    }
  }
}

// Function to verify email transport configuration
export async function verifyEmailConfig(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    // Check if email configuration exists
    if (
      !process.env.EMAIL_SERVER ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD
    ) {
      return {
        success: false,
        message: "Email configuration is incomplete",
        details: {
          server: !!process.env.EMAIL_SERVER,
          port: !!process.env.EMAIL_PORT,
          user: !!process.env.EMAIL_USER,
          password: !!process.env.EMAIL_PASSWORD,
        },
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    await transporter.verify()
    return { success: true, message: "Email configuration is valid" }
  } catch (error) {
    console.error("Email configuration verification failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Email configuration verification failed",
    }
  }
}

export async function sendVerificationEmail(
  email: string,
  code: string,
): Promise<{
  success: boolean
  message: string
  previewUrl?: string
}> {
  try {
    const subject = "Your HeartPredict Verification Code"
    const text = `Your HeartPredict verification code is: ${code}. It will expire in 15 minutes.`
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Verification Code</h2>
        <p>Use the following code to verify your account:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
          ${code}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `

    return await sendEmail({ to: email, subject, text, html })
  } catch (error) {
    console.error("Error sending verification email:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send verification email",
    }
  }
}
