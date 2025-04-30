import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
