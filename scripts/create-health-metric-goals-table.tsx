import { neon } from "@neondatabase/serverless"

export async function createHealthMetricGoalsTable() {
  try {
    console.log("Creating health_metric_goals table...")

    const sql = neon(process.env.DATABASE_URL!)

    // Check if the table already exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'health_metric_goals'
      )
    `

    if (tableExists[0].exists) {
      console.log("health_metric_goals table already exists")
      return { success: true, message: "Table already exists" }
    }

    // Create the table
    await sql`
      CREATE TABLE health_metric_goals (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        metric_type VARCHAR(50) NOT NULL,
        target_value TEXT NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        target_date TIMESTAMP WITH TIME ZONE NOT NULL,
        notes TEXT,
        reminder_enabled BOOLEAN DEFAULT FALSE,
        reminder_frequency VARCHAR(20) DEFAULT 'daily',
        reminder_days TEXT,
        reminder_time VARCHAR(10),
        achieved BOOLEAN DEFAULT FALSE,
        achieved_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create indexes for better performance
    await sql`
      CREATE INDEX idx_health_metric_goals_user_id ON health_metric_goals(user_id)
    `

    await sql`
      CREATE INDEX idx_health_metric_goals_metric_type ON health_metric_goals(metric_type)
    `

    console.log("health_metric_goals table created successfully")
    return { success: true, message: "Table created successfully" }
  } catch (error) {
    console.error("Error creating health_metric_goals table:", error)
    return { success: false, error: String(error) }
  }
}

export default async function handler() {
  const result = await createHealthMetricGoalsTable()
  return result
}
