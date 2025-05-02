"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function FixIssuesPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const router = useRouter()
  const { isAdmin, refreshSession } = useAuth()

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we're already authenticated via context
        if (isAdmin) {
          setIsAuthenticated(true)
          return
        }

        // Try to refresh the session
        const refreshed = await refreshSession()
        if (refreshed) {
          setIsAuthenticated(true)
          return
        }

        // Check if admin cookie is set
        if (document.cookie.includes("is_admin=true")) {
          setIsAuthenticated(true)
          return
        }

        // If all else fails, check with the server
        const response = await fetch("/api/auth/user")
        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false)
          }
        } else {
          const data = await response.json()
          if (!data.user || data.user.role !== "admin") {
            setIsAuthenticated(false)
          }
        }
      } catch (err) {
        console.error("Error checking auth:", err)
        // On error, assume we're not authenticated
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [isAdmin, refreshSession])

  const runFixes = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/fix-issues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important to include credentials
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setIsAuthenticated(false)
          throw new Error("Authentication required. Please log in again.")
        }

        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to run fixes: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run system fixes")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRelogin = () => {
    // Clear any existing session
    document.cookie = "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
    document.cookie = "is_admin=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"

    // Redirect to admin login with the current URL as the redirect target
    router.push(`/admin-login?redirect=${encodeURIComponent("/admin/fix-issues")}`)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fix System Issues</h1>
      </div>

      {!isAuthenticated ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Your session has expired or you don't have the required permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Session Expired</AlertTitle>
              <AlertDescription>Please log in again to continue using the admin tools.</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={handleRelogin}>Log In Again</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>System Repair Tool</CardTitle>
            <CardDescription>
              This tool will attempt to fix common issues with the application. Use this if you're experiencing errors
              with verification codes or other functionality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Running this tool will make changes to your database. It's recommended to backup your data first.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={runFixes} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running Fixes...
                </>
              ) : (
                "Run System Fixes"
              )}
            </Button>
            <Button variant="outline" onClick={() => router.refresh()}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh Page
            </Button>
          </CardFooter>
        </Card>
      )}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fix Results</CardTitle>
            <CardDescription>Results of the system repair process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <Alert
                  key={index}
                  className={result.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}
                >
                  <div className="flex items-start">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    )}
                    <div>
                      <AlertTitle>{result.success ? "Success" : "Failed"}</AlertTitle>
                      <AlertDescription>
                        <p>{result.message}</p>
                        {result.details && (
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        )}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
