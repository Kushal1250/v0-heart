import { NextResponse } from "next/server"
import { sendVerificationCode } from "@/lib/auth-utils"
import { logError } from "@/lib/error-logger"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Extract identifier and method from the request body
    // Support both direct identifier and email/phone fields for backward compatibility
    const identifier = body.identifier || body.email || body.phone || ""
    const method = body.method || "email"

    console.log(`Received verification code request for ${identifier} via ${method}`)

    if (!identifier) {
      console.error("Missing identifier (email or phone)")
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    // Send the verification code
    const result = await sendVerificationCode(identifier, method as "email" | "sms")

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        previewUrl: result.previewUrl,
      })
    } else {
      return NextResponse.json({ message: result.message, previewUrl: result.previewUrl }, { status: 400 })
    }
  } catch (error) {
    await logError("send-verification-code", error)
    console.error("Error sending verification code:", error)
    return NextResponse.json({ message: "An error occurred while sending the verification code" }, { status: 500 })
  }
}
