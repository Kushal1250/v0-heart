"use server"

import { Twilio } from "twilio"

// Initialize Twilio client with environment variables
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null

/**
 * Send an SMS message using Twilio
 * @param to Phone number to send the SMS to (E.164 format: +1234567890)
 * @param body Text message to send
 * @returns Promise that resolves to success status and message
 */
export async function sendSMS(to: string, body: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      console.warn("Twilio is not configured. SMS will not be sent.")
      return {
        success: false,
        message: "SMS service is not configured",
      }
    }

    // Format phone number to E.164 format if not already
    const formattedPhone = await formatPhoneToE164(to)

    // Send the SMS
    const message = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    })

    console.log(`SMS sent successfully. SID: ${message.sid}`)
    return {
      success: true,
      message: "SMS sent successfully",
    }
  } catch (error) {
    console.error("Error sending SMS:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error sending SMS",
    }
  }
}

/**
 * Format a phone number to E.164 format (+1234567890)
 * @param phone Phone number to format
 * @returns Formatted phone number
 */
export async function formatPhoneToE164(phone: string): Promise<string> {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "")

  // If the number doesn't start with a country code, add +1 (US/Canada)
  if (!phone.startsWith("+")) {
    // If it's a 10-digit number, assume US/Canada and add +1
    if (digits.length === 10) {
      return `+1${digits}`
    }
    // If it already has a country code (11+ digits), add +
    return `+${digits}`
  }

  return phone // Already in E.164 format
}

/**
 * Validate if a phone number is in a valid format
 * @param phone Phone number to validate
 * @returns Boolean indicating if the phone is valid
 */
export async function isValidPhone(phone: string): Promise<boolean> {
  // Basic validation - should have at least 10 digits
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10
}
