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

    // Get the request body
    const body = await request.json()
    const { imageData } = body

    if (!imageData) {
      console.log("No image data found in the request")
      return NextResponse.json({ message: "No image data provided" }, { status: 400 })
    }

    // Validate the data URL format
    if (!imageData.startsWith("data:image/")) {
      console.log("Invalid image data format")
      return NextResponse.json({ message: "Invalid image data format" }, { status: 400 })
    }

    // Store the data URL in the database
    console.log("Updating user profile in database")
    const updatedUser = await updateUserProfile(currentUser.id, {
      profile_picture: imageData,
    })

    if (!updatedUser) {
      console.log("Database update failed")
      return NextResponse.json({ message: "Failed to update profile picture" }, { status: 500 })
    }

    console.log("Profile picture updated successfully")
    // Return success with the data URL
    return NextResponse.json({
      profile_picture: imageData,
      success: true,
      message: "Profile picture updated successfully",
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ message: "Failed to upload profile picture" }, { status: 500 })
  }
}
