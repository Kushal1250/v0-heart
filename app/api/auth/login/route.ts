import { NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, createSession } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"

// Phone number normalization function
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  return phone.replace(/\D/g, "")
}

// Phone number validation function
function isValidPhoneNumber(phone: string): boolean {
  const normalized = normalizePhoneNumber(phone)
  // Check if it has at least 10 digits and at most 15 digits
  return normalized.length >= 10 && normalized.length <= 15
}

export async function POST(request: Request) {
  try {
    const { email, password, phone } = await request.json()

    console.log("Login attempt for email:", email)

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Validate phone number if provided
    if (phone && !isValidPhoneNumber(phone)) {
      return NextResponse.json({ success: false, message: "Invalid phone number format" }, { status: 400 })
    }

    // Get user from database
    const user = await getUserByEmail(email.toLowerCase().trim())
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Invalid email or password" }, { status: 401 })
    }

    // If phone is provided, verify it matches the user's phone (optional check)
    if (phone && user.phone) {
      const normalizedInputPhone = normalizePhoneNumber(phone)
      const normalizedUserPhone = normalizePhoneNumber(user.phone)

      if (normalizedInputPhone !== normalizedUserPhone) {
        console.log("Phone number mismatch:", {
          input: normalizedInputPhone,
          stored: normalizedUserPhone,
        })
        // Note: We're not failing login for phone mismatch, just logging it
        // You can uncomment the lines below if you want strict phone verification
        // return NextResponse.json(
        //   { success: false, message: "Phone number does not match our records" },
        //   { status: 401 }
        // )
      }
    }

    // Generate session token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create session in database
    await createSession(user.id, token, expiresAt)

    console.log("Login successful for user:", user.email)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    // Set session cookie
    response.cookies.set({
      name: "session",
      value: token,
      httpOnly: true,
      path: "/",
      expires: expiresAt,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during login. Please try again." },
      { status: 500 },
    )
  }
}
