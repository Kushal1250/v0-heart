import { neon } from "@neondatabase/serverless"

export async function updateUsersTable() {
  try {
    const sql = neon(process.env.DATABASE_URL)

    // Check if columns already exist
    const checkColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('address', 'occupation', 'birthdate', 'bio', 'emergency_contact', 'emergency_phone')
    `

    // If all columns exist, no need to update
    if (checkColumns.length === 6) {
      console.log("Users table already has all required columns")
      return { success: true, message: "Users table already has all required columns" }
    }

    // Add missing columns
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS occupation TEXT,
      ADD COLUMN IF NOT EXISTS birthdate DATE,
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
      ADD COLUMN IF NOT EXISTS emergency_phone TEXT
    `

    console.log("Users table updated successfully")
    return { success: true, message: "Users table updated successfully" }
  } catch (error) {
    console.error("Error updating users table:", error)
    return { success: false, error: error.message }
  }
}
