"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react"

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
    status?: string
    message?: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("test")

  async function checkEmailConfig() {
    setConfigLoading(true)
    try {
      const response = await fetch("/api/email-test")
      const data = await response.json()
      setConfig({
        ...data.config,
        status: data.status,
        message: data.message,
      })
    } catch (error) {
      setConfig({
        server: "Error fetching configuration",
        port: "Error",
        secure: "Error",
        user: "Error",
        from: "Error",
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setConfigLoading(false)
    }
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
      const response = await fetch("/api/email-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: email,
        }),
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
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
              <CardDescription>Send a test email to verify your email configuration is working</CardDescription>
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
                          className="text-blue-600 underline flex items-center gap-1"
                        >
                          View Test Email <ExternalLink className="h-3 w-3" />
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
                  <Alert
                    variant={config.status === "success" ? "default" : "destructive"}
                    className={config.status === "success" ? "bg-green-50 border-green-200" : ""}
                  >
                    <AlertTitle className="flex items-center gap-2">
                      {config.status === "success" ? (
                        <>
                          <CheckCircle className="h-4 w-4" /> Configuration Valid
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" /> Configuration Error
                        </>
                      )}
                    </AlertTitle>
                    <AlertDescription>{config.message}</AlertDescription>
                  </Alert>

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
              <Button onClick={checkEmailConfig} disabled={configLoading}>
                {configLoading ? "Checking..." : "Check Configuration"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Troubleshooting Guide</CardTitle>
          <CardDescription>Common email issues and solutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Common Email Issues
              </h3>
              <ul className="list-disc list-inside space-y-2 mt-2 ml-6">
                <li>
                  <strong>Authentication failure:</strong> Check your username and password. For Gmail, you need to use
                  an app password instead of your regular password.
                </li>
                <li>
                  <strong>Connection timeout:</strong> Your server might be blocking outgoing SMTP connections. Try
                  using port 587 with TLS instead of port 465 with SSL.
                </li>
                <li>
                  <strong>Emails marked as spam:</strong> Set up proper SPF, DKIM, and DMARC records for your domain.
                </li>
                <li>
                  <strong>Rate limiting:</strong> Some email providers limit how many emails you can send. Consider
                  using a dedicated email service like SendGrid or Mailgun.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Environment Variables</h3>
              <p className="mt-2 ml-6">Make sure the following environment variables are set correctly:</p>
              <ul className="list-disc list-inside mt-2 ml-6">
                <li>
                  <code>EMAIL_SERVER</code> - SMTP server hostname (e.g., smtp.gmail.com)
                </li>
                <li>
                  <code>EMAIL_PORT</code> - SMTP port (usually 587 for TLS or 465 for SSL)
                </li>
                <li>
                  <code>EMAIL_SECURE</code> - Set to "true" for SSL (port 465) or "false" for TLS (port 587)
                </li>
                <li>
                  <code>EMAIL_USER</code> - Your email username or address
                </li>
                <li>
                  <code>EMAIL_PASSWORD</code> - Your email password or app password
                </li>
                <li>
                  <code>EMAIL_FROM</code> - The sender email address
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Gmail-Specific Setup</h3>
              <p className="mt-2 ml-6">If you're using Gmail, you need to:</p>
              <ol className="list-decimal list-inside mt-2 ml-6 space-y-2">
                <li>Enable 2-Step Verification on your Google account</li>
                <li>Generate an App Password (Google Account → Security → App Passwords)</li>
                <li>Use this App Password instead of your regular Gmail password</li>
                <li>Use smtp.gmail.com as your EMAIL_SERVER</li>
                <li>Use port 587 and set EMAIL_SECURE to "false"</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Development vs. Production</h3>
              <p className="mt-2 ml-6">
                In development mode, the system automatically uses Ethereal Email for testing. This creates a temporary
                email account and provides a preview URL to view the sent email. No real emails are sent in development.
              </p>
              <p className="mt-2 ml-6">
                In production, the system uses the configured SMTP server to send real emails. Make sure all environment
                variables are properly set in your production environment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
