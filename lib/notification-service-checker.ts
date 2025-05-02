"use server"

import { neon } from "@neondatabase/serverless"
import { logError } from "./error-logger"

type ServiceStatus = {
  configured: boolean
  active: boolean
  message: string
  details?: Record<string, any>
}

export async function checkEmailConfiguration(): Promise<ServiceStatus> {
  try {
    const requiredVars = ["EMAIL_SERVER", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASSWORD", "EMAIL_FROM"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return {
        configured: false,
        active: false,
        message: `Missing required email configuration: ${missingVars.join(", ")}`,
        details: {
          missingVars,
          environment: process.env.NODE_ENV,
        },
      }
    }

    // Check if the service is marked as active in the database
    const isActive = await isServiceActiveInDb("email_service")

    return {
      configured: true,
      active: isActive,
      message: isActive
        ? "Email service is properly configured and active"
        : "Email service is configured but not marked as active in the database",
      details: {
        server: process.env.EMAIL_SERVER,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === "true" ? "Yes" : "No",
        from: process.env.EMAIL_FROM,
      },
    }
  } catch (error) {
    logError("checkEmailConfiguration", error)
    return {
      configured: false,
      active: false,
      message: `Error checking email configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    }
  }
}

export async function checkSmsConfiguration(): Promise<ServiceStatus> {
  try {
    const requiredVars = ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"]
    const missingVars = requiredVars.filter((varName) => !process.env[varName])

    if (missingVars.length > 0) {
      return {
        configured: false,
        active: false,
        message: `Missing required SMS configuration: ${missingVars.join(", ")}`,
        details: {
          missingVars,
          environment: process.env.NODE_ENV,
        },
      }
    }

    // Check if the service is marked as active in the database
    const isActive = await isServiceActiveInDb("sms_service")

    return {
      configured: true,
      active: isActive,
      message: isActive
        ? "SMS service is properly configured and active"
        : "SMS service is configured but not marked as active in the database",
      details: {
        accountSid: `${process.env.TWILIO_ACCOUNT_SID?.substring(0, 5)}...`,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER,
      },
    }
  } catch (error) {
    logError("checkSmsConfiguration", error)
    return {
      configured: false,
      active: false,
      message: `Error checking SMS configuration: ${error instanceof Error ? error.message : "Unknown error"}`,
      details: { error: error instanceof Error ? error.message : "Unknown error" },
    }
  }
}

async function isServiceActiveInDb(serviceName: string): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) {
      return false
    }

    const sql = neon(process.env.DATABASE_URL)

    // Check if system_settings table exists
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'system_settings'
      );
    `

    if (!tableExists[0]?.exists) {
      // Create the table if it doesn't exist
      await sql`
        CREATE TABLE IF NOT EXISTS system_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `

      // Insert default values
      await sql`
        INSERT INTO system_settings (key, value)
        VALUES 
          ('email_service', 'active'),
          ('sms_service', 'active')
        ON CONFLICT (key) DO NOTHING;
      `

      return true
    }

    // Check if the service is active
    const result = await sql`
      SELECT value FROM system_settings WHERE key = ${serviceName};
    `

    if (result.length === 0) {
      // Insert default value if not found
      await sql`
        INSERT INTO system_settings (key, value)
        VALUES (${serviceName}, 'active');
      `
      return true
    }

    return result[0]?.value === "active"
  } catch (error) {
    console.error(`Error checking service status in DB: ${error}`)
    // Default to true if we can't check the database
    return true
  }
}

export async function activateService(serviceName: string): Promise<boolean> {
  try {
    if (!process.env.DATABASE_URL) {
      return false
    }

    const sql = neon(process.env.DATABASE_URL)

    // Create the table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS system_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Update or insert the service status
    await sql`
      INSERT INTO system_settings (key, value, updated_at)
      VALUES (${serviceName}, 'active', CURRENT_TIMESTAMP)
      ON CONFLICT (key) DO UPDATE
      SET value = 'active', updated_at = CURRENT_TIMESTAMP;
    `

    return true
  } catch (error) {
    logError(`activateService-${serviceName}`, error)
    return false
  }
}

export async function getNotificationServicesStatus(): Promise<{
  email: ServiceStatus
  sms: ServiceStatus
}> {
  const email = await checkEmailConfiguration()
  const sms = await checkSmsConfiguration()

  return { email, sms }
}
