import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"
import { getSessionByToken, getUserById } from "@/lib/db"
import type { NextRequest } from "next/server"

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
