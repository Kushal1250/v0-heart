import { neon } from "@neondatabase/serverless"

export async function createSystemBackupsTable() {
  try {
    const sql = neon(process.env.DATABASE_URL!)

    // Check if the table already exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_backups'
      ) as exists
    `

    if (tableExists[0].exists) {
      console.log("System backups table already exists")
      return { success: true, message: "Table already exists" }
    }

    // Create the system_backups table
    await sql`
      CREATE TABLE system_backups (
        id SERIAL PRIMARY KEY,
        backup_id VARCHAR(255) NOT NULL UNIQUE,
        backup_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(255) NOT NULL,
        notes TEXT
      )
    `

    console.log("System backups table created successfully")
    return { success: true, message: "Table created successfully" }
  } catch (error) {
    console.error("Error creating system backups table:", error)
    return { success: false, error: String(error) }
  }
}
