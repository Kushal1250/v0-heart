import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { generateToken } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    console.log("Admin login attempt:", { email })

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Check if credentials match the hardcoded admin credentials
    if (email === "patelkushal1533@gmail.com" && password === "Kushal@1533") {
      // Generate admin token
      const token = generateToken()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      console.log("Admin login successful, setting cookies")

      // Set cookies with proper configuration
      cookies().set({
        name: "token",
        value: token,
        httpOnly: true,
        path: "/",
        expires: expiresAt,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      cookies().set({
        name: "session",
        value: token,
        httpOnly: true,
        path: "/",
        expires: expiresAt,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      cookies().set({
        name: "is_admin",
        value: "true",
        httpOnly: false, // Needs to be accessible from JavaScript
        path: "/",
        expires: expiresAt,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })

      return NextResponse.json({
        success: true,
        message: "Admin login successful",
        user: {
          id: "admin",
          email: email,
          name: "Admin",
          role: "admin",
        },
      })
    }

    console.log("Admin login failed: Invalid credentials")
    return NextResponse.json({ message: "Invalid admin credentials" }, { status: 401 })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ message: "An error occurred during admin login" }, { status: 500 })
  }
}
