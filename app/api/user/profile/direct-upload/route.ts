import { NextResponse, type NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { updateUserProfilePicture } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/user/profile/direct-upload - Starting request")
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      console.log("POST /api/user/profile/direct-upload - No current user found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()

    if (!body.imageData) {
      return NextResponse.json({ message: "No image data provided" }, { status: 400 })
    }

    // Validate the image data format (must be a data URL)
    if (!body.imageData.startsWith("data:image/")) {
      return NextResponse.json({ message: "Invalid image format" }, { status: 400 })
    }

    // Extract the base64 data and image type
    const matches = body.imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)

    if (!matches || matches.length !== 3) {
      return NextResponse.json({ message: "Invalid image data format" }, { status: 400 })
    }

    const imageType = matches[1]
    const base64Data = matches[2]

    // Validate image type
    const validTypes = ["jpeg", "jpg", "png", "gif"]
    if (!validTypes.includes(imageType.toLowerCase())) {
      return NextResponse.json({ message: "Unsupported image format" }, { status: 400 })
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, "base64")

    // Check file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ message: "Image too large (max 5MB)" }, { status: 400 })
    }

    // Generate a unique filename
    const filename = `profile_${currentUser.id}_${Date.now()}.${imageType}`

    // In a real implementation, you would upload this to a storage service
    // For this example, we'll simulate storing the image URL
    const imageUrl = `/uploads/${filename}`

    // Update the user's profile picture in the database
    const updated = await updateUserProfilePicture(currentUser.id, imageUrl)

    if (!updated) {
      return NextResponse.json({ message: "Failed to update profile picture" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile_picture: imageUrl,
      message: "Profile picture updated successfully",
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ message: "Failed to process image upload" }, { status: 500 })
  }
}
