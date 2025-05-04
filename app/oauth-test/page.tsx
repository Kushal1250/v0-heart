"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function OAuthTestPage() {
  const [config, setConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/api/auth/oauth-debug")
        const data = await response.json()
        setConfig(data)
        setLoading(false)
      } catch (err) {
        setError("Failed to load OAuth configuration")
        setLoading(false)
      }
    }

    fetchConfig()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Google OAuth Configuration Test</CardTitle>
          <CardDescription>Use this page to verify your Google OAuth configuration</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading configuration...</p>
          ) : error ? (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Current Configuration</h3>
                <div className="mt-2 p-4 bg-muted rounded-md">
                  <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(config, null, 2)}</pre>
                </div>
              </div>

              <Alert>
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Make sure the redirect URI shown above is EXACTLY the same as what you&apos;ve configured in Google
                  Cloud Console.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh
          </Button>
          <Button onClick={() => (window.location.href = "/api/auth/google")}>Test Google Sign In</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
