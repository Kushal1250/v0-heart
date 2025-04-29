import { NextResponse } from "next/server"
import { resendVerificationCode } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { identifier, method } = await request.json()

    if (!identifier) {
      return NextResponse.json({ message: "Identifier is required" }, { status: 400 })
    }

    if (!method || (method !== "email" && method !== "sms")) {
      return NextResponse.json({ message: "Valid verification method is required" }, { status: 400 })
    }

    console.log(`Resending verification code to ${identifier} via ${method}`)

    const result = await resendVerificationCode(identifier, method)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      previewUrl: result.previewUrl,
    })
  } catch (error) {
    console.error("Error resending verification code:", error)
    return NextResponse.json({ message: "An error occurred while resending the verification code" }, { status: 500 })
  }
}
