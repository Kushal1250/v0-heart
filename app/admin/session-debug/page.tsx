"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react"

export default function SessionDebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchSessionData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/auth/session-debug", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch session data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setSessionData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      setRefreshing(true)
      setError(null)

      const response = await fetch("/api/auth/refresh-session", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error(`Failed to refresh session: ${response.status} ${response.statusText}`)
      }

      await fetchSessionData()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setRefreshing(false)
    }
  }

  const clearSession = () => {
    // Clear cookies
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

    // Clear localStorage
    localStorage.removeItem("user")
    localStorage.removeItem("userExpiry")

    // Refresh data
    fetchSessionData()
  }

  const forceLogin = () => {
    window.location.href = "/admin-login?redirect=/admin/session-debug"
  }

  useEffect(() => {
    fetchSessionData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "authenticated":
        return "text-green-600"
      case "expired_session":
        return "text-amber-600"
      case "invalid_session":
        return "text-red-600"
      case "unauthenticated":
        return "text-red-600"
      case "user_not_found":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Session Debug</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-4 mb-6">
        <Button variant="outline" onClick={fetchSessionData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Loading..." : "Refresh"}
        </Button>

        <Button variant="outline" onClick={refreshSession} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Session"}
        </Button>

        <Button variant="outline" onClick={clearSession}>
          Clear Session
        </Button>

        <Button variant="default" onClick={forceLogin}>
          Force Login
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading session data...</div>
      ) : sessionData ? (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className={getStatusColor(sessionData.status)}>
                  {sessionData.status === "authenticated" ? (
                    <CheckCircle2 className="inline-block mr-2 h-5 w-5" />
                  ) : (
                    <AlertCircle className="inline-block mr-2 h-5 w-5" />
                  )}
                </span>
                Session Status: {sessionData.status}
              </CardTitle>
              <CardDescription>{sessionData.message}</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookie Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Session Cookie:</span>{" "}
                  {sessionData.cookieInfo.sessionExists ? "Present" : "Missing"}
                </div>
                <div>
                  <span className="font-medium">Admin Cookie:</span>{" "}
                  {sessionData.cookieInfo.isAdminCookie ? "Present" : "Missing"}
                </div>
                <div className="mt-4">
                  <span className="font-medium">All Cookies:</span>
                  <pre className="mt-2 p-4 bg-gray-50 rounded-md overflow-auto text-sm">
                    {JSON.stringify(sessionData.cookieInfo.allCookies, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {sessionData.sessionInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Session Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Expires At:</span>{" "}
                    {new Date(sessionData.sessionInfo.expiresAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Created At:</span>{" "}
                    {new Date(sessionData.sessionInfo.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Is Expired:</span> {sessionData.sessionInfo.isExpired ? "Yes" : "No"}
                  </div>
                  {!sessionData.sessionInfo.isExpired && (
                    <div>
                      <span className="font-medium">Time Remaining:</span>{" "}
                      {Math.floor(sessionData.sessionInfo.timeRemaining / (1000 * 60 * 60))} hours,{" "}
                      {Math.floor((sessionData.sessionInfo.timeRemaining % (1000 * 60 * 60)) / (1000 * 60))} minutes
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {sessionData.userInfo && (
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">ID:</span> {sessionData.userInfo.id}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {sessionData.userInfo.email}
                  </div>
                  <div>
                    <span className="font-medium">Name:</span> {sessionData.userInfo.name || "Not set"}
                  </div>
                  <div>
                    <span className="font-medium">Role:</span> {sessionData.userInfo.role}
                  </div>
                  <div>
                    <span className="font-medium">Is Admin:</span> {sessionData.userInfo.isAdmin ? "Yes" : "No"}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Raw Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-50 rounded-md overflow-auto text-sm">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12">No session data available</div>
      )}
    </div>
  )
}
