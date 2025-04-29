"use server"

import { sendVerificationCode, verifyOTP } from "@/lib/auth-utils"

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

export async function verifyOTPAction(
  identifier: string,
  code: string,
): Promise<{
  success: boolean
  message: string
}> {
  try {
    // Verify OTP
    const result = await verifyOTP(identifier, code)
    return result
  } catch (error) {
    console.error("Error in verifyOTPAction:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while verifying the code",
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
