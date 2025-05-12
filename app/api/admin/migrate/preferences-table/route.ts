import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    console.log("Creating user_preferences table...")

    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        email_notifications BOOLEAN DEFAULT TRUE,
        sms_notifications BOOLEAN DEFAULT FALSE,
        push_notifications BOOLEAN DEFAULT TRUE,
        reminders BOOLEAN DEFAULT TRUE,
        newsletter BOOLEAN DEFAULT FALSE,
        assessment_results_notifications BOOLEAN DEFAULT TRUE,
        share_with_doctors BOOLEAN DEFAULT TRUE,
        share_for_research BOOLEAN DEFAULT FALSE,
        anonymized_data_usage BOOLEAN DEFAULT TRUE,
        theme VARCHAR(20) DEFAULT 'dark',
        language VARCHAR(10) DEFAULT 'en-US',
        units VARCHAR(10) DEFAULT 'metric',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
    `

    console.log("user_preferences table created successfully!")

    return NextResponse.json({
      success: true,
      message: "Preferences table created successfully",
    })
  } catch (error) {
    console.error("Error creating preferences table:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create preferences table",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
