"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function CreateProfileTables() {
  const [status, setStatus] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<boolean>(false)

  const runMigration = async () => {
    setLoading(true)
    setStatus("Starting migration...")
    setError("")
    setSuccess(false)

    try {
      setStatus("Creating user health data table...")
      const healthDataResponse = await fetch("/api/admin/migrate/health-data-table", {
        method: "POST",
      })

      if (!healthDataResponse.ok) {
        throw new Error("Failed to create health data table")
      }

      setStatus("Creating user preferences table...")
      const preferencesResponse = await fetch("/api/admin/migrate/preferences-table", {
        method: "POST",
      })

      if (!preferencesResponse.ok) {
        throw new Error("Failed to create preferences table")
      }

      setStatus("Creating connected health services table...")
      const servicesResponse = await fetch("/api/admin/migrate/connected-services-table", {
        method: "POST",
      })

      if (!servicesResponse.ok) {
        throw new Error("Failed to create connected services table")
      }

      setStatus("Creating health reminders table...")
      const remindersResponse = await fetch("/api/admin/migrate/health-reminders-table", {
        method: "POST",
      })

      if (!remindersResponse.ok) {
        throw new Error("Failed to create health reminders table")
      }

      setStatus("Migration completed successfully!")
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "An error occurred during migration")
      setStatus("Migration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="text-xl font-bold mb-4">Create Profile Tables</h2>

      <div className="mb-4">
        <p>Run this migration to create all tables needed for profile functionality:</p>
        <ul className="list-disc pl-5 my-2">
          <li>user_health_data</li>
          <li>user_preferences</li>
          <li>connected_health_services</li>
          <li>health_reminders</li>
        </ul>
      </div>

      <Button onClick={runMigration} disabled={loading}>
        {loading ? "Running Migration..." : "Run Migration"}
      </Button>

      {status && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <p>{status}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
          <p>Migration completed successfully!</p>
        </div>
      )}
    </div>
  )
}
