import { sql } from "@/lib/db"

export async function createHealthMetricsTable() {
  try {
    console.log("Creating health_metrics table...")

    await sql`
      CREATE TABLE IF NOT EXISTS health_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        height VARCHAR(10),
        weight VARCHAR(10),
        blood_type VARCHAR(5),
        allergies TEXT,
        medical_conditions TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create index on user_id for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id)
    `

    console.log("Health metrics table created successfully")
    return { success: true, message: "Health metrics table created successfully" }
  } catch (error) {
    console.error("Error creating health metrics table:", error)
    return {
      success: false,
      message: "Failed to create health metrics table",
      error: String(error),
    }
  }
}
