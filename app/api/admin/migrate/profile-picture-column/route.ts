import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    // Check if the profile_picture column exists and its type
    const checkColumnResult = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'profile_picture'
    `

    // If the column exists but is not TEXT, alter it
    if (checkColumnResult.length > 0 && checkColumnResult[0].data_type !== "text") {
      await sql`
        ALTER TABLE users 
        ALTER COLUMN profile_picture TYPE TEXT
      `
      return NextResponse.json({
        success: true,
        message: "Profile picture column type updated to TEXT",
      })
    }
    // If the column doesn't exist, add it
    else if (checkColumnResult.length === 0) {
      await sql`
        ALTER TABLE users 
        ADD COLUMN profile_picture TEXT
      `
      return NextResponse.json({
        success: true,
        message: "Profile picture column added",
      })
    }

    return NextResponse.json({
      success: true,
      message: "Profile picture column already exists with correct type",
    })
  } catch (error) {
    console.error("Error updating profile picture column:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile picture column",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
