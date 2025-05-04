"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function FacebookOAuthStatusPage() {
  const [status, setStatus] = useState<{
    clientId: boolean
    clientSecret: boolean
    redirectUri: string
    baseUrl: string
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch("/api/auth/facebook-status")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Error checking Facebook OAuth status:", error)
        setStatus({
          clientId: false,
          clientSecret: false,
          redirectUri: "",
          baseUrl: "",
          error: error.message || "Failed to check Facebook OAuth status",
        })
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Facebook OAuth Status</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {status?.error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{status.error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Facebook OAuth Configuration</CardTitle>
              <CardDescription>Check your Facebook OAuth configuration status and setup instructions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  {status?.clientId ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Facebook Client ID</span>
                </div>

                <div className="flex items-center space-x-2">
                  {status?.clientSecret ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Facebook Client Secret</span>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">Redirect URI</h3>
                <div className="bg-gray-100 p-3 rounded-md break-all">{status?.redirectUri || "Not available"}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Add this exact URI to your Facebook App's Valid OAuth Redirect URIs
                </p>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">Base URL</h3>
                <div className="bg-gray-100 p-3 rounded-md break-all">{status?.baseUrl || "Not available"}</div>
                <p className="text-sm text-gray-500 mt-1">Add this domain to your Facebook App's App Domains</p>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Setup Instructions</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    Go to{" "}
                    <a
                      href="https://developers.facebook.com/apps/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Facebook Developers
                    </a>{" "}
                    and select your app
                  </li>
                  <li>Navigate to "App Settings" &gt; "Basic"</li>
                  <li>
                    Add your domain to "App Domains" (e.g., <code>vercel.app</code> or your custom domain)
                  </li>
                  <li>Go to "Products" &gt; "Facebook Login" &gt; "Settings"</li>
                  <li>Add the exact Redirect URI shown above to "Valid OAuth Redirect URIs"</li>
                  <li>Save changes</li>
                </ol>
              </div>

              <div className="mt-6">
                <Button onClick={() => window.location.reload()}>Refresh Status</Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
