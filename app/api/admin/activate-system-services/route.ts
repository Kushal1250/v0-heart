import { NextResponse } from "next/server"
import { activateSystemServices } from "@/scripts/activate-system-services"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const result = await activateSystemServices()

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in activate system services API:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
