import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { updateUserProfile } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Read the raw request body as blob
    const blob = await request.blob()
    const contentType = request.headers.get("content-type") || "image/jpeg"

    // Check if content type is supported
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    const isValidType = validTypes.some((type) => contentType.includes(type))

    if (!isValidType) {
      return NextResponse.json(
        { message: "Invalid file type. Please upload a JPEG, PNG, or GIF image." },
        { status: 400 },
      )
    }

    // Check file size
    const MAX_FILE_SIZE = 50 * 1024 * 1024
    if (blob.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "File size exceeds the 50MB limit" }, { status: 400 })
    }

    // Convert blob to Base64
    const buffer = await blob.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString("base64")
    const dataUrl = `data:${contentType};base64,${base64Image}`

    // Store in database
    const updatedUser = await updateUserProfile(currentUser.id, {
      profile_picture: dataUrl,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update profile picture" }, { status: 500 })
    }

    // Return success
    return NextResponse.json({
      profile_picture: dataUrl,
      success: true,
      message: "Profile picture updated successfully",
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ message: "Failed to upload profile picture" }, { status: 500 })
  }
}
