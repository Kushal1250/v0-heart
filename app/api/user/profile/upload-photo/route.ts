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

    // Generate a unique timestamp for cache busting
    const timestamp = Date.now()

    // For this implementation, we'll use a more reliable approach with a data URL
    // In a production environment, you would use a proper storage service like AWS S3 or Vercel Blob
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
