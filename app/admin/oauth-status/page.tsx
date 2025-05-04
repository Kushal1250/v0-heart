"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

export default function OAuthStatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/auth/oauth-status")
        if (!res.ok) {
          throw new Error(`Failed to fetch OAuth status: ${res.status}`)
        }
        const data = await res.json()
        setStatus(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  if (loading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>OAuth Configuration Status</CardTitle>
            <CardDescription>Loading configuration status...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center p-6">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>OAuth Configuration Status</CardTitle>
          <CardDescription>Current status of OAuth providers configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Google OAuth</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                {status?.google?.isConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>Configuration Status</span>
              </div>

              <div className="flex items-center">
                {status?.google?.clientIdConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>Client ID</span>
              </div>

              <div className="flex items-center">
                {status?.google?.clientSecretConfigured ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span>Client Secret</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Redirect URI</h3>
            <div className="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
              {status?.google?.redirectUri || "Not configured"}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This exact URI must be added to the authorized redirect URIs in your Google Cloud Console.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Base URL</h3>
            <div className="p-3 bg-gray-100 rounded-md font-mono text-sm break-all">
              {status?.baseUrl || "Not detected"}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Status
          </Button>
          <Button onClick={() => window.open("https://console.cloud.google.com/apis/credentials", "_blank")}>
            Google Cloud Console <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
