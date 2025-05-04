"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Copy, ExternalLink } from "lucide-react"

export default function GitHubSetupGuidePage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        const response = await fetch("/api/auth/github-debug")
        const data = await response.json()
        setDebugInfo(data)
      } catch (error) {
        console.error("Error fetching GitHub debug info:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDebugInfo()
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>GitHub OAuth Setup Guide</CardTitle>
            <CardDescription>Loading configuration information...</CardDescription>
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

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>GitHub OAuth Setup Guide</CardTitle>
          <CardDescription>Follow these steps to properly configure GitHub OAuth</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              The redirect URI in your GitHub OAuth application must exactly match what your application is using.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 1: Access GitHub Developer Settings</h3>
            <p>
              Go to{" "}
              <a
                href="https://github.com/settings/developers"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 inline-flex"
              >
                GitHub Developer Settings <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 2: Configure Your OAuth Application</h3>
            <p>Create a new OAuth App or select your existing app and configure it with these settings:</p>

            <div className="space-y-4 bg-gray-50 p-4 rounded-md">
              <div>
                <h4 className="font-medium">Application Name</h4>
                <p className="text-sm text-gray-600">HeartPredict (or your preferred name)</p>
              </div>

              <div>
                <h4 className="font-medium">Homepage URL</h4>
                <div className="flex items-center gap-2 bg-white p-2 rounded border mt-1">
                  <code className="text-sm flex-1 break-all">{debugInfo?.baseUrl || "https://your-app-url.com"}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(debugInfo?.baseUrl || "https://your-app-url.com", "homepage")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied === "homepage" && <p className="text-green-600 text-xs mt-1">Copied!</p>}
              </div>

              <div>
                <h4 className="font-medium">Authorization callback URL</h4>
                <div className="flex items-center gap-2 bg-white p-2 rounded border mt-1">
                  <code className="text-sm flex-1 break-all">
                    {debugInfo?.redirectUri || "https://your-app-url.com/api/auth/github/callback"}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        debugInfo?.redirectUri || "https://your-app-url.com/api/auth/github/callback",
                        "callback",
                      )
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied === "callback" && <p className="text-green-600 text-xs mt-1">Copied!</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 3: Set Environment Variables</h3>
            <p>Add these environment variables to your Vercel project:</p>

            <div className="space-y-4 bg-gray-50 p-4 rounded-md">
              <div>
                <h4 className="font-medium">GITHUB_CLIENT_ID</h4>
                <p className="text-sm text-gray-600">Your GitHub OAuth App Client ID</p>
              </div>

              <div>
                <h4 className="font-medium">GITHUB_CLIENT_SECRET</h4>
                <p className="text-sm text-gray-600">Your GitHub OAuth App Client Secret</p>
              </div>

              <div>
                <h4 className="font-medium">NEXT_PUBLIC_APP_URL</h4>
                <div className="flex items-center gap-2 bg-white p-2 rounded border mt-1">
                  <code className="text-sm flex-1 break-all">{debugInfo?.baseUrl || "https://your-app-url.com"}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(debugInfo?.baseUrl || "https://your-app-url.com", "app_url")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copied === "app_url" && <p className="text-green-600 text-xs mt-1">Copied!</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Configuration</h3>

            <div className="space-y-4 bg-gray-50 p-4 rounded-md">
              <div>
                <h4 className="font-medium">Base URL</h4>
                <p className="text-sm break-all">{debugInfo?.baseUrl || "Not available"}</p>
              </div>

              <div>
                <h4 className="font-medium">Redirect URI</h4>
                <p className="text-sm break-all">{debugInfo?.redirectUri || "Not available"}</p>
              </div>

              <div>
                <h4 className="font-medium">Client ID Configured</h4>
                <p className="text-sm">
                  {debugInfo?.clientIdConfigured ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> No
                    </span>
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Client Secret Configured</h4>
                <p className="text-sm">
                  {debugInfo?.clientSecretConfigured ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> No
                    </span>
                  )}
                </p>
              </div>

              <div>
                <h4 className="font-medium">Environment</h4>
                <p className="text-sm">{debugInfo?.environment || "Not available"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Possible Redirect URIs</h3>
            <p className="text-sm">Make sure one of these exact URIs is configured in your GitHub OAuth application:</p>

            <div className="space-y-2">
              {debugInfo?.possibleRedirectUris?.map((uri: string, index: number) => (
                <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border">
                  <code className="text-sm flex-1 break-all">{uri}</code>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(uri, `uri-${index}`)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  {copied === `uri-${index}` && <span className="text-green-600 text-xs">Copied!</span>}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Information
          </Button>
          <Button
            onClick={() => window.open("https://github.com/settings/developers", "_blank")}
            className="flex items-center gap-2"
          >
            Go to GitHub Developer Settings <ExternalLink className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
