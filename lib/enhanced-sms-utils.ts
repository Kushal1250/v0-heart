"use server"

import { logError } from "./error-logger"

// Define a type for the SMS response
export type SMSResponse = {
  success: boolean
  message: string
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

  // Handle US numbers (default if no country code)
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // If it already has a country code (11+ digits)
  if (digits.length > 10) {
    // Check if it's a US number with country code
    if (digits.startsWith("1") && digits.length === 11) {
      return `+${digits}`
    }
    // Otherwise assume it's an international number
    return hasPlus ? `+${digits}` : `+${digits}`
  }

  // Return original with + if it's too short (will fail validation)
  return hasPlus ? `+${digits}` : `+${digits}`
}

/**
 * Validate phone number
 */
export async function isValidPhone(phone: string): Promise<boolean> {
  if (!phone) return false

  // Basic validation for international phone numbers
  const digits = phone.replace(/\D/g, "")

  // Most phone numbers are between 10 and 15 digits
  return digits.length >= 10 && digits.length <= 15
}

/**
 * Check if Twilio is properly configured
 */
export async function isTwilioConfigured(): Promise<{
  configured: boolean
  missing: string[]
}> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_PHONE_NUMBER

  const missing = []

  if (!accountSid) missing.push("TWILIO_ACCOUNT_SID")
  if (!authToken) missing.push("TWILIO_AUTH_TOKEN")
  if (!fromNumber) missing.push("TWILIO_PHONE_NUMBER")

  return {
    configured: missing.length === 0,
    missing,
  }
}

/**
 * Send SMS using Twilio with enhanced error handling
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
        debugInfo: { missingEnvVars: twilioConfig.missing },
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
      const twilioModule = await import("twilio").catch((err) => {
        console.error("Failed to import Twilio module:", err)
        throw new Error("Failed to load SMS service module. Please try again later.")
      })

      const Twilio = twilioModule.Twilio
      const client = new Twilio(accountSid, authToken)

      console.log(`Sending SMS via Twilio from ${fromNumber} to ${formattedPhone}`)

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedPhone,
      })

      console.log(`SMS sent successfully. SID: ${result.sid}`)

      return {
        success: true,
        message: "Verification code sent successfully",
        sid: result.sid,
      }
    } catch (twilioError: any) {
      console.error("Twilio error:", twilioError)
      await logError("twilioSendSMS", twilioError, { phone: formattedPhone })

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
    await logError("sendSMS", error, { phone: to })

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
 * Send a test SMS message
 */
export async function sendTestSMS(to: string): Promise<SMSResponse> {
  const testMessage =
    "This is a test message from your HeartPredict application. If you received this, SMS sending is working correctly!"
  return await sendSMS(to, testMessage)
}
