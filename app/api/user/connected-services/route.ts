import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get connected services for this user
    const services = await sql`
      SELECT * FROM connected_health_services WHERE user_id = ${currentUser.id}
    `

    return NextResponse.json(
      services.map((service) => ({
        id: service.service_id,
        name: service.service_name,
        icon: service.icon,
        connected: true,
        lastSync: service.last_sync,
      })),
    )
  } catch (error) {
    console.error("Error fetching connected services:", error)
    return NextResponse.json({ message: "Failed to fetch connected services" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Create a new connected service
    await sql`
      INSERT INTO connected_health_services (
        user_id, service_id, service_name, icon, last_sync
      ) VALUES (
        ${currentUser.id}, ${data.id}, ${data.name}, ${data.icon}, ${new Date().toISOString()}
      )
      ON CONFLICT (user_id, service_id) 
      DO UPDATE SET
        last_sync = ${new Date().toISOString()}
    `

    return NextResponse.json({
      success: true,
      message: "Service connected successfully",
      service: {
        id: data.id,
        name: data.name,
        icon: data.icon,
        connected: true,
        lastSync: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error connecting service:", error)
    return NextResponse.json({ message: "Failed to connect service" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const serviceId = searchParams.get("serviceId")

    if (!serviceId) {
      return NextResponse.json({ message: "Service ID is required" }, { status: 400 })
    }

    // Delete the connected service
    await sql`
      DELETE FROM connected_health_services 
      WHERE user_id = ${currentUser.id} AND service_id = ${serviceId}
    `

    return NextResponse.json({
      success: true,
      message: "Service disconnected successfully",
    })
  } catch (error) {
    console.error("Error disconnecting service:", error)
    return NextResponse.json({ message: "Failed to disconnect service" }, { status: 500 })
  }
}
