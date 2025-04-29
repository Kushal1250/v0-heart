import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import sharp from "sharp"

// Connect to the database
const sql = neon(process.env.DATABASE_URL!)

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

// Verify the JWT token and get the user ID
function getUserIdFromToken(request: NextRequest): number | null {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as { userId: number }
    return decoded.userId
  } catch (error) {
    console.error("Error verifying token:", error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get user ID from token
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 })
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, message: "File size exceeds the 5MB limit" }, { status: 400 })
    }

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" },
        { status: 400 },
      )
    }

    // Convert the file to a buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Process the image with sharp
    const processedImageBuffer = await sharp(buffer)
      .resize({
        width: 400,
        height: 400,
        fit: "cover",
        position: "center",
      })
      .toFormat("webp", { quality: 85 })
      .toBuffer()

    // Convert to base64 for storage
    const base64Image = `data:image/webp;base64,${processedImageBuffer.toString("base64")}`

    // Update the user's profile picture in the database
    await sql`
      UPDATE users 
      SET profile_picture = ${base64Image}, updated_at = NOW() 
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully",
      imageUrl: base64Image,
    })
  } catch (error: any) {
    console.error("Error uploading profile picture:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload profile picture",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user ID from token
    const userId = getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Remove the profile picture from the database
    await sql`
      UPDATE users 
      SET profile_picture = NULL, updated_at = NOW() 
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Profile picture removed successfully",
    })
  } catch (error: any) {
    console.error("Error removing profile picture:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove profile picture",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
