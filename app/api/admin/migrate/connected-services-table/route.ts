import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    console.log("Creating connected_health_services table...")

    await sql`
      CREATE TABLE IF NOT EXISTS connected_health_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service_id VARCHAR(50) NOT NULL,
        service_name VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        access_token TEXT,
        refresh_token TEXT,
        token_expires_at TIMESTAMP WITH TIME ZONE,
        last_sync TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, service_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_connected_health_services_user_id ON connected_health_services(user_id);
    `

    console.log("connected_health_services table created successfully!")

    return NextResponse.json({
      success: true,
      message: "Connected services table created successfully",
    })
  } catch (error) {
    console.error("Error creating connected services table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create connected services table",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
