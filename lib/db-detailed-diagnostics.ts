import { db } from "./db"

/**
 * Performs detailed diagnostics on the database connection and permissions
 */
export async function performDetailedDiagnostics() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    tests: {},
  }

  // Test 1: Basic connection
  try {
    const connectionResult = await db.query("SELECT NOW() as time")
    results.tests.basicConnection = {
      success: true,
      message: "Database connection successful",
      timestamp: connectionResult.rows[0].time,
    }
  } catch (error) {
    results.tests.basicConnection = {
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : String(error),
    }
    // If basic connection fails, return early as other tests will fail too
    return results
  }

  // Test 2: Check database version
  try {
    const versionResult = await db.query("SELECT version()")
    results.tests.databaseVersion = {
      success: true,
      version: versionResult.rows[0].version,
    }
  } catch (error) {
    results.tests.databaseVersion = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  // Test 3: Check user permissions
  try {
    const permissionsResult = await db.query(`
      SELECT 
        has_table_privilege(current_user, 'password_reset_tokens', 'SELECT') as can_select,
        has_table_privilege(current_user, 'password_reset_tokens', 'INSERT') as can_insert,
        has_table_privilege(current_user, 'password_reset_tokens', 'UPDATE') as can_update,
        has_table_privilege(current_user, 'password_reset_tokens', 'DELETE') as can_delete
    `)

    results.tests.tablePermissions = {
      success: true,
      permissions: permissionsResult.rows[0],
    }

    // Check if user can create/drop tables
    const schemaPermissionsResult = await db.query(`
      SELECT 
        has_schema_privilege(current_user, 'public', 'CREATE') as can_create,
        has_schema_privilege(current_user, 'public', 'USAGE') as can_use
    `)

    results.tests.schemaPermissions = {
      success: true,
      permissions: schemaPermissionsResult.rows[0],
    }
  } catch (error) {
    results.tests.permissions = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  // Test 4: Check if table exists
  try {
    const tableExistsResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      )
    `)

    const tableExists = tableExistsResult.rows[0].exists

    results.tests.tableExists = {
      success: true,
      exists: tableExists,
    }

    // If table exists, check its structure
    if (tableExists) {
      const tableStructureResult = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'password_reset_tokens'
      `)

      results.tests.tableStructure = {
        success: true,
        columns: tableStructureResult.rows,
      }

      // Check for foreign key constraints
      const constraintsResult = await db.query(`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          LEFT JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'password_reset_tokens'
      `)

      results.tests.tableConstraints = {
        success: true,
        constraints: constraintsResult.rows,
      }
    }
  } catch (error) {
    results.tests.tableStructure = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  // Test 5: Try to create a test table
  try {
    // Create a unique test table name
    const testTableName = `test_table_${Date.now()}`

    // Try to create and then drop a test table
    await db.query(`
      CREATE TABLE ${testTableName} (
        id SERIAL PRIMARY KEY,
        test_column TEXT
      )
    `)

    await db.query(`DROP TABLE ${testTableName}`)

    results.tests.createTablePermission = {
      success: true,
      message: "Successfully created and dropped test table",
    }
  } catch (error) {
    results.tests.createTablePermission = {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return results
}

/**
 * Attempts to fix the password_reset_tokens table with detailed error reporting
 */
export async function fixResetTokensTableWithDetails() {
  try {
    console.log("Starting fix operation for password_reset_tokens table")

    // Step 1: Check if table exists
    const tableExistsResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'password_reset_tokens'
      )
    `)

    const tableExists = tableExistsResult.rows[0].exists
    console.log(`Table exists check: ${tableExists}`)

    // Step 2: If table exists, check for dependencies
    let dependencies = []
    if (tableExists) {
      console.log("Checking for dependencies before dropping table")

      // Check for foreign key constraints referencing this table
      const dependenciesResult = await db.query(`
        SELECT
          tc.table_name AS dependent_table,
          tc.constraint_name
        FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
        WHERE
          ccu.table_name = 'password_reset_tokens'
          AND tc.constraint_type = 'FOREIGN KEY'
      `)

      dependencies = dependenciesResult.rows
      console.log(`Found ${dependencies.length} dependencies`)

      // If there are dependencies, we need to drop them first
      for (const dep of dependencies) {
        console.log(`Dropping constraint ${dep.constraint_name} from table ${dep.dependent_table}`)
        await db.query(`
          ALTER TABLE ${dep.dependent_table}
          DROP CONSTRAINT ${dep.constraint_name}
        `)
      }
    }

    // Step 3: Drop the table if it exists (with CASCADE to force drop)
    if (tableExists) {
      console.log("Dropping existing table")
      await db.query(`DROP TABLE IF EXISTS password_reset_tokens CASCADE`)
    }

    // Step 4: Create the table with a simple structure
    console.log("Creating new table")
    await db.query(`
      CREATE TABLE password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        is_valid BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Step 5: Create indexes
    console.log("Creating indexes")
    await db.query(`CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token)`)
    await db.query(`CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)`)

    console.log("Fix operation completed successfully")
    return {
      success: true,
      message: "Reset tokens table recreated successfully",
      dependencies: dependencies.length > 0 ? dependencies : undefined,
    }
  } catch (error) {
    console.error("Error fixing reset tokens table:", error)
    return {
      success: false,
      message: "Error fixing reset tokens table",
      error: error instanceof Error ? error.message : String(error),
      errorObject: error,
    }
  }
}
