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

    // In a real application, you would upload the file to a storage service like AWS S3
    // For this example, we'll simulate storing the image URL
    // This is a placeholder - in production, replace with actual file upload logic
    const imageUrl = `/placeholder.svg?height=200&width=200&query=user-${currentUser.id}`

    // Update user profile with the new image URL
    const updatedUser = await updateUserProfile(currentUser.id, {
      profile_picture: imageUrl,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update profile picture" }, { status: 500 })
    }

    // Return the updated profile picture URL
    return NextResponse.json({
      profile_picture: updatedUser.profile_picture,
    })
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ message: "Failed to upload profile picture" }, { status: 500 })
  }
}
