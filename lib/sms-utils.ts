"use server"

// Define a type for the SMS response
export type SMSResponse = {
  success: boolean
  message: string
  errorDetails?: string
  sid?: string
}

/**
 * Format phone number to E.164 format
 * E.164 format: +[country code][number]
 */
export async function formatPhoneToE164(phone: string): Promise<string> {
  if (!phone) return ""

  // Remove all non-digit characters
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
    return `+${digits}`
  }

  // Return original with + if it's too short (will fail validation)
  return `+${digits}`
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
 * Send SMS using Twilio
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
      }
    }

    // Check if Twilio credentials are configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const fromNumber = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !fromNumber) {
      console.log("Twilio credentials not configured")
      return {
        success: false,
        message: "SMS service is not properly configured. Please contact support.",
        errorDetails: "Missing Twilio credentials",
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
      const { Twilio } = await import("twilio")
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

      // Handle specific Twilio error codes
      let userMessage = "Failed to send verification code. Please try again."

      if (twilioError.code === 21211) {
        userMessage = "Invalid phone number format. Please check the number and try again."
      } else if (twilioError.code === 21608) {
        userMessage = "This phone number is not capable of receiving SMS messages."
      } else if (twilioError.code === 21610) {
        userMessage = "This number has been blocked from receiving messages."
      }

      return {
        success: false,
        message: userMessage,
        errorDetails: twilioError.message || "Unknown Twilio error",
      }
    }
  } catch (error: any) {
    console.error("Error in sendSMS function:", error)
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
      errorDetails: error.message || "Unknown error",
    }
  }
}
