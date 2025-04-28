import { NextResponse } from "next/server"
import { updateUserRole } from "@/lib/db"
import { getSessionToken } from "@/lib/auth-utils"
import { getSessionByToken } from "@/lib/db"
import { getUserById } from "@/lib/db"

export async function PUT(request: Request) {
  try {
    // Check if user is authenticated and is an admin
    const sessionToken = getSessionToken()
    if (!sessionToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const session = await getSessionByToken(sessionToken)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await getUserById(session.user_id)
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Get request body
    const { userId, role } = await request.json()
    if (!userId || !role || (role !== "user" && role !== "admin")) {
      return NextResponse.json({ message: "Invalid request" }, { status: 400 })
    }

    // Don't allow changing own role
    if (userId === currentUser.id) {
      return NextResponse.json({ message: "Cannot change your own role" }, { status: 400 })
    }

    // Update user role
    await updateUserRole(userId, role)
    return NextResponse.json({ message: "User role updated successfully" })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
