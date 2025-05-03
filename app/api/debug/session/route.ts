import { NextResponse } from "next/server"
import { debugSessionToken, getCurrentUser } from "@/lib/auth-utils"
import { cookies } from "next/headers"

export async function GET() {
  try {
    // Get debug info about the session
    const sessionDebug = await debugSessionToken()

    // Get the current user
    const user = await getCurrentUser()

    // Get cookie info
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    return NextResponse.json({
      session: sessionDebug,
      user: user
        ? {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        : null,
      cookie: {
        exists: !!sessionCookie,
        name: sessionCookie?.name,
        value: sessionCookie ? `${sessionCookie.value.substring(0, 5)}...` : null, // Only show the first few chars for security
        path: sessionCookie?.path,
        expires: sessionCookie?.expires,
      },
    })
  } catch (error) {
    console.error("Error in debug session:", error)
    return NextResponse.json(
      {
        error: "Failed to debug session",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
