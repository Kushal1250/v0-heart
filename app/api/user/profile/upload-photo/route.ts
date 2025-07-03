import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { updateUserProfile } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Profile photo upload API called")

    const currentUser = await getCurrentUser()
    console.log("Current user check:", currentUser ? "Authenticated" : "Not authenticated")

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Process the form data
    const formData = await request.formData()
    console.log("Form data received, keys:", [...formData.keys()])

    const profilePicture = formData.get("profile_picture") as File

    if (!profilePicture) {
      console.log("No file found in the request")
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    console.log("File received:", profilePicture.name, profilePicture.size, profilePicture.type)

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(profilePicture.type)) {
      console.log("Invalid file type:", profilePicture.type)
      return NextResponse.json(
        { message: "Invalid file type. Please upload a JPEG, PNG, or GIF image." },
        { status: 400 },
      )
    }

    // Convert the file to a data URL
    try {
      const arrayBuffer = await profilePicture.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64Image = buffer.toString("base64")
      const dataUrl = `data:${profilePicture.type};base64,${base64Image}`
      console.log("Data URL created successfully, length:", dataUrl.length)

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
      console.error("Error processing image:", error)
      return NextResponse.json({ message: "Failed to process image" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error uploading profile picture:", error)
    return NextResponse.json({ message: "Failed to upload profile picture" }, { status: 500 })
  }
}
