import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import {
  getSessionByToken,
  getUserById,
  createVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
} from "@/lib/db"
import type { NextRequest } from "next/server"
import { sendSMS } from "@/lib/sms-utils"
import { logError } from "@/lib/error-logger"
import { sendEmail } from "@/lib/email-utils"

export function getSessionToken(): string | undefined {
  return cookies().get("session")?.value
}

export async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    // In a real application, you would verify the token and extract the user ID
    const session = await getSessionByToken(token)
    return session?.user_id || null
  } catch (error) {
    console.error("Error getting user ID from token:", error)
    return null
  }
}

export function generateToken(): string {
  return uuidv4()
}

export function isValidEmail(email: string): boolean {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isStrongPassword(password: string): boolean {
  // Password strength validation
  return password.length >= 8
}

export function createResponseWithCookie(data: any, token: string): any {
  const response = new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })

  // Set cookie with proper configuration
  response.headers.set(
    "Set-Cookie",
    `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`, // Adjust secure based on your environment
  )

  return response
}

export function clearSessionCookie(): void {
  cookies().delete("session")
}

// Add back the getCurrentUser function that was missing
export async function getCurrentUser(): Promise<{
  id: string
  email: string
  name: string | null
  role: string
} | null> {
  try {
    const token = getSessionToken()

    if (!token) {
      console.log("No session token found")
      return null
    }

    const session = await getSessionByToken(token)

    if (!session) {
      console.log("No session found for token")
      return null
    }

    const user = await getUserById(session.user_id)

    if (!user) {
      console.log("No user found for session user_id")
      return null
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function verifyAdminSession(request: Request): Promise<{
  id: string
  email: string
  name: string | null
  role: string
} | null> {
  const sessionToken = getSessionToken()
  if (!sessionToken) {
    return null
  }

  const session = await getSessionByToken(sessionToken)
  if (!session) {
    return null
  }

  const user = await getUserById(session.user_id)
  if (!user || user.role !== "admin") {
    return null
  }

  return user
}

/**
 * Extracts user information from an incoming request
 */
export async function getUserFromRequest(request: NextRequest) {
  try {
    // Get the session token from the cookie
    const cookieStore = request.cookies || cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      console.log("No session token found in request")
      return null
    }

    // Get the session from the database
    const session = await getSessionByToken(sessionToken)

    if (!session) {
      console.log("No valid session found for token")
      return null
    }

    // Get the user from the database
    const user = await getUserById(session.user_id)

    if (!user) {
      console.log("No user found for session")
      return null
    }

    return user
  } catch (error) {
    console.error("Error getting user from request:", error)
    return null
  }
}

/**
 * Gets the user from the session token
 * This is the missing export that was causing the deployment error
 */
export async function getUserFromSession(sessionToken: string | undefined): Promise<{
  id: string
  email: string
  name: string | null
  role: string
} | null> {
  try {
    if (!sessionToken) {
      return null
    }

    const session = await getSessionByToken(sessionToken)
    if (!session) {
      return null
    }

    const user = await getUserById(session.user_id)
    if (!user) {
      return null
    }

    return user
  } catch (error) {
    console.error("Error getting user from session:", error)
    return null
  }
}

/**
 * Generates a random verification code
 */
function generateVerificationCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Sends a verification code via email
 */
async function sendEmailVerification(
  email: string,
  code: string,
): Promise<{
  success: boolean
  message: string
  previewUrl?: string
}> {
  try {
    console.log(`Sending email verification to ${email} with code ${code}`)

    // Use the sendEmail function from email-utils.ts
    const result = await sendEmail({
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Use the following code to verify your account:</p>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${code}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    })

    if (!result.success) {
      console.error("Failed to send email verification:", result.message)
      return {
        success: false,
        message: result.message || "Failed to send email verification",
        previewUrl: result.previewUrl,
      }
    }

    console.log("Email verification sent successfully")
    return {
      success: true,
      message: "Email verification sent successfully",
      previewUrl: result.previewUrl,
    }
  } catch (error) {
    await logError("sendEmailVerification", error, { email })
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email verification",
    }
  }
}

/**
 * Sends a verification code to the user
 * @param identifier Email or phone number
 * @param method 'email' or 'sms'
 */
export async function sendVerificationCode(
  identifier: string,
  method: "email" | "sms",
): Promise<{
  success: boolean
  message: string
  previewUrl?: string
}> {
  try {
    console.log(`Sending verification code to ${identifier} via ${method}`)

    // Generate a verification code
    const code = generateVerificationCode()
    console.log(`Generated verification code: ${code}`)

    // Store the code in the database with a 15-minute expiration
    try {
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
      await createVerificationCode(identifier, code)
      console.log(`Stored verification code in database for ${identifier}`)
    } catch (dbError) {
      console.error(`Failed to store verification code: ${dbError}`)
      await logError("createVerificationCode", dbError, { identifier })
      return {
        success: false,
        message: "Database error: Failed to store verification code",
      }
    }

    // Send the code via the specified method
    if (method === "email") {
      console.log(`Sending verification code via email to ${identifier}`)
      const sent = await sendEmailVerification(identifier, code)
      if (!sent.success) {
        console.error(`Failed to send verification code via email: ${sent.message}`)
        return {
          success: false,
          message: `Email sending failed: ${sent.message}`,
          previewUrl: sent.previewUrl,
        }
      }
      console.log(`Successfully sent verification code via email to ${identifier}`)
      return {
        success: true,
        message: `Verification code sent via email.`,
        previewUrl: sent.previewUrl,
      }
    } else if (method === "sms") {
      console.log(`Sending verification code via SMS to ${identifier}`)
      const message = `Your verification code is: ${code}. It will expire in 15 minutes.`
      const sent = await sendSMS(identifier, message)
      if (!sent.success) {
        console.error(`Failed to send verification code via SMS: ${sent.message}`)
        return {
          success: false,
          message: `SMS sending failed: ${sent.message}`,
        }
      }
      console.log(`Successfully sent verification code via SMS to ${identifier}`)
      return {
        success: true,
        message: `Verification code sent via SMS.`,
      }
    }

    return {
      success: false,
      message: `Unsupported verification method: ${method}`,
    }
  } catch (error) {
    await logError("sendVerificationCode", error, { identifier, method })
    return {
      success: false,
      message: "An error occurred while sending the verification code.",
    }
  }
}

/**
 * Verifies a one-time password (OTP)
 * @param identifier Email or phone number
 * @param code The verification code
 */
export async function verifyOTP(
  identifier: string,
  code: string,
): Promise<{
  success: boolean
  message: string
}> {
  try {
    // Get the verification code from the database
    const verificationCode = await getVerificationCode(identifier)

    // Check if the code exists
    if (!verificationCode) {
      return {
        success: false,
        message: "Verification code not found or expired. Please request a new code.",
      }
    }

    // Check if the code has expired
    if (new Date() > new Date(verificationCode.expires_at)) {
      await deleteVerificationCode(identifier)
      return {
        success: false,
        message: "Verification code has expired. Please request a new code.",
      }
    }

    // Check if the code matches
    if (verificationCode.code !== code) {
      return {
        success: false,
        message: "Invalid verification code. Please try again.",
      }
    }

    // Delete the code after successful verification
    await deleteVerificationCode(identifier)

    return {
      success: true,
      message: "Verification successful.",
    }
  } catch (error) {
    await logError("verifyOTP", error, { identifier })
    return {
      success: false,
      message: "An error occurred while verifying the code.",
    }
  }
}

/**
 * Resends a verification code
 * @param identifier Email or phone number
 * @param method 'email' or 'sms'
 */
export async function resendVerificationCode(
  identifier: string,
  method: "email" | "sms",
): Promise<{
  success: boolean
  message: string
  previewUrl?: string
}> {
  try {
    // Delete any existing verification code
    await deleteVerificationCode(identifier)

    // Send a new verification code
    return await sendVerificationCode(identifier, method)
  } catch (error) {
    await logError("resendVerificationCode", error, { identifier, method })
    return {
      success: false,
      message: "An error occurred while resending the verification code.",
    }
  }
}
