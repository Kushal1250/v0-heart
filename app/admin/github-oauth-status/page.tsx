"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Copy } from "lucide-react"

export default function GitHubOAuthStatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/auth/github-status")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Error fetching GitHub OAuth status:", error)
        setStatus({ error: "Failed to fetch GitHub OAuth status" })
      } finally {
        setLoading(false)
      }
    }

    fetchStatus()
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>GitHub OAuth Status</CardTitle>
            <CardDescription>Loading configuration status...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isConfigured = status?.clientId && status?.clientSecret

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>GitHub OAuth Status</CardTitle>
          <CardDescription>Check the status of your GitHub OAuth configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{status.error}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Client ID</h3>
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                    <code className="text-sm flex-1 overflow-hidden text-ellipsis">
                      {status?.clientId ? `${status.clientId.substring(0, 8)}...` : "Not configured"}
                    </code>
                    {status?.clientId && (
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(status.clientId)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Client Secret</h3>
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                    <code className="text-sm flex-1">
                      {status?.clientSecret ? "••••••••••••••••" : "Not configured"}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Redirect URI</h3>
                  <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
                    <code className="text-sm flex-1 break-all">{status?.redirectUri || "Not available"}</code>
                    {status?.redirectUri && (
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(status.redirectUri)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Alert variant={isConfigured ? "default" : "destructive"}>
                {isConfigured ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Status</AlertTitle>
                    <AlertDescription>GitHub OAuth appears to be properly configured.</AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Status</AlertTitle>
                    <AlertDescription>
                      GitHub OAuth is not properly configured. Please check your environment variables.
                    </AlertDescription>
                  </>
                )}
              </Alert>
            </>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <h3 className="font-medium">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Go to{" "}
              <a
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHub Developer Settings
              </a>
            </li>
            <li>Create a new OAuth App or select your existing app</li>
            <li>Set the Homepage URL to your application's URL</li>
            <li>
              Set the Authorization callback URL to exactly:{" "}
              <code className="bg-gray-100 p-1">
                {status?.redirectUri || "[Your App URL]/api/auth/github/callback"}
              </code>
            </li>
            <li>Copy the Client ID and Client Secret to your environment variables</li>
            <li>
              Set <code className="bg-gray-100 p-1">GITHUB_CLIENT_ID</code> and{" "}
              <code className="bg-gray-100 p-1">GITHUB_CLIENT_SECRET</code> in your environment
            </li>
          </ol>
        </CardFooter>
      </Card>

      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 p-2 rounded shadow-md">
          Copied to clipboard!
        </div>
      )}
    </div>
  )
}
