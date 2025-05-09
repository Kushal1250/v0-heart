import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      // Return a more graceful response for unauthenticated users
      return NextResponse.json(
        {
          authenticated: false,
          message: "Not authenticated",
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        },
      )
    }

    // Remove sensitive information
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: safeUser,
      },
      {
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error in user route:", error)
    return NextResponse.json(
      {
        authenticated: false,
        error: "Failed to authenticate user",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
