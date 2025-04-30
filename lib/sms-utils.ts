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
 * Validate phone number
 */
export async function isValidPhone(phone: string): Promise<boolean> {
  if (!phone) return false

  // Basic validation for international phone numbers
  const formattedPhone = phone.replace(/\D/g, "")

  // Most international phone numbers are between 8 and 15 digits
  // This includes country code
  return formattedPhone.length >= 8 && formattedPhone.length <= 15
}

/**
 * Check if Twilio is properly configured
 */
export async function isTwilioConfigured(): Promise<{
  configured: boolean
  missing: string[]
  details: Record<string, string>
}> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  const missing = []
  const details: Record<string, string> = {}

  if (!accountSid) missing.push("TWILIO_ACCOUNT_SID")
  if (!authToken) missing.push("TWILIO_AUTH_TOKEN")
  if (!fromNumber) missing.push("TWILIO_PHONE_NUMBER")

  details.accountSid = accountSid ? "Configured" : "Missing"
  details.authToken = authToken ? "Configured" : "Missing"
  details.fromNumber = fromNumber ? "Configured" : "Missing"

  return {
    configured: missing.length === 0,
    missing,
    details,
  }
}

/**
 * Send an SMS message
 * @param to Recipient phone number
 * @param body Message content
 * @returns Success status and message
 */
async function baseSendSMS(to: string, body: string): Promise<SMSResponse> {
  try {
    // Check if Twilio is configured
    if (!twilioClient || !fromNumber) {
      console.warn("Twilio not configured. SMS would have been sent to:", to)
      return { success: false, error: "SMS service not configured" }
    }

    // Send SMS
    const message = await twilioClient.messages.create({
      body,
      from: fromNumber,
      to,
    })

    console.log("SMS sent:", message.sid)
    return { success: true, messageId: message.sid, sid: message.sid }
  } catch (error: any) {
    console.error("Error sending SMS:", error)
    logError("SMS sending failed", { error, to, body })
    return { success: false, error: "Failed to send SMS", errorDetails: error.message }
  }
}

/**
 * Send SMS using Twilio with enhanced error handling and debugging
 */
export async function sendSMS(to: string, message: string): Promise<SMSResponse> {
  try {
    console.log(`Attempting to send SMS to ${to}`)

    // Format the phone number
    const formattedPhone = await formatPhoneToE164(to)
    console.log(`Formatted phone: ${formattedPhone}`)

    // Validate the phone number
    const isValid = await isValidPhone(formattedPhone)
    if (!isValid) {
      console.log(`Invalid phone number format: ${formattedPhone}`)
      return {
        success: false,
        message: "Invalid phone number format. Please enter a valid phone number.",
        debugInfo: { originalPhone: to, formattedPhone },
      }
    }

    // Check if Twilio credentials are configured
    const twilioConfig = await isTwilioConfigured()
    if (!twilioConfig.configured) {
      console.log(`Twilio credentials not configured. Missing: ${twilioConfig.missing.join(", ")}`)

      // In development, provide a simulated success response
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV MODE] Would send SMS to ${formattedPhone}: ${message}`)
        return {
          success: true,
          message: "SMS simulated in development mode (Twilio not configured)",
          sid: "dev_mode_simulated",
          debugInfo: {
            mode: "development",
            missingEnvVars: twilioConfig.missing,
            phone: formattedPhone,
          },
        }
      }

      return {
        success: false,
        message: "SMS service is not properly configured. Please contact support.",
        errorDetails: `Missing Twilio credentials: ${twilioConfig.missing.join(", ")}`,
        debugInfo: { missingEnvVars: twilioConfig.missing, configDetails: twilioConfig.details },
      }
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID!
    const authToken = process.env.TWILIO_AUTH_TOKEN!
    const fromNumber = process.env.TWILIO_PHONE_NUMBER!

    // In development, just log the message
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV MODE] Would send SMS to ${formattedPhone}: ${message}`)
      return {
        success: true,
        message: "SMS simulated in development mode",
        sid: "dev_mode_simulated",
        debugInfo: {
          mode: "development",
          phone: formattedPhone,
          message,
        },
      }
    }

    // In production, send the actual SMS
    try {
      // Dynamically import Twilio to avoid bundling issues
      // const twilioModule = await import("twilio").catch((err) => {
      //   console.error("Failed to import Twilio module:", err)
      //   throw new Error("Failed to load SMS service module. Please try again later.")
      // })

      // const Twilio = twilioModule.Twilio
      // const client = new Twilio(accountSid, authToken)

      console.log(`Sending SMS via Twilio from ${fromNumber} to ${formattedPhone}`)

      // const result = await client.messages.create({
      //   body: message,
      //   from: fromNumber,
      //   to: formattedPhone,
      // })

      const result = await baseSendSMS(formattedPhone, message)

      if (!result.success) {
        return result
      }

      console.log(`SMS sent successfully. SID: ${result.sid}`)

      return {
        success: true,
        message: "Verification code sent successfully",
        sid: result.sid,
      }
    } catch (twilioError: any) {
      console.error("Twilio error:", twilioError)

      // Handle specific Twilio error codes
      let userMessage = "Failed to send verification code. Please try again."
      const errorDetails = twilioError.message || "Unknown Twilio error"

      // Map common Twilio error codes to user-friendly messages
      const errorCodeMap: Record<string, string> = {
        "21211": "Invalid phone number format. Please check the number and try again.",
        "21214": "The phone number is not a valid mobile number.",
        "21608": "This phone number is not capable of receiving SMS messages.",
        "21610": "This number has been blocked from receiving messages.",
        "21612": "The 'To' phone number is not currently reachable via SMS.",
        "21614": "This number is unverified. Trial accounts cannot send messages to unverified numbers.",
        "20003": "Authentication error. Please check your Twilio credentials.",
        "20404": "The requested resource was not found.",
        "30001": "Queue overflow. Too many messages are being sent at once.",
        "30004": "Message blocked. This message was flagged as spam.",
        "30005": "Unknown destination. The destination number is not a valid phone number.",
        "30006": "Landline or unreachable carrier. This number cannot receive SMS.",
        "30007": "Carrier violation. Message content violates carrier rules.",
        "30008": "Unknown error. The message could not be sent.",
      }

      if (twilioError.code && errorCodeMap[twilioError.code]) {
        userMessage = errorCodeMap[twilioError.code]
      }

      // Special handling for trial accounts
      if (twilioError.code === "21614") {
        userMessage =
          "This number is not verified with our SMS provider. For security reasons, we can only send SMS to verified numbers during the trial period. Please contact support for assistance."
      }

      return {
        success: false,
        message: userMessage,
        errorDetails,
        debugInfo: {
          errorCode: twilioError.code,
          errorMessage: twilioError.message,
          phone: formattedPhone,
        },
      }
    }
  } catch (error: any) {
    console.error("Error in sendSMS function:", error)

    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      errorDetails: error.message || "Unknown error",
      debugInfo: {
        errorType: error.name,
        errorStack: error.stack,
      },
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
