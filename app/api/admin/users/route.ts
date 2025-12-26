import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAllUsersWithDetails } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const isAdmin = (await cookies()).get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Users API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Fetch real users from the database
    const users = await getAllUsersWithDetails()

    // Mask sensitive data
    const safeUsers = users.map((user) => ({
      ...user,
      password: "••••••••",
    }))

    return NextResponse.json({ users: safeUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "An error occurred", error: String(error) }, { status: 500 })
  }
}
