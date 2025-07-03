import { NextResponse } from "next/server"
import { getUserByEmail, comparePasswords, createSession } from "@/lib/db"
import { generateToken, createResponseWithCookie } from "@/lib/auth-utils"

// Function to normalize phone number (remove spaces, dashes, parentheses)
function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s\-$$$$+]/g, "").trim()
}

// Function to validate phone number format
function isValidPhoneNumber(phoneNumber: string): boolean {
  const normalized = normalizePhoneNumber(phoneNumber)
  // Check if it's at least 10 digits and contains only numbers
  return /^\d{10,15}$/.test(normalized)
}

export async function POST(request: Request) {
  try {
    const { email, password, phone } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Validate phone number is provided and valid
    if (!phone || !phone.trim()) {
      return NextResponse.json({ message: "Phone number is required" }, { status: 400 })
    }

    const normalizedPhone = normalizePhoneNumber(phone)
    if (!isValidPhoneNumber(phone)) {
      return NextResponse.json({ message: "Please enter a valid phone number" }, { status: 400 })
    }

    // Get user
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Verify phone number - normalize both stored and provided phone numbers for comparison
    if (!user.phone) {
      return NextResponse.json({ message: "No phone number associated with this account" }, { status: 401 })
    }

    const storedPhoneNormalized = normalizePhoneNumber(user.phone)
    if (normalizedPhone !== storedPhoneNormalized) {
      return NextResponse.json({ message: "Invalid phone number" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await comparePasswords(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Create session
    const token = generateToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await createSession(user.id, token, expiresAt)

    // Return user data (without password) and set cookie
    const { password: _, ...userWithoutPassword } = user
    return createResponseWithCookie({ user: userWithoutPassword }, token)
  } catch (error) {
    console.error("Login error:", error)
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during login"
    return NextResponse.json({ message: errorMessage }, { status: 500 })
  }
}
