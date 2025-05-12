import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    console.log("Creating health_reminders table...")

    await sql`
      CREATE TABLE IF NOT EXISTS health_reminders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_health_reminders_user_id ON health_reminders(user_id);
      CREATE INDEX IF NOT EXISTS idx_health_reminders_date ON health_reminders(reminder_date);
    `

    console.log("health_reminders table created successfully!")

    return NextResponse.json({
      success: true,
      message: "Health reminders table created successfully",
    })
  } catch (error) {
    console.error("Error creating health reminders table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create health reminders table",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
