import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { getUserProfile, updateUserProfile } from "@/lib/profile-service"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserProfile(currentUser.id)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return just the health metrics
    return NextResponse.json(user.health_metrics || {})
  } catch (error) {
    console.error("Error fetching health metrics:", error)
    return NextResponse.json({ message: "Failed to fetch health metrics" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Update user health metrics
    const updatedUser = await updateUserProfile(currentUser.id, {
      health_metrics: data,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update health metrics" }, { status: 500 })
    }

    // Return updated health metrics
    return NextResponse.json(updatedUser.health_metrics || {})
  } catch (error) {
    console.error("Error updating health metrics:", error)
    return NextResponse.json({ message: "Failed to update health metrics" }, { status: 500 })
  }
}
