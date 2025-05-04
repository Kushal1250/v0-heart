import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserById, updateUserProfile } from "@/lib/db"

// Mock function to get user ID from token - replace with your actual implementation
function getUserIdFromToken(token: string): string | null {
  try {
    // This is a simplified example - in production, properly verify the token
    return "user-123" // Return a mock user ID for testing
  } catch (error) {
    console.error("Error extracting user ID from token:", error)
    return null
  }
}

export async function GET() {
  try {
    // Get token from cookies
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    // For testing purposes, return mock data if no token
    if (!token) {
      return NextResponse.json({
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        phone: "555-123-4567",
        profilePicture: null,
        role: "user",
        createdAt: new Date().toISOString(),
      })
    }

    const userId = getUserIdFromToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from database
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profile_picture,
      role: user.role,
      createdAt: user.created_at,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    // For testing purposes, accept updates without a token
    const userId = token ? getUserIdFromToken(token) : "user-123"

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate input
    if (!data.name || !data.email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Update user in database
    const updatedUser = await updateUserProfile(userId, {
      name: data.name,
      email: data.email,
      phone: data.phone,
    })

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      profilePicture: updatedUser.profile_picture,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
