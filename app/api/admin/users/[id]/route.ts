import { NextResponse } from "next/server"
import { deleteUser } from "@/lib/db"
import { getSessionToken } from "@/lib/auth-utils"
import { getSessionByToken } from "@/lib/db"
import { getUserById } from "@/lib/db"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

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

    // Don't allow deleting own account
    if (userId === currentUser.id) {
      return NextResponse.json({ message: "Cannot delete your own account" }, { status: 400 })
    }

    // Delete user
    await deleteUser(userId)
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ message: "An error occurred" }, { status: 500 })
  }
}
