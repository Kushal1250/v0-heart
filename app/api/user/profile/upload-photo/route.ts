import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { updateUserProfile } from "@/lib/db"

// Increase the body size limit for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
}

export async function POST(request: NextRequest) {
  try {
    console.log("Profile photo upload: Starting upload process")

    const currentUser = await getCurrentUser()

    if (!currentUser) {
      console.log("Profile photo upload: Unauthorized - No current user")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log(`Profile photo upload: Processing upload for user ${currentUser.id}`)

    // Process the form data
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error("Profile photo upload: Error parsing form data", error)
      return NextResponse.json(
        {
          message: "Failed to parse upload data. The file may be too large or corrupted.",
        },
        { status: 400 },
      )
    }

    const profilePicture = formData.get("profile_picture") as File

    if (!profilePicture) {
      console.log("Profile photo upload: No file uploaded")
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }

    console.log(
      `Profile photo upload: File received - Type: ${profilePicture.type}, Size: ${profilePicture.size} bytes`,
    )

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(profilePicture.type)) {
      console.log(`Profile photo upload: Invalid file type - ${profilePicture.type}`)
      return NextResponse.json(
        { message: "Invalid file type. Please upload a JPEG, PNG, or GIF image." },
        { status: 400 },
      )
    }

    // Validate file size (max 50MB)
    if (profilePicture.size > 50 * 1024 * 1024) {
      console.log(`Profile photo upload: File too large - ${profilePicture.size} bytes`)
      return NextResponse.json(
        { message: "File too large. Please upload an image smaller than 50MB." },
        { status: 400 },
      )
    }

    // Generate a unique timestamp for cache busting
    const timestamp = Date.now()
    console.log(`Profile photo upload: Processing with timestamp ${timestamp}`)

    // Convert the file to a data URL
    let dataUrl
    try {
      console.log("Profile photo upload: Converting file to data URL")
      const arrayBuffer = await profilePicture.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64Image = buffer.toString("base64")
      dataUrl = `data:${profilePicture.type};base64,${base64Image}`
      console.log(`Profile photo upload: Data URL created, length: ${dataUrl.length} characters`)
    } catch (error) {
      console.error("Profile photo upload: Error converting file to data URL", error)
      return NextResponse.json(
        {
          message: "Failed to process the image. Please try again with a different image.",
        },
        { status: 500 },
      )
    }

    // Store the data URL in the database
    try {
      console.log("Profile photo upload: Updating user profile in database")
      const updatedUser = await updateUserProfile(currentUser.id, {
        profile_picture: dataUrl,
      })

      if (!updatedUser) {
        console.log("Profile photo upload: Failed to update user profile")
        return NextResponse.json({ message: "Failed to update profile picture" }, { status: 500 })
      }

      console.log("Profile photo upload: Profile successfully updated")
    } catch (error) {
      console.error("Profile photo upload: Database error", error)
      return NextResponse.json(
        {
          message: "Database error. Failed to save profile picture.",
        },
        { status: 500 },
      )
    }

    // Return success with the data URL
    console.log("Profile photo upload: Returning success response")
    return NextResponse.json({
      profile_picture: dataUrl,
      success: true,
      message: "Profile picture updated successfully",
      timestamp: timestamp,
    })
  } catch (error) {
    console.error("Profile photo upload: Unexpected error", error)
    return NextResponse.json(
      {
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 },
    )
  }
}
