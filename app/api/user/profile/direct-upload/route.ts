import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { updateUserProfile } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Direct profile photo upload API called")

    const currentUser = await getCurrentUser()
    console.log("Current user check:", currentUser ? "Authenticated" : "Not authenticated")

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the JSON data from the request
    const data = await request.json()

    if (!data.profile_picture) {
      console.log("No profile picture data found in the request")
      return NextResponse.json({ message: "No profile picture data provided" }, { status: 400 })
    }

    console.log("Profile picture data received, type:", data.type || "unknown", "filename:", data.filename || "unknown")

    // The data is already in base64 format, so we can use it directly
    const dataUrl = data.profile_picture

    console.log("Updating user profile in database")
    // Store the data URL in the database
    const updatedUser = await updateUserProfile(currentUser.id, {
      profile_picture: dataUrl,
    })

    if (!updatedUser) {
      console.log("Database update failed")
      return NextResponse.json({ message: "Failed to update profile picture" }, { status: 500 })
    }

    console.log("Profile picture updated successfully")
    // Return success with the data URL
    return NextResponse.json({
      profile_picture: dataUrl,
      success: true,
      message: "Profile picture updated successfully",
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ message: "Failed to upload profile picture" }, { status: 500 })
  }
}
