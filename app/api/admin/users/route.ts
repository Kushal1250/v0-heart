import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    // Check admin authentication
    const cookieStore = cookies()
    const isAdmin = cookieStore.get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Users API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Connect to database
    const sql = neon(process.env.DATABASE_URL!)

    // Fetch all users with their actual passwords (for admin view only)
    const users = await sql`
      SELECT 
        id, 
        email, 
        name, 
        password,
        role, 
        created_at, 
        provider,
        phone,
        profile_picture
      FROM users 
      ORDER BY created_at DESC
    `

    // Return users with actual passwords (not masked)
    const safeUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password, // Return actual password for admin
      role: user.role,
      created_at: user.created_at,
      provider: user.provider,
      phone: user.phone,
      profile_picture: user.profile_picture,
    }))

    return NextResponse.json({ users: safeUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "An error occurred", error: String(error) }, { status: 500 })
  }
}
