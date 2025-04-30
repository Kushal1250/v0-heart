import { NextResponse } from "next/server"
import { getUserByEmail, comparePasswords } from "@/lib/db"

export async function POST(request: Request) {
  try {
    // This is a debugging endpoint - should be disabled in production
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ message: "Endpoint disabled in production" }, { status: 403 })
    }

    const { email, password } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    // Get user
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
          details: { email },
        },
        { status: 404 },
      )
    }

    // Return user info (excluding password)
    const userInfo = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0,
    }

    // If password was provided, test it
    let passwordCheck = null
    if (password) {
      try {
        const isValid = await comparePasswords(password, user.password)
        passwordCheck = {
          isValid,
          passwordProvided: true,
          hashedPasswordAvailable: !!user.password,
        }
      } catch (error) {
        passwordCheck = {
          error: error instanceof Error ? error.message : "Unknown error",
          passwordProvided: true,
          hashedPasswordAvailable: !!user.password,
        }
      }
    }

    return NextResponse.json({
      user: userInfo,
      passwordCheck,
    })
  } catch (error) {
    console.error("Error in auth debug route:", error)
    return NextResponse.json(
      {
        message: "Error processing request",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
