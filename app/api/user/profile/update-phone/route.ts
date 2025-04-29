import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { updateUserPhone } from "@/lib/db"
import { isValidPhone } from "@/lib/sms-utils"

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const currentUser = await getUserFromRequest(request as any)

    if (!currentUser) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const { phone } = await request.json()

    // Validate the phone number
    const isValid = await isValidPhone(phone)
    if (!isValid) {
      return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 })
    }

    // Update the user's phone number in the database
    await updateUserPhone(currentUser.id, phone)

    return NextResponse.json({
      message: "Phone number updated successfully",
      phone,
    })
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
