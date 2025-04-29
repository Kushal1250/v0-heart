"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CreateSettingsTable() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const runMigration = async () => {
    setStatus("loading")
    try {
      const response = await fetch("/api/admin/migrate/settings-table", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Settings table created successfully")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to create settings table")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An unexpected error occurred")
      console.error(error)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Create Settings Table</h2>
      <p>This will create the user_settings table if it doesn't exist.</p>

      <Button onClick={runMigration} disabled={status === "loading"}>
        {status === "loading" ? "Creating..." : "Create Settings Table"}
      </Button>

      {status === "success" && (
        <Alert className="bg-green-500/20 border-green-500">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="bg-red-500/20 border-red-500">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
