import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { imageData, userId } = await request.json()

    if (!imageData || !userId) {
      return NextResponse.json({ error: "Image data and userId are required" }, { status: 400 })
    }

    // Update user profile with image
    await sql`
      UPDATE users 
      SET profile_picture = ${imageData}
      WHERE id = ${userId}
    `

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully",
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
