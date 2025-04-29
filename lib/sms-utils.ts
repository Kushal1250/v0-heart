"use server"

// Define a type for the SMS response
export type SMSResponse = {
  success: boolean
  message: string
  errorId?: string
  sid?: string
}

// Format phone number to E.164 format
export async function formatPhoneToE164(phone: string): Promise<string> {
  if (!phone) return ""

  // Remove all non-digit characters except + at the beginning
  let cleaned = phone.replace(/[^\d+]/g, "")

  // If it doesn't start with +, assume it's a US number
  if (!cleaned.startsWith("+")) {
    cleaned = `+1${cleaned}`
  }

  return cleaned
}

// Validate phone number
export async function isValidPhone(phone: string): Promise<boolean> {
  if (!phone) return false

  // Basic validation for international phone numbers
  const cleaned = phone.replace(/[^\d+]/g, "")

  // Check if it starts with + and has between 8 and 15 digits
  // or if it's just digits (8-15)
  return (
    (cleaned.startsWith("+") && cleaned.length >= 9 && cleaned.length <= 16) ||
    (!cleaned.startsWith("+") && cleaned.length >= 8 && cleaned.length <= 15)
  )
}

// Send SMS using Twilio
export async function sendSMS(to: string, message: string): Promise<SMSResponse> {
  try {
    // Format the phone number
    const formattedPhone = await formatPhoneToE164(to)

    // Validate the phone number
    const isValid = await isValidPhone(formattedPhone)
    if (!isValid) {
      return { success: false, message: "Invalid phone number format" }
    }

    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.log(`[DEV MODE] Would send SMS to ${formattedPhone}: ${message}`)
      return {
        success: true,
        message: "SMS simulated in development mode (Twilio not configured)",
        sid: "dev_mode_simulated",
      }
    }

    // In development, just log the message
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DEV MODE] Would send SMS to ${formattedPhone}: ${message}`)
      return {
        success: true,
        message: "SMS simulated in development mode",
        sid: "dev_mode_simulated",
      }
    }

    // In production, send the actual SMS
    try {
      // Dynamically import Twilio to avoid bundling issues
      const twilio = require("twilio")
      const client = twilio(accountSid, authToken)

      const result = await client.messages.create({
        body: message,
        from: fromNumber,
        to: formattedPhone,
      })

      return {
        success: true,
        message: "SMS sent successfully",
        sid: result.sid,
      }
    } catch (twilioError) {
      console.error("Twilio error:", twilioError)
      return {
        success: false,
        message: twilioError instanceof Error ? twilioError.message : "Failed to send SMS via Twilio",
      }
    }
  } catch (error) {
    console.error("Error sending SMS:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send SMS",
    }
  }
}
