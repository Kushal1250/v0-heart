import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Remove sensitive information
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    return NextResponse.json({
      authenticated: true,
      user: safeUser,
    })
  } catch (error) {
    console.error("Error in user route:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: "Failed to authenticate user",
      },
      { status: 500 },
    )
  }
}
