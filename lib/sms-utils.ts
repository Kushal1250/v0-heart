"use server"

import { Twilio } from "twilio"
import { logError } from "./error-logger"

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_PHONE_NUMBER

let twilioClient: Twilio | null = null

// Only initialize if credentials are available
if (accountSid && authToken) {
  twilioClient = new Twilio(accountSid, authToken)
}

// Define a type for the SMS response
export type SMSResponse = {
  success: boolean
  message?: string
  messageId?: string
  error?: string
  errorDetails?: string
  sid?: string
  debugInfo?: any
}

/**
 * Format phone number to E.164 format
 * E.164 format: +[country code][number]
 */
export async function formatPhoneToE164(phone: string): Promise<string> {
  if (!phone) return ""

  // Remove all non-digit characters except the leading +
  const hasPlus = phone.startsWith("+")
  const digits = phone.replace(/\D/g, "")

  // If the number already has a + sign, assume it's in international format
  if (hasPlus) {
    return `+${digits}`
  }

  // Handle US numbers (default if no country code)
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // Handle Indian numbers (91 is India's country code)
  if (digits.length === 10 || digits.length === 12) {
    // Check if it already has the country code
    if (digits.startsWith("91") && digits.length === 12) {
      return `+${digits}`
    } else if (digits.length === 10) {
      // Add India's country code
      return `+91${digits}`
    }
  }

  // For other international numbers, just add the + if missing
  return `+${digits}`
}

/**
 * Validates a phone number format
 * @param phone Phone number to validate
 * @returns Boolean indicating if the phone number is valid
 */
export async function isValidPhone(phone: string): Promise<boolean> {
  // Basic phone number validation
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone)
}

// Add this function if it doesn't exist already
export async function isTwilioConfigured() {
  const requiredEnvVars = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"]
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  return {
    configured: missing.length === 0,
    missing,
  }
}

/**
 * Check if Twilio is properly configured
 */
// export async function isTwilioConfigured(): Promise<{
//   configured: boolean
//   missing: string[]
//   details: Record<string, string>
// }> {
//   const accountSid = process.env.TWILIO_ACCOUNT_SID
//   const authToken = process.env.TWILIO_AUTH_TOKEN
//   const fromNumber = process.env.TWILIO_PHONE_NUMBER

//   const missing = []
//   const details: Record<string, string> = {}

//   if (!accountSid) missing.push("TWILIO_ACCOUNT_SID")
//   if (!authToken) missing.push("TWILIO_AUTH_TOKEN")
//   if (!fromNumber) missing.push("TWILIO_PHONE_NUMBER")

//   details.accountSid = accountSid ? "Configured" : "Missing"
//   details.authToken = authToken ? "Configured" : "Missing"
//   details.fromNumber = fromNumber ? "Configured" : "Missing"

//   return {
//     configured: missing.length === 0,
//     missing,
//     details,
//   }
// }

/**
 * Sends an SMS message
 * @param to Recipient phone number
 * @param message Message content
 * @returns Success status and message
 */
export async function sendSMS(
  to: string,
  message: string,
): Promise<{
  success: boolean
  message: string
  errorDetails?: any
}> {
  try {
    console.log(`Sending SMS to ${to}: ${message}`)

    // Check if Twilio credentials are configured
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn("Twilio credentials not configured")

      // In development, simulate success
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode: Simulating SMS success")
        return {
          success: true,
          message: "SMS sent successfully (simulated in development)",
        }
      }

      return {
        success: false,
        message: "SMS service not configured",
      }
    }

    // In a real implementation, we would use the Twilio SDK here
    // For now, we'll just simulate success in development and log the attempt
    if (process.env.NODE_ENV === "development") {
      console.log("Development mode: Simulating SMS success")
      return {
        success: true,
        message: "SMS sent successfully (simulated in development)",
      }
    }

    // Dynamic import Twilio to avoid client-side inclusion
    const twilio = await import("twilio")
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

    // Send the SMS
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    })

    console.log(`SMS sent with SID: ${result.sid}`)
    return {
      success: true,
      message: "SMS sent successfully",
    }
  } catch (error) {
    console.error("Error sending SMS:", error)
    await logError("SMS sending failed", { error, to, message })
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send SMS",
      errorDetails: error,
    }
  }
}

/**
 * Send a verification code via SMS
 * @param to Recipient phone number
 * @param code Verification code
 * @returns Success status and message
 */
export async function sendVerificationSMS(to: string, code: string) {
  const body = `Your verification code is: ${code}. This code will expire in 15 minutes.`
  return await sendSMS(to, body)
}

/**
 * Send a test SMS message
 */
export async function sendTestSMS(to: string): Promise<SMSResponse> {
  const testMessage =
    "This is a test message from your HeartPredict application. If you received this, SMS sending is working correctly!"
  return await sendSMS(to, testMessage)
}

/**
 * Fallback to email if SMS fails
 */
export async function sendVerificationWithFallback(
  phone: string,
  email: string | null,
  code: string,
): Promise<{
  success: boolean
  message: string
  method: string
  fallbackUsed?: boolean
}> {
  // Try SMS first
  const smsResult = await sendVerificationSMS(phone, code) //await sendSMS(phone, `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`)

  // If SMS succeeds, return success
  if (smsResult.success) {
    return {
      success: true,
      message: "Verification code sent via SMS",
      method: "sms",
    }
  }

  // If SMS fails and we have an email, try email as fallback
  if (!smsResult.success && email) {
    const { sendEmail } = await import("./email-utils")

    const emailResult = await sendEmail({
      to: email,
      subject: "Your Verification Code",
      text: `Your HeartPredict verification code is: ${code}. Valid for 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Use the following code to verify your account:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p><small>Note: We sent this code via email because SMS delivery failed.</small></p>
        </div>
      `,
    })

    if (emailResult.success) {
      return {
        success: true,
        message: "SMS delivery failed, but we sent your code via email instead",
        method: "email",
        fallbackUsed: true,
      }
    }
  }

  // If both methods fail or no fallback available
  return {
    success: false,
    message: smsResult.message || "Failed to send verification code",
    method: "none",
  }
}

/**
 * Send a password reset SMS
 * @param to Recipient phone number
 * @param resetLink Password reset link
 * @param shortCode Optional short code for easier entry
 * @returns Success status and message
 */
export async function sendPasswordResetSMS(to: string, resetLink: string, shortCode?: string) {
  // If no short code is provided, use the first 6 characters of the token
  const code = shortCode || resetLink.split("token=")[1]?.substring(0, 6) || ""

  const body = `Your password reset code is: ${code}. Use this code or click the link to reset your password: ${resetLink}. This will expire in 1 hour.`

  return await sendSMS(to, body)
}

/**
 * Send a password reset SMS with a reset code or link
 */
// export async function sendPasswordResetSMS(to: string, resetToken: string, shortCode?: string): Promise<SMSResponse> {
//   const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

//   // If a short code is provided, use it instead of the full token
//   const resetCode = shortCode || resetToken.substring(0, 6).toUpperCase()
//   const resetLink = `${appUrl}/reset-password?token=${resetToken}`

//   const message = `HeartPredict: Your password reset code is ${resetCode}. Or use this link: ${resetLink} (Valid for 1 hour)`

//   return await sendSMS(to, message)
// }
