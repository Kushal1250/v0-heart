import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      // Return a 200 OK response even when not authenticated
      // This prevents 401 errors in the console
      return NextResponse.json(
        {
          authenticated: false,
          message: "Not authenticated",
        },
        {
          status: 200, // Use 200 instead of 401
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
      profile_picture: user.profile_picture,
      phone: user.phone,
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
    console.error("Error in check-session route:", error)

    // Still return 200 OK to prevent console errors
    return NextResponse.json(
      {
        authenticated: false,
        error: "Failed to check authentication status",
      },
      {
        status: 200, // Use 200 instead of 500
        headers: {
          "Cache-Control": "no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
