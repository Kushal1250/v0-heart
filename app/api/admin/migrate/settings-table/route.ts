import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromRequest } from "@/lib/auth-utils"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req as any)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Create the user_settings table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(10) DEFAULT 'dark',
        save_history BOOLEAN DEFAULT TRUE,
        notifications BOOLEAN DEFAULT FALSE,
        email_notifications BOOLEAN DEFAULT FALSE,
        data_sharing BOOLEAN DEFAULT FALSE,
        language VARCHAR(20) DEFAULT 'english',
        units VARCHAR(10) DEFAULT 'metric',
        privacy_mode BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      )
    `

    return NextResponse.json({ message: "Settings table created successfully" })
  } catch (error) {
    console.error("Error creating settings table:", error)
    return NextResponse.json({ error: "Failed to create settings table" }, { status: 500 })
  }
}
