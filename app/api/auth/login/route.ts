import { NextResponse } from "next/server"
import { getUserByEmail, verifyPassword, createSession } from "@/lib/db"
import { generateToken } from "@/lib/auth-utils"

// Phone number validation function for different country codes
function isValidPhoneNumber(phone: string): boolean {
  // Expected format: +XX-XXXXXXXXXX (e.g., +91-9016261380)
  const phoneRegex = /^\+\d{1,4}-\d{7,15}$/

  if (!phoneRegex.test(phone)) {
    return false
  }

  const [countryCode, number] = phone.split("-")

  // Specific validation based on country code
  switch (countryCode) {
    case "+91": // India
      return number.length === 10 && /^[6-9]/.test(number)
    case "+1": // US/Canada
      return number.length === 10
    case "+44": // UK
      return number.length >= 10 && number.length <= 11
    case "+86": // China
      return number.length === 11
    case "+81": // Japan
      return number.length >= 10 && number.length <= 11
    default:
      return number.length >= 7 && number.length <= 15
  }
}

// Normalize phone number for database comparison
function normalizePhoneNumber(phone: string): string {
  // Keep the format as +XX-XXXXXXXXXX
  return phone.trim()
}

export async function POST(request: Request) {
  try {
    const { email, password, phone } = await request.json()

    console.log("Login attempt for email:", email)

    // Validate required fields
    if (!email || !password || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password, and phone number are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Validate phone number format
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid phone number format. Expected format: +XX-XXXXXXXXXX (e.g., +91-9016261380)",
        },
        { status: 400 },
      )
    }

    // Get user from database
    const user = await getUserByEmail(email.toLowerCase().trim())
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Verify phone number matches the user's phone - normalize both for comparison
    if (user.phone) {
      const normalizedInputPhone = normalizePhoneNumber(phone)
      const normalizedUserPhone = normalizePhoneNumber(user.phone)

      console.log("[v0] Phone verification:", {
        inputPhone: normalizedInputPhone,
        storedPhone: normalizedUserPhone,
        match: normalizedInputPhone === normalizedUserPhone,
      })

      if (normalizedInputPhone !== normalizedUserPhone) {
        console.log("Phone number mismatch:", {
          input: normalizedInputPhone,
          stored: normalizedUserPhone,
        })
        return NextResponse.json(
          { success: false, message: "Phone number does not match our records" },
          { status: 401 },
        )
      }
    } else {
      console.warn(`User ${user.id} has no phone number stored in database`)
      return NextResponse.json(
        { success: false, message: "Your account does not have a phone number. Please contact support." },
        { status: 401 },
      )
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
        phone: user.phone,
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
