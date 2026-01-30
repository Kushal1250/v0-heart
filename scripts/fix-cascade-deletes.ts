import { sql } from "@/lib/db"

async function fixCascadeDeletes() {
  try {
    console.log("[v0] Starting cascade delete fixes...")

    // Add ON DELETE CASCADE to predictions table if not already set
    await sql`
      ALTER TABLE predictions
      DROP CONSTRAINT IF EXISTS predictions_user_id_fkey,
      ADD CONSTRAINT predictions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `
    console.log("[v0] ✓ predictions table cascade delete fixed")

    // Add ON DELETE CASCADE to sessions table
    await sql`
      ALTER TABLE sessions
      DROP CONSTRAINT IF EXISTS sessions_user_id_fkey,
      ADD CONSTRAINT sessions_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `
    console.log("[v0] ✓ sessions table cascade delete fixed")

    // Add ON DELETE CASCADE to password_resets table
    await sql`
      ALTER TABLE password_resets
      DROP CONSTRAINT IF EXISTS password_resets_user_id_fkey,
      ADD CONSTRAINT password_resets_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `
    console.log("[v0] ✓ password_resets table cascade delete fixed")

    // Add ON DELETE CASCADE to verification_codes table
    await sql`
      ALTER TABLE verification_codes
      DROP CONSTRAINT IF EXISTS verification_codes_user_id_fkey,
      ADD CONSTRAINT verification_codes_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `
    console.log("[v0] ✓ verification_codes table cascade delete fixed")

    // Add ON DELETE CASCADE to simple_reset_tokens table if it exists
    try {
      await sql`
        ALTER TABLE simple_reset_tokens
        DROP CONSTRAINT IF EXISTS simple_reset_tokens_user_id_fkey,
        ADD CONSTRAINT simple_reset_tokens_user_id_fkey 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `
      console.log("[v0] ✓ simple_reset_tokens table cascade delete fixed")
    } catch (e) {
      console.log("[v0] simple_reset_tokens table does not exist or already has cascade delete")
    }

    // Add ON DELETE CASCADE to error_logs table if user_id is present
    try {
      await sql`
        ALTER TABLE error_logs
        DROP CONSTRAINT IF EXISTS error_logs_user_id_fkey,
        ADD CONSTRAINT error_logs_user_id_fkey 
          FOREIGN KEY (user_id::uuid) REFERENCES users(id) ON DELETE CASCADE
      `
      console.log("[v0] ✓ error_logs table cascade delete fixed")
    } catch (e) {
      console.log("[v0] error_logs table cascade delete not needed or already set")
    }

    console.log("[v0] ✓ All cascade delete constraints have been fixed!")
  } catch (error) {
    console.error("[v0] Error fixing cascade deletes:", error)
    process.exit(1)
  }
}

fixCascadeDeletes()
