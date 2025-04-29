"use server"

import { sendVerificationCode, verifyOTP } from "@/lib/auth-utils"
import { getUserByEmail, getUserByPhone } from "@/lib/data"
import { createPasswordResetToken, generateToken } from "@/lib/token"

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

export async function verifyOTPAction(identifier: string, otp: string) {
  try {
    // Verify the OTP
    const verifyResult = await verifyOTP(identifier, otp)

    if (!verifyResult.success) {
      return verifyResult
    }

    // If verification is successful, generate a password reset token
    const user = (await getUserByEmail(identifier)) || (await getUserByPhone(identifier))

    if (!user) {
      return {
        success: false,
        message: "User not found",
      }
    }

    // Generate a reset token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    await createPasswordResetToken(user.id, token, expiresAt)

    return {
      success: true,
      message: "Verification successful",
      token,
    }
  } catch (error) {
    console.error("Error in verifyOTPAction:", error)
    return {
      success: false,
      message: "An error occurred during verification",
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
