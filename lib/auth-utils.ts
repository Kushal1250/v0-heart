import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { randomBytes } from "crypto"

export async function getUserFromRequest(request: NextRequest) {
  try {
    // Get session token from cookies
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("sessionToken")?.value

    if (!sessionToken) {
      console.log("[v0] No session token found in request")
      return null
    }

    // Look up the user from the session
    const sessions = await sql`
      SELECT user_id FROM sessions WHERE token = $1 LIMIT 1
    `[sessionToken]

    if (sessions.length === 0) {
      console.log("[v0] Session token not found in database")
      return null
    }

    const userId = sessions[0].user_id

    // Get the full user object
    const users = await sql`
      SELECT id, email, name, role FROM users WHERE id = $1 LIMIT 1
    `[userId]

    if (users.length === 0) {
      console.log("[v0] User not found for session")
      return null
    }

    return users[0]
  } catch (error) {
    console.error("[v0] Error getting user from request:", error)
    return null
  }
}

export async function getCurrentUser(request?: NextRequest) {
  try {
    if (request) {
      return await getUserFromRequest(request)
    }

    // Get from cookies if no request provided
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("sessionToken")?.value

    if (!sessionToken) {
      return null
    }

    const sessions = await sql`
      SELECT user_id FROM sessions WHERE token = $1 LIMIT 1
    `[sessionToken]

    if (sessions.length === 0) {
      return null
    }

    const userId = sessions[0].user_id
    const users = await sql`
      SELECT id, email, name, role FROM users WHERE id = $1 LIMIT 1
    `[userId]

    return users.length > 0 ? users[0] : null
  } catch (error) {
    console.error("[v0] Error getting current user:", error)
    return null
  }
}

export async function getSessionToken() {
  try {
    const cookieStore = await cookies()
    return cookieStore.get("sessionToken")?.value || null
  } catch (error) {
    console.error("[v0] Error getting session token:", error)
    return null
  }
}

export function generateToken(length = 32): string {
  return randomBytes(length).toString("hex")
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("sessionToken")
    return true
  } catch (error) {
    console.error("[v0] Error clearing session cookie:", error)
    return false
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export async function verifyAdminSession(request?: any) {
  try {
    if (request) {
      const user = await getUserFromRequest(request)
      if (user && user.role === "admin") {
        return user
      }
      return null
    }

    const user = await getCurrentUser()
    if (user && user.role === "admin") {
      return user
    }
    return null
  } catch (error) {
    console.error("[v0] Error verifying admin session:", error)
    return null
  }
}
