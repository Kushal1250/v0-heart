import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { updateUserProfile } from "@/lib/db"
import { isValidEmail, isValidPhone } from "@/lib/client-validation"

export async function POST(request: Request) {
  try {
    // Get the current user from the session
    const currentUser = await getUserFromRequest(request as any)

    if (!currentUser) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    const { name, email, phone, profile_picture } = await request.json()

    // Validate inputs
    if (!name || !name.trim()) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 })
    }

    if (!email || !email.trim()) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ message: "Invalid phone number format" }, { status: 400 })
    }

    // Update the user profile in the database
    const updatedUser = await updateUserProfile(currentUser.id, {
      name,
      phone,
      profile_picture,
    })

    if (!updatedUser) {
      return NextResponse.json({ message: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profile_picture: updatedUser.profile_picture,
      },
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      {
        message: `Failed to update profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: Request) {
  try {
    // Get the current user from the session
    const currentUser = await getUserFromRequest(request as any)

    if (!currentUser) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }

    // Return the user profile data
    return NextResponse.json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        profile_picture: currentUser.profile_picture,
      },
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      {
        message: `Failed to fetch profile: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
