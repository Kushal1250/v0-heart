"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EmailDiagnostics() {
  const [email, setEmail] = useState("")
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    previewUrl?: string
  } | null>(null)
  const [config, setConfig] = useState<{
    server?: string
    port?: string
    secure?: string
    user?: string
    from?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("test")

  async function checkEmailConfig() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/debug/email-config")
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      setConfig({
        server: "Error fetching configuration",
        port: "Error",
        secure: "Error",
        user: "Error",
        from: "Error",
      })
    }
    setIsLoading(false)
  }

  async function sendTestEmail() {
    if (!email) {
      setTestResult({
        success: false,
        message: "Please enter an email address",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          method: "email",
        }),
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Email System Diagnostics</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test">Test Email Sending</TabsTrigger>
          <TabsTrigger value="config">Email Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>
                Send a test verification code to check if your email configuration is working
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {testResult && (
                <Alert className={`mt-4 ${testResult.success ? "bg-green-50" : "bg-red-50"}`}>
                  <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription className="mt-2">
                    {testResult.message}

                    {testResult.previewUrl && (
                      <div className="mt-2">
                        <p>Preview URL:</p>
                        <a
                          href={testResult.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Test Email
                        </a>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={sendTestEmail} disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Test Email"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Check your current email server configuration</CardDescription>
            </CardHeader>
            <CardContent>
              {config ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-semibold">SMTP Server:</div>
                    <div>{config.server || "Not set"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-semibold">Port:</div>
                    <div>{config.port || "Not set"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-semibold">Secure:</div>
                    <div>{config.secure || "Not set"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-semibold">User:</div>
                    <div>{config.user ? "********" : "Not set"}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-semibold">From:</div>
                    <div>{config.from || "Not set"}</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">Click the button below to check your configuration</div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={checkEmailConfig} disabled={isLoading}>
                {isLoading ? "Checking..." : "Check Configuration"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Tips</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Make sure all environment variables are correctly set (EMAIL_SERVER, EMAIL_PORT, etc.)</li>
          <li>If using Gmail, you may need to enable "Less secure apps" or use an app password</li>
          <li>Check your firewall settings to ensure outgoing SMTP traffic is permitted</li>
          <li>Verify that your email provider allows sending from your application</li>
          <li>In development mode, emails will use a test service that provides preview links</li>
        </ul>
      </div>
    </div>
  )
}
