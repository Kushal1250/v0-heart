"use server"

import { sendVerificationCode } from "@/lib/auth-utils"
// Add this import if it doesn't exist
import { verifyOTP as verifyOTPFromDb } from "@/lib/db"

export async function sendVerificationAction(
  identifier: string,
  method: "email" | "sms",
): Promise<{
  success: boolean
  message: string
}> {
  try {
    // Log the request
    console.log(`sendVerificationAction called with identifier: ${identifier}, method: ${method}`)

    // Send verification code
    const result = await sendVerificationCode(identifier, method)

    // Log the result
    console.log(`sendVerificationAction result:`, result)

    return result
  } catch (error) {
    console.error("Error in sendVerificationAction:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while sending the verification code",
    }
  }
}

// Update or add the verifyOTPAction function
export async function verifyOTPAction(identifier: string, otp: string) {
  try {
    const result = await verifyOTPFromDb(identifier, otp)

    if (result.success) {
      // Generate a token for password reset
      // This is a simplified version - in production you'd use a more secure method
      const token = Buffer.from(`${identifier}:${Date.now()}`).toString("base64")
      return { success: true, token }
    } else {
      return { success: false, message: result.message }
    }
  } catch (error) {
    console.error("Error in verifyOTPAction:", error)
    return {
      success: false,
      message: `Verification failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

export async function resendVerificationAction(
  identifier: string,
  method: "email" | "sms",
): Promise<{
  success: boolean
  message: string
}> {
  try {
    // Delete any existing verification code
    // Send a new verification code
    return await sendVerificationCode(identifier, method)
  } catch (error) {
    console.error("Error in resendVerificationAction:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while resending the verification code.",
    }
  }
}
