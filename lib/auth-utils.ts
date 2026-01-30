import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

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
