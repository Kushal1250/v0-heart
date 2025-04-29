import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { updateUserProfile } from "@/lib/db"

export async function POST(request: Request) {
  try {
    console.log("Direct profile photo upload API called")

    // Get the current user
    const currentUser = await getCurrentUser()
    console.log("Current user check:", currentUser ? "Authenticated" : "Not authenticated")

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const body = await request.json()

    // Validate the request
    if (!body.image || !body.fileType) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(body.fileType)) {
      return NextResponse.json(
        { message: "Invalid file type. Please upload a JPEG, PNG, or GIF image." },
        { status: 400 },
      )
    }

    // The image is already a data URL from the client
    const dataUrl = body.image

    try {
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
      console.error("Error updating profile:", error)
      return NextResponse.json({ message: "Failed to update profile picture in database" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing direct upload:", error)
    return NextResponse.json({ message: "Failed to process image upload" }, { status: 500 })
  }
}
