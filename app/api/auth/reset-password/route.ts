import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hash } from "bcrypt-ts"
import { getUserByEmail, getUserByPhone } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { identifier, newPassword } = await request.json()

    if (!identifier || !newPassword) {
      return NextResponse.json({ success: false, message: "Identifier and new password are required" }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 },
      )
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
        },
        { status: 400 },
      )
    }

    // Get user by identifier (email or phone)
    let user = null

    if (identifier.includes("@")) {
      user = await getUserByEmail(identifier)
    } else {
      user = await getUserByPhone(identifier)
    }

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await hash(newPassword, 10)

    // Update the user's password
    await sql`UPDATE users SET password = ${hashedPassword} WHERE id = ${user.id}`

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while resetting the password",
      },
      { status: 500 },
    )
  }
}
