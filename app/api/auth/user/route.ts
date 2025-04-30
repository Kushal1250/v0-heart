import { NextResponse } from "next/server"
import { getSessionByToken, getUserById } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get the session token from cookies
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify the session
    const session = await getSessionByToken(sessionToken)

    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 })
    }

    // Get the user data
    const user = await getUserById(session.user_id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return the user data (excluding sensitive information)
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_picture: user.profile_picture,
      phone: user.phone,
    })
  } catch (error) {
    console.error("Error in user route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
