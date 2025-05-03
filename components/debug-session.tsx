"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DebugSession() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkSession = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/debug/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to check session: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setDebugData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <Card className="mt-6 bg-slate-50">
      <CardHeader className="bg-slate-100">
        <CardTitle className="text-sm font-medium">Session Debugging</CardTitle>
        <CardDescription>Check session status and authentication</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 text-xs font-mono">
        {loading && <p>Loading session information...</p>}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {debugData && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Session Status:</h3>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Has Token: {debugData.session.hasToken ? "✅" : "❌"}</li>
                <li>Valid Token: {debugData.session.isValidToken ? "✅" : "❌"}</li>
                <li>User Found: {debugData.session.userFound ? "✅" : "❌"}</li>
                {debugData.session.userId && <li>User ID: {debugData.session.userId}</li>}
                {debugData.session.userEmail && <li>Email: {debugData.session.userEmail}</li>}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-1">Cookie Information:</h3>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Cookie Exists: {debugData.cookie.exists ? "✅" : "❌"}</li>
                {debugData.cookie.name && <li>Cookie Name: {debugData.cookie.name}</li>}
                {debugData.cookie.value && <li>Cookie Value: {debugData.cookie.value}</li>}
                {debugData.cookie.path && <li>Cookie Path: {debugData.cookie.path}</li>}
                {debugData.cookie.expires && <li>Cookie Expires: {debugData.cookie.expires}</li>}
              </ul>
            </div>

            {debugData.user ? (
              <div>
                <h3 className="font-semibold mb-1">User Information:</h3>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>ID: {debugData.user.id}</li>
                  <li>Email: {debugData.user.email}</li>
                  <li>Name: {debugData.user.name || "Not set"}</li>
                  <li>Role: {debugData.user.role}</li>
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-1 text-red-500">User Information:</h3>
                <p className="text-red-500">No authenticated user found</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-4">
          <Button size="sm" variant="outline" onClick={checkSession} disabled={loading}>
            {loading ? "Checking..." : "Refresh Debug Info"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
