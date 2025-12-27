import { NextResponse } from "next/server"
import { deleteUser } from "@/lib/db"
import { getSessionToken } from "@/lib/auth-utils"
import { getSessionByToken } from "@/lib/db"
import { getUserById } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    console.log("[v0] Delete user request for ID:", userId)

    // Check if user is authenticated and is an admin
    const sessionToken = await getSessionToken()
    if (!sessionToken) {
      console.log("[v0] No session token found for delete request")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const session = await getSessionByToken(sessionToken)
    if (!session) {
      console.log("[v0] Invalid session token for delete request")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await getUserById(session.user_id)
    if (!currentUser || currentUser.role !== "admin") {
      console.log("[v0] User is not an admin, cannot delete users")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 })
    }

    // Don't allow deleting own account
    if (userId === currentUser.id) {
      console.log("[v0] Admin attempted to delete own account")
      return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 })
    }

    console.log("[v0] Deleting user:", userId)
    await deleteUser(userId)
    console.log("[v0] User successfully deleted:", userId)

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting user:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message: `Failed to delete user: ${errorMessage}` }, { status: 500 })
  }
}
