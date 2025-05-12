import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    console.log("Creating user_health_data table...")

    await sql`
      CREATE TABLE IF NOT EXISTS user_health_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        height VARCHAR(10),
        weight VARCHAR(10),
        blood_type VARCHAR(10),
        allergies TEXT,
        medical_conditions TEXT,
        medications TEXT,
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        emergency_contact_relation VARCHAR(50),
        date_of_birth DATE,
        gender VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_health_data_user_id ON user_health_data(user_id);
    `

    console.log("user_health_data table created successfully!")

    return NextResponse.json({
      success: true,
      message: "Health data table created successfully",
    })
  } catch (error) {
    console.error("Error creating health data table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create health data table",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
