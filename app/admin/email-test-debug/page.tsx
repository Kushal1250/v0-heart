"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EmailTestDebug() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)

  const testEmailConfig = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/email-test/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testEmail: email || "test@example.com" }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkConfig = async () => {
    setLoading(true)
    setConfigStatus(null)

    try {
      const response = await fetch("/api/admin/email-test/")
      const data = await response.json()
      setConfigStatus(data)
    } catch (error) {
      setConfigStatus({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration Test</CardTitle>
            <CardDescription>Test your email service configuration and verify SMTP connectivity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkConfig} disabled={loading} variant="outline" className="w-full bg-transparent">
              {loading ? "Checking..." : "Check Email Configuration"}
            </Button>

            {configStatus && (
              <Alert className={configStatus.success ? "bg-green-50" : "bg-red-50"}>
                <AlertDescription className="text-sm">
                  <div className="font-semibold mb-2">Configuration Status:</div>
                  <div className="space-y-1 text-xs font-mono">
                    {configStatus.config ? (
                      <>
                        <div>Server: {configStatus.config.server || "NOT SET"}</div>
                        <div>Port: {configStatus.config.port || "NOT SET"}</div>
                        <div>Secure: {configStatus.config.secure || "NOT SET"}</div>
                        <div>User: {configStatus.config.user || "NOT SET"}</div>
                        <div>From: {configStatus.config.from || "NOT SET"}</div>
                      </>
                    ) : (
                      <div>Error: {configStatus.message || configStatus.error || "Unknown error"}</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>Send a test email to verify SMTP functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Test Email Address</label>
              <Input
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button onClick={testEmailConfig} disabled={loading || !email} className="w-full">
              {loading ? "Sending..." : "Send Test Email"}
            </Button>

            {result && (
              <Alert className={result.success ? "bg-green-50" : "bg-red-50"}>
                <AlertDescription className="text-sm">
                  <div className="font-semibold mb-2">{result.success ? "Success!" : "Failed"}</div>
                  <div className="space-y-1 text-xs">
                    {result.messageId && <div>Message ID: {result.messageId}</div>}
                    {result.error && <div className="text-red-600">Error: {result.error}</div>}
                    {result.message && <div>{result.message}</div>}
                    {result.previewUrl && (
                      <div>
                        <a href={result.previewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          Preview Email
                        </a>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Required Environment Variables</CardTitle>
            <CardDescription>Make sure these are set in your Vercel project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div className="bg-gray-100 p-2 rounded">EMAIL_SERVER (SMTP host)</div>
              <div className="bg-gray-100 p-2 rounded">EMAIL_PORT (e.g., 587 or 465)</div>
              <div className="bg-gray-100 p-2 rounded">EMAIL_USER (SMTP username)</div>
              <div className="bg-gray-100 p-2 rounded">EMAIL_PASSWORD (SMTP password)</div>
              <div className="bg-gray-100 p-2 rounded">EMAIL_FROM (sender email address)</div>
              <div className="bg-gray-100 p-2 rounded">EMAIL_SECURE (true/false)</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
