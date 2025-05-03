import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verifyJwtToken } from "@/lib/token"

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "No authentication token found",
        },
        { status: 401 },
      )
    }

    const verifiedToken = await verifyJwtToken(token)

    if (!verifiedToken) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Invalid or expired token",
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: verifiedToken.id,
        email: verifiedToken.email,
        role: verifiedToken.role,
      },
    })
  } catch (error) {
    console.error("Session status check error:", error)
    return NextResponse.json(
      {
        authenticated: false,
        message: "Error checking authentication status",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
