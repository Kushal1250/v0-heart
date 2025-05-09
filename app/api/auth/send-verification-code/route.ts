import { NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { identifier, method, purpose } = await request.json()

    if (!identifier) {
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    if (!method || (method !== "email" && method !== "sms")) {
      return NextResponse.json({ message: "Valid method (email or sms) is required" }, { status: 400 })
    }

    console.log(`Sending verification code to ${identifier} via ${method} for purpose: ${purpose || "general"}`)

    // Send verification code
    const result = await sendVerificationCode(identifier, method)

    if (!result.success) {
      console.error(`Failed to send verification code: ${result.message}`)
      return NextResponse.json({ message: result.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent via ${method}`,
      previewUrl: result.previewUrl,
    })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json({ message: "An error occurred while sending the verification code" }, { status: 500 })
  }
}
