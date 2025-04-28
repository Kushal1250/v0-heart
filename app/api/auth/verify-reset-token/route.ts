import { NextResponse } from "next/server"
import { getPasswordResetByToken } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 })
    }

    const resetRecord = await getPasswordResetByToken(token)

    if (!resetRecord) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 })
    }

    return NextResponse.json({ message: "Token is valid" })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
