import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get connected health services from database
    const result = await sql`
      SELECT * FROM user_health_services 
      WHERE user_id = ${currentUser.id}
    `.catch(() => null)

    // If no services exist yet, return empty array
    if (!result || result.length === 0) {
      return NextResponse.json([])
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching health services:", error)
    return NextResponse.json({ message: "Failed to fetch health services" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Create new service connection
    const result = await sql`
      INSERT INTO user_health_services (
        user_id,
        service_id,
        service_name,
        service_icon,
        connected_at,
        last_sync
      ) VALUES (
        ${currentUser.id},
        ${data.id},
        ${data.name},
        ${data.icon},
        NOW(),
        NOW()
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error connecting health service:", error)
    return NextResponse.json({ message: "Failed to connect health service" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get("serviceId")

    if (!serviceId) {
      return NextResponse.json({ message: "Service ID is required" }, { status: 400 })
    }

    // Delete service connection
    await sql`
      DELETE FROM user_health_services 
      WHERE user_id = ${currentUser.id} AND service_id = ${serviceId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting health service:", error)
    return NextResponse.json({ message: "Failed to disconnect health service" }, { status: 500 })
  }
}
