import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { getUserProfile, updateUserProfile } from "@/lib/db"

export async function GET(request: Request) {
  try {
    console.log("GET /api/user/profile - Fetching user profile")

    // Get the user from the request
    const user = await getUserFromRequest(request)

    if (!user) {
      console.log("GET /api/user/profile - No authenticated user found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log(`GET /api/user/profile - Found user: ${user.email}`)

    // Get the user profile
    const profile = await getUserProfile(user.id)

    if (!profile) {
      console.log(`GET /api/user/profile - No profile found for user: ${user.id}`)
      // Return the basic user info if no profile exists
      return NextResponse.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        created_at: new Date().toISOString(), // Fallback
        profile_picture: null,
        phone: null,
      })
    }

    console.log(`GET /api/user/profile - Successfully retrieved profile for user: ${user.id}`)

    // Return the user profile
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name || profile.name,
      role: user.role,
      created_at: profile.created_at || new Date().toISOString(),
      profile_picture: profile.profile_picture || null,
      phone: profile.phone || null,
    })
  } catch (error) {
    console.error("Error in GET /api/user/profile:", error)
    return NextResponse.json({ message: "An error occurred while fetching the user profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    console.log("PUT /api/user/profile - Updating user profile")

    // Get the user from the request
    const user = await getUserFromRequest(request)

    if (!user) {
      console.log("PUT /api/user/profile - No authenticated user found")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Parse the request body
    const data = await request.json()
    console.log(`PUT /api/user/profile - Received data for user ${user.id}:`, data)

    // Validate the data
    if (data.name && typeof data.name !== "string") {
      return NextResponse.json({ message: "Invalid name format" }, { status: 400 })
    }

    if (data.phone && typeof data.phone !== "string") {
      return NextResponse.json({ message: "Invalid phone format" }, { status: 400 })
    }

    // Update the user profile
    const updatedUser = await updateUserProfile(user.id, {
      name: data.name,
      phone: data.phone,
    })

    if (!updatedUser) {
      console.log(`PUT /api/user/profile - Failed to update profile for user: ${user.id}`)
      return NextResponse.json({ message: "Failed to update profile" }, { status: 500 })
    }

    console.log(`PUT /api/user/profile - Successfully updated profile for user: ${user.id}`)

    // Return the updated user data
    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    })
  } catch (error) {
    console.error("Error in PUT /api/user/profile:", error)
    return NextResponse.json({ message: "An error occurred while updating the user profile" }, { status: 500 })
  }
}
