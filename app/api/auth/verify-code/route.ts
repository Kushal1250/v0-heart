import { NextResponse } from "next/server"
import { verifyOTP } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { identifier, code } = await request.json()

    if (!identifier) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    if (!code) {
      return NextResponse.json({ message: "Verification code is required" }, { status: 400 })
    }

    // Verify the code
    const result = await verifyOTP(identifier, code)

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    console.error("Error verifying code:", error)
    return NextResponse.json({ message: "An error occurred while verifying the code" }, { status: 500 })
  }
}
