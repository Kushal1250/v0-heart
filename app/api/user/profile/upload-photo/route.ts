import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { updateUserProfile } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Process the form data
    const formData = await request.formData()
    const profilePicture = formData.get("profile_picture") as File

    if (!profilePicture) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(profilePicture.type)) {
      return NextResponse.json(
        { message: "Invalid file type. Please upload a JPEG, PNG, or GIF image." },
        { status: 400 },
      )
    }

    // Maximum file size (50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024

    // Validate file size (max 50MB)
    if (profilePicture.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "File size exceeds the 50MB limit" }, { status: 400 })
    }

    // Generate a unique timestamp for cache busting
    const timestamp = Date.now()

    // Convert the file to a data URL
    const arrayBuffer = await profilePicture.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString("base64")
    const dataUrl = `data:${profilePicture.type};base64,${base64Image}`

    // Store the data URL in the database
    const updatedUser = await updateUserProfile(currentUser.id, {
      profile_picture: dataUrl,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update profile picture" }, { status: 500 })
    }

    // Return success with the data URL
    return NextResponse.json({
      profile_picture: dataUrl,
      success: true,
      message: "Profile picture updated successfully",
      timestamp: timestamp,
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ message: "Failed to upload profile picture" }, { status: 500 })
  }
}
