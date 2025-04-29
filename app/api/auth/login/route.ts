import { NextResponse } from "next/server"
import { sql } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import { v4 as uuidv4 } from "uuid"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Error parsing request body:", error)
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 })
    }

    const { email, password, phone } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}
    `

    if (!userResult || userResult.length === 0) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    const user = userResult[0]

    // Check if password is correct
    let isPasswordValid = false
    try {
      // Try both password and password_hash fields for compatibility
      const passwordField = user.password || user.password_hash
      if (!passwordField) {
        console.error("User has no password hash stored")
        return NextResponse.json({ message: "Authentication error" }, { status: 500 })
      }

      isPasswordValid = await bcrypt.compare(password, passwordField)
    } catch (error) {
      console.error("Password comparison error:", error)
      return NextResponse.json({ message: "Authentication error" }, { status: 500 })
    }

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Generate session token
    const sessionToken = uuidv4()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

    // Store session in database
    try {
      await sql`
        INSERT INTO sessions (token, user_id, expires_at)
        VALUES (${sessionToken}, ${user.id}, ${expiresAt.toISOString()})
      `
    } catch (dbError) {
      console.error("Error storing session:", dbError)
      return NextResponse.json({ message: "Failed to create session" }, { status: 500 })
    }

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
    let redirectPath = "/dashboard"

    try {
      const url = new URL(referer)
      const urlRedirect = url.searchParams.get("redirect")
      if (urlRedirect) {
        redirectPath = urlRedirect
      }
    } catch (error) {
      console.error("Error parsing referer URL:", error)
    }

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
