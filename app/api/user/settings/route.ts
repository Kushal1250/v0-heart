import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { updateUserSettings } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const currentUser = await getUserFromRequest(request as any)

    if (!currentUser) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const data = await request.json()

    // Update user settings
    const result = await updateUserSettings(currentUser.id, data)

    if (!result) {
      return NextResponse.json({ message: "Failed to update settings" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: result,
    })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json(
      {
        message: `Failed to update settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get the current user from the session
    const currentUser = await getUserFromRequest(request as any)

    if (!currentUser) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // In a real implementation, you would fetch the user's settings from the database
    // For now, we'll return some default settings
    return NextResponse.json({
      twoFactorEnabled: false,
      twoFactorMethod: "email",
      emailVerified: true,
      phoneVerified: false,
      notificationPreferences: {
        email: true,
        sms: false,
        app: true,
      },
      privacySettings: {
        dataSharing: true,
        anonymousDataCollection: true,
      },
    })
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json(
      {
        message: `Failed to fetch settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
