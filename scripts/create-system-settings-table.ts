import { db } from "@/lib/db"

export async function createSystemSettingsTable() {
  try {
    // Check if table exists
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'system_settings'
      );
    `)

    if (!tableExists.rows[0].exists) {
      // Create the table
      await db.query(`
        CREATE TABLE system_settings (
          id SERIAL PRIMARY KEY,
          setting_name VARCHAR(255) NOT NULL UNIQUE,
          setting_value TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `)

      // Insert default settings
      await db.query(`
        INSERT INTO system_settings (setting_name, setting_value) VALUES
        ('maintenanceMode', 'false'),
        ('debugMode', 'false'),
        ('emailNotifications', 'true'),
        ('smsNotifications', 'true');
      `)

      console.log("System settings table created and initialized")
      return { success: true, message: "System settings table created and initialized" }
    } else {
      console.log("System settings table already exists")
      return { success: true, message: "System settings table already exists" }
    }
  } catch (error) {
    console.error("Error creating system settings table:", error)
    return { success: false, error: "Failed to create system settings table" }
  }
}
