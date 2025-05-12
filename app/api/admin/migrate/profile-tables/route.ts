import { NextResponse } from "next/server"
import { setupProfileTables } from "@/scripts/setup-profile-tables"
import { getCurrentUser } from "@/lib/auth-utils"

export async function POST() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const result = await setupProfileTables()

    if (!result.success) {
      return NextResponse.json({ message: "Failed to create profile tables", error: result.error }, { status: 500 })
    }

    return NextResponse.json({ message: "Profile tables created successfully" })
  } catch (error) {
    console.error("Error in profile tables migration:", error)
    return NextResponse.json({ message: "Failed to create profile tables" }, { status: 500 })
  }
}
