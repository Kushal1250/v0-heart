import { NextResponse } from "next/server"
import { getPasswordResetByToken } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get("token")

    if (!token) {
      return NextResponse.json({ valid: false, message: "Token is required" }, { status: 400 })
    }

    const resetToken = await getPasswordResetByToken(token)

    if (!resetToken) {
      return NextResponse.json({ valid: false, message: "Invalid or expired token" }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error verifying reset token:", error)
    return NextResponse.json({ valid: false, message: "An error occurred while verifying the token" }, { status: 500 })
  }
}
