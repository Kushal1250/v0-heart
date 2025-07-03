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

    // Fetch all users - only include password field for admin access
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

    // Process passwords for admin view
    const safeUsers = users.map((user) => {
      let passwordDisplay = "No password set"

      // Check if user has a password
      if (user.password) {
        // If it's a hash (starts with $2b$ or similar), show a user-friendly message
        if (user.password.startsWith("$2b$") || user.password.startsWith("$2a$") || user.password.startsWith("$2y$")) {
          passwordDisplay = "Password set (encrypted)"
        } else {
          // If it's plain text (not recommended in production), show it
          passwordDisplay = user.password
        }
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        password: passwordDisplay, // Admin-friendly password display
        hasPassword: !!user.password, // Boolean to indicate if password exists
        role: user.role,
        created_at: user.created_at,
        provider: user.provider,
        phone: user.phone,
        profile_picture: user.profile_picture,
      }
    })

    return NextResponse.json({ users: safeUsers })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ message: "An error occurred", error: String(error) }, { status: 500 })
  }
}
