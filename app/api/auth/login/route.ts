import { NextResponse } from "next/server"
import { sql } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await sql`
      SELECT * FROM users WHERE email = ${email}
    `

    if (userResult.rowCount === 0) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const user = userResult.rows[0]

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Generate session token
    const sessionToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

    // Store session in database
    await sql`
      INSERT INTO sessions (token, user_id, expires_at)
      VALUES (${sessionToken}, ${user.id}, ${expiresAt.toISOString()})
    `

    // Set session cookie
    cookies().set({
      name: "session",
      value: sessionToken,
      httpOnly: true,
      path: "/",
      expires: expiresAt,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    // Get the redirect URL from the request headers or query params
    const referer = request.headers.get("referer") || ""
    const url = new URL(referer)
    const redirectPath = url.searchParams.get("redirect") || "/history"

    // Return user data (excluding password)
    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
        phone: user.phone,
      },
      redirectTo: redirectPath,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
