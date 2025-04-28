import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { getUserById, updateUserProfile } from "@/lib/db"

export async function GET() {
  try {
    console.log("GET /api/user/profile - Starting request")
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      console.log("GET /api/user/profile - No current user found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log(`GET /api/user/profile - Fetching user with ID: ${currentUser.id}`)
    const user = await getUserById(currentUser.id)

    if (!user) {
      console.log(`GET /api/user/profile - User with ID ${currentUser.id} not found`)
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    console.log(`GET /api/user/profile - Successfully retrieved user data for ID: ${currentUser.id}`)

    // Return user data without sensitive information
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at,
      profile_picture: user.profile_picture,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ message: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log("PUT /api/user/profile - Starting request")
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      console.log("PUT /api/user/profile - No current user found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    console.log(`PUT /api/user/profile - Received data:`, data)

    // Validate input data
    if (data.name && typeof data.name !== "string") {
      return NextResponse.json({ message: "Invalid name format" }, { status: 400 })
    }

    if (data.phone && typeof data.phone !== "string") {
      return NextResponse.json({ message: "Invalid phone format" }, { status: 400 })
    }

    // Update user profile
    console.log(`PUT /api/user/profile - Updating user with ID: ${currentUser.id}`)
    const updatedUser = await updateUserProfile(currentUser.id, {
      name: data.name,
      phone: data.phone,
    })

    if (!updatedUser) {
      console.log(`PUT /api/user/profile - Failed to update user with ID: ${currentUser.id}`)
      return NextResponse.json({ message: "Failed to update profile" }, { status: 500 })
    }

    console.log(`PUT /api/user/profile - Successfully updated user with ID: ${currentUser.id}`)

    // Return updated user data
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ message: "Failed to update user profile" }, { status: 500 })
  }
}
