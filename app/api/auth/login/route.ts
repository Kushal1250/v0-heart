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

function normalizePhoneNumber(phone: string): string {
  if (!phone) return ""
  // Remove all non-digit characters except the leading +
  const cleaned = phone.replace(/\D/g, "")
  return cleaned
}

export async function POST(request: Request) {
  try {
    const { email, password, phone } = await request.json()

    console.log("[v0] Login attempt for email:", email)

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

    const normalizedEmail = email.toLowerCase().trim()
    const user = await getUserByEmail(normalizedEmail)

    if (!user) {
      console.log("[v0] User not found for email:", email)
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    console.log("[v0] User found:", user.email, "Phone field:", user.phone, "Phone_number field:", user.phone_number)

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      console.log("[v0] Password verification failed for user:", email)
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const userPhone = user.phone || user.phone_number
    if (!userPhone) {
      console.log("[v0] No phone number stored for user:", email)
      return NextResponse.json(
        { success: false, message: "No phone number associated with this account" },
        { status: 401 },
      )
    }

    // Normalize both phone numbers for comparison - remove all non-digits except leading +
    const normalizedInputPhone = normalizePhoneNumber(phone)
    const normalizedUserPhone = normalizePhoneNumber(userPhone)

    console.log("[v0] Phone comparison:", {
      input: normalizedInputPhone,
      stored: normalizedUserPhone,
    })

    if (normalizedInputPhone !== normalizedUserPhone) {
      console.log("[v0] Phone number mismatch for user:", email)
      return NextResponse.json({ success: false, message: "Phone number does not match our records" }, { status: 401 })
    }

    // Generate session token
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create session in database
    await createSession(user.id, token, expiresAt)

    console.log("[v0] Login successful for user:", user.email)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone || user.phone_number,
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
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during login. Please try again." },
      { status: 500 },
    )
  }
}
