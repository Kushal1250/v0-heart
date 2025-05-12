import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function createHealthMetricGoalsTable() {
  try {
    // Create the health_metric_goals table
    await sql`
      CREATE TABLE IF NOT EXISTS health_metric_goals (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        metric_type VARCHAR(50) NOT NULL,
        start_value DECIMAL(10, 2) NOT NULL,
        current_value DECIMAL(10, 2) NOT NULL,
        target_value DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        start_date TIMESTAMP NOT NULL,
        target_date TIMESTAMP NOT NULL,
        completed_date TIMESTAMP,
        notes TEXT,
        reminders_enabled BOOLEAN DEFAULT FALSE,
        reminder_frequency VARCHAR(20),
        reminder_days JSONB,
        reminder_time VARCHAR(10),
        goal_type VARCHAR(20) NOT NULL DEFAULT 'lower',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create indexes for better performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_health_metric_goals_user_id ON health_metric_goals(user_id)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_health_metric_goals_metric_type ON health_metric_goals(metric_type)
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_health_metric_goals_completed ON health_metric_goals(completed_date)
    `

    console.log("Health metric goals table created successfully")
    return { success: true }
  } catch (error) {
    console.error("Error creating health metric goals table:", error)
    return { success: false, error }
  }
}

export default async function handler() {
  return await createHealthMetricGoalsTable()
}
