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

    // Validate file size (max 5MB)
    if (profilePicture.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: "File too large. Please upload an image smaller than 5MB." }, { status: 400 })
    }

    // For demonstration purposes, we'll use a placeholder image with a unique query parameter
    // In a real application, you would upload to a storage service like AWS S3 or Vercel Blob
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const imageUrl = `/placeholder.svg?height=200&width=200&query=profile-${currentUser.id}-${timestamp}-${randomId}`

    console.log("Setting profile picture URL:", imageUrl)

    // Update user profile with the new image URL
    const updatedUser = await updateUserProfile(currentUser.id, {
      profile_picture: imageUrl,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update profile picture" }, { status: 500 })
    }

    // Return the updated profile picture URL
    return NextResponse.json({
      profile_picture: imageUrl,
      success: true,
      message: "Profile picture updated successfully",
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ message: "Failed to upload profile picture" }, { status: 500 })
  }
}
