"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function OAuthStatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/auth/oauth-status")
        if (!response.ok) {
          throw new Error("Failed to fetch OAuth status")
        }
        const data = await response.json()
        setStatus(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">OAuth Configuration Status</h1>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Google OAuth Configuration</CardTitle>
              <CardDescription>Status of your Google OAuth integration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Client ID:</span>
                  <span className="flex items-center">
                    {status.google.clientIdConfigured ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        Configured
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        Not Configured
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Client Secret:</span>
                  <span className="flex items-center">
                    {status.google.clientSecretConfigured ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        Configured
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        Not Configured
                      </>
                    )}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Redirect URI:</h3>
                  <code className="bg-gray-100 p-2 rounded block overflow-x-auto">{status.google.redirectUri}</code>
                  <p className="text-sm text-gray-500 mt-2">
                    This exact URI must be added to your Google Cloud Console.
                  </p>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Base URL:</h3>
                  <code className="bg-gray-100 p-2 rounded block overflow-x-auto">{status.baseUrl}</code>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button onClick={() => (window.location.href = "/api/auth/google")}>Test Google Sign In</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>Follow these steps to configure Google OAuth</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal pl-5 space-y-4">
                <li>
                  Go to the{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google Cloud Console
                  </a>
                </li>
                <li>Create a new project or select an existing one</li>
                <li>Navigate to "APIs & Services" &gt; "Credentials"</li>
                <li>Click "Create Credentials" &gt; "OAuth client ID"</li>
                <li>Select "Web application" as the application type</li>
                <li>Add a name for your OAuth client</li>
                <li>
                  Under "Authorized redirect URIs", add <strong>exactly</strong> this URI:
                  <code className="bg-gray-100 p-2 rounded block mt-2 overflow-x-auto">
                    {status.google.redirectUri}
                  </code>
                </li>
                <li>Click "Create"</li>
                <li>Copy the Client ID and Client Secret</li>
                <li>
                  Add them to your environment variables:
                  <code className="bg-gray-100 p-2 rounded block mt-2">
                    GOOGLE_CLIENT_ID=your_client_id
                    <br />
                    GOOGLE_CLIENT_SECRET=your_client_secret
                  </code>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
