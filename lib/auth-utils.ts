import { cookies } from "next/headers"
import { sign } from "jsonwebtoken"
import { NextResponse } from "next/server"
import { getUserById, getSessionByToken } from "./db"
import { logError } from "./error-logger"
import { sendEmail } from "./email-utils"
import { sendSMS } from "./sms-utils"

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "fallback_jwt_secret"

// Function to get the session token from cookies
export function getSessionToken(): string | undefined {
  return cookies().get("session")?.value
}

// Function to get the current user from the session token
export async function getCurrentUser(): Promise<{
  id: string
  email: string
  name: string | null
  role: string
  profile_picture?: string
  phone?: string
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

// Alias for getCurrentUser to match the expected export
export const getAuthenticatedUser = getCurrentUser

// Function to get the user from the session token
export async function getUserFromSession(sessionToken: string | undefined): Promise<{
  id: string
  email: string
  name: string | null
  role: string
  profile_picture?: string
  phone?: string
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

// Function to get the user from the request
export async function getUserFromRequest(request: Request) {
  const token = request.headers.get("Authorization")?.split(" ")[1] || cookies().get("session")?.value

  if (!token) {
    return null
  }

  try {
    const session = await getSessionByToken(token)
    if (!session) {
      return null
    }

    const user = await getUserById(session.user_id)
    return user
  } catch (error) {
    console.error("Error in getUserFromRequest:", error)
    return null
  }
}

// Function to verify admin session
export async function verifyAdminSession(request: Request) {
  const token = cookies().get("session")?.value

  if (!token) {
    return null
  }

  try {
    const session = await getSessionByToken(token)
    if (!session) {
      return null
    }

    const user = await getUserById(session.user_id)
    if (!user || user.role !== "admin") {
      return null
    }

    return user
  } catch (error) {
    console.error("Error verifying admin session:", error)
    return null
  }
}

// Function to generate a JWT token
export function generateToken(payload: any, expiresIn = "7d"): string {
  return sign(payload, JWT_SECRET_KEY, { expiresIn })
}

// Function to create a response with a session cookie
export function createResponseWithCookie(data: any, token: string) {
  const response = NextResponse.json(data)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  response.cookies.set({
    name: "session",
    value: token,
    httpOnly: true,
    path: "/",
    expires: expiresAt,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  return response
}

// Function to clear the session cookie
export function clearSessionCookie() {
  cookies().delete("session")
  cookies().delete("token")
  cookies().delete("is_admin")
}

// Function to check if an email address is in a valid format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Function to check if a password meets complexity requirements
export function isStrongPassword(password: string): boolean {
  // Password must be at least 8 characters with uppercase, lowercase, and numbers
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password)
}

// Function to check if the user is an admin
export function isAdmin(user: { role?: string } | string | null | undefined): boolean {
  if (!user) return false

  // If user is a string, assume it's the role
  if (typeof user === "string") {
    return user === "admin"
  }

  // Otherwise, check the role property
  return user.role === "admin"
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
      await createVerificationCode(identifier, code)
      console.log(`Stored verification code in database for ${identifier}`)
    } catch (dbError) {
      console.error(`Failed to store verification code in database:`, dbError)

      // Return detailed error for debugging
      return {
        success: false,
        message: `Database error: ${dbError instanceof Error ? dbError.message : "Failed to store verification code"}`,
      }
    }

    // Send the code via the specified method
    if (method === "email") {
      console.log(`Sending verification code via email to ${identifier}`)
      const sent = await sendEmailVerification(identifier, code)
      if (!sent.success) {
        console.error(`Failed to send verification code via email to ${identifier}: ${sent.message}`)
        return {
          success: false,
          message: `Failed to send verification code via email: ${sent.message}`,
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
        console.error(`Failed to send verification code via SMS to ${identifier}: ${sent.message}`)
        return {
          success: false,
          message: `Failed to send verification code via SMS: ${sent.message}`,
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
      message:
        error instanceof Error
          ? `Error sending verification code: ${error.message}`
          : "An unknown error occurred while sending the verification code.",
    }
  }
}

// Function to create a verification code in the database
async function createVerificationCode(identifier: string, code: string): Promise<void> {
  // This function would typically insert the code into a database
  // For this example, we'll assume it's implemented elsewhere
  console.log(`Creating verification code for ${identifier}: ${code}`)

  // In a real implementation, you would do something like:
  // await db.query(`
  //   INSERT INTO verification_codes (identifier, code, expires_at)
  //   VALUES ($1, $2, NOW() + INTERVAL '15 minutes')
  // `, [identifier, code])
}
