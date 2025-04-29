import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Create user_settings table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(10) NOT NULL DEFAULT 'dark',
        save_history BOOLEAN NOT NULL DEFAULT true,
        notifications BOOLEAN NOT NULL DEFAULT false,
        email_notifications BOOLEAN NOT NULL DEFAULT false,
        data_sharing BOOLEAN NOT NULL DEFAULT false,
        language VARCHAR(20) NOT NULL DEFAULT 'english',
        units VARCHAR(10) NOT NULL DEFAULT 'metric',
        privacy_mode BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `

    return NextResponse.json({ success: true, message: "User settings table created successfully" })
  } catch (error) {
    console.error("Error creating user settings table:", error)
    return NextResponse.json({ error: "Failed to create user settings table" }, { status: 500 })
  }
}
