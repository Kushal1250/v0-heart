import { NextResponse } from "next/server"
import { clearSessionCookie, getSessionToken } from "@/lib/auth-utils"
import { deleteSession } from "@/lib/db"

export async function POST() {
  try {
    const token = await getSessionToken()

    if (token) {
      await deleteSession(token)
    }

    await clearSessionCookie()

    return NextResponse.json({ message: "Logged out successfully" })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "An error occurred during logout" }, { status: 500 })
  }
}
