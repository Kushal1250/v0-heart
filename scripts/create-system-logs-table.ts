import { db } from "@/lib/db"

export async function createSystemLogsTable() {
  try {
    // Check if table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'system_logs'
      );
    `);

    if (!tableExists.rows[0].exists) {
      // Create the table
      await db.query(`
        CREATE TABLE system_logs (
          id SERIAL PRIMARY KEY,
          log_type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          details JSONB,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // Create index on log_type for faster queries
      await db.query(`
        CREATE INDEX idx_system_logs_log_type ON system_logs(log_type);
      `);

      // Create index on created_at for faster time-based queries
      await db.query(`
        CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);
      `);

      console.log('System logs table created');
      return { success: true, message: 'System logs table created' };
    } else {
      console.log('System logs table already exists');
      return { success: true, message: 'System logs table already exists' };
    }
  } catch (error) {
    console.error('Error creating system logs table:', error);
    return { success: false,
\
Let's create an API endpoint to initialize the system logs table:
