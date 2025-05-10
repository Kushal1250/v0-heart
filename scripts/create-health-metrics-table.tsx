import { neon } from "@neondatabase/serverless"

export async function createHealthMetricsTable() {
  try {
    console.log("Creating health_metrics table...")

    const sql = neon(process.env.DATABASE_URL!)

    // Check if the table already exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'health_metrics'
      )
    `

    if (tableExists[0].exists) {
      console.log("health_metrics table already exists")
      return { success: true, message: "Table already exists" }
    }

    // Create the table
    await sql`
      CREATE TABLE health_metrics (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        type VARCHAR(50) NOT NULL,
        value TEXT NOT NULL,
        unit VARCHAR(20) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `

    // Create indexes for better performance
    await sql`
      CREATE INDEX health_metrics_user_id_idx ON health_metrics(user_id)
    `

    await sql`
      CREATE INDEX health_metrics_type_idx ON health_metrics(type)
    `

    await sql`
      CREATE INDEX health_metrics_timestamp_idx ON health_metrics(timestamp)
    `

    console.log("health_metrics table created successfully")
    return { success: true, message: "Table created successfully" }
  } catch (error) {
    console.error("Error creating health_metrics table:", error)
    return { success: false, message: "Failed to create table", error }
  }
}

// Execute the function if this script is run directly
if (require.main === module) {
  createHealthMetricsTable()
    .then((result) => {
      console.log(result)
      process.exit(0)
    })
    .catch((error) => {
      console.error("Error:", error)
      process.exit(1)
    })
}
