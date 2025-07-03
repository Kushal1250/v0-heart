import { NextResponse } from "next/server"
import { generateToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("Admin login attempt for email:", email)

    // Validate input
    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("Invalid email format:", email)
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Check if credentials match the hardcoded admin credentials
    const adminEmail = "patelkushal1533@gmail.com"
    const adminPassword = "Kushal@1533"

    if (email.toLowerCase().trim() === adminEmail.toLowerCase() && password === adminPassword) {
      // Generate admin token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      console.log("Admin login successful, generating token")

      // Create response
      const response = NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          id: "admin",
          email: email,
          name: "Admin",
          role: "admin",
        },
      })

      // Set cookies with proper configuration
      const cookieOptions = {
        httpOnly: true,
        path: "/",
        expires: expiresAt,
        sameSite: "lax" as const,
        secure: process.env.NODE_ENV === "production",
      }

      response.cookies.set({
        name: "token",
        value: token,
        ...cookieOptions,
      })

      response.cookies.set({
        name: "session",
        value: token,
        ...cookieOptions,
      })

      response.cookies.set({
        name: "is_admin",
        value: "true",
        httpOnly: false, // Needs to be accessible from JavaScript
        path: "/",
        expires: expiresAt,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      console.log("Admin cookies set successfully")
      return response
    }

    console.log("Admin login failed: Invalid credentials for email:", email)
    return NextResponse.json(
      {
        success: false,
        message: "Invalid admin credentials",
      },
      { status: 401 },
    )
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during admin login. Please try again.",
      },
      { status: 500 },
    )
  }
}
