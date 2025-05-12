import { sql } from "@/lib/db"

export async function setupProfileTables() {
  try {
    // Create user_health_data table
    await sql`
      CREATE TABLE IF NOT EXISTS user_health_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        height TEXT,
        weight TEXT,
        blood_type TEXT,
        allergies TEXT,
        medical_conditions TEXT,
        medications TEXT,
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        emergency_contact_relation TEXT,
        gender TEXT,
        date_of_birth TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create user_preferences table
    await sql`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notifications JSONB DEFAULT '{"email": true, "sms": false, "push": true, "reminders": true, "newsletter": false, "assessment_results": true}',
        data_sharing JSONB DEFAULT '{"share_with_doctors": true, "share_for_research": false, "anonymized_data_usage": true}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create user_health_services table
    await sql`
      CREATE TABLE IF NOT EXISTS user_health_services (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        service_id TEXT NOT NULL,
        service_name TEXT NOT NULL,
        service_icon TEXT,
        connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_sync TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create user_health_reminders table
    await sql`
      CREATE TABLE IF NOT EXISTS user_health_reminders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reminder_type TEXT NOT NULL,
        reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
        reminder_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log("Profile tables created successfully")
    return { success: true }
  } catch (error) {
    console.error("Error creating profile tables:", error)
    return { success: false, error }
  }
}
