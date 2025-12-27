import { NextResponse } from "next/server"
import { createUser, getUserByEmail } from "@/lib/db"
import { hash } from "bcrypt-ts"

// Phone number validation function
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

export async function POST(request: Request) {
  try {
    const { name, email, password, phone } = await request.json()

    console.log("Signup attempt for:", { name, email, phone })

    // Validate required fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
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

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email.toLowerCase().trim())
    if (existingUser) {
      return NextResponse.json({ success: false, message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password using bcrypt-ts for consistency with login
    const hashedPassword = await hash(password, 12)

    // Create user
    const userId = await createUser(email.toLowerCase().trim(), hashedPassword, name.trim(), phone.trim())

    console.log("User created successfully:", userId)

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        userId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred during signup. Please try again." },
      { status: 500 },
    )
  }
}
