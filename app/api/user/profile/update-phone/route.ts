import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { isValidPhone } from "@/lib/sms-utils"
import { sql } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getUserFromRequest(request as any)

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 })
    }

    // Check if the phone number is already in use by another user
    const existingUser = await sql`
      SELECT id FROM users
      WHERE phone = ${phone}
      AND id != ${user.id}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ message: "This phone number is already in use" }, { status: 400 })
    }

    // Update the user's phone number
    await sql`
      UPDATE users
      SET phone = ${phone}, updated_at = NOW()
      WHERE id = ${user.id}
    `

    return NextResponse.json({ message: "Phone number updated successfully" })
  } catch (error) {
    console.error("Error updating phone number:", error)
    return NextResponse.json(
      {
        message: `Failed to update phone number: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
