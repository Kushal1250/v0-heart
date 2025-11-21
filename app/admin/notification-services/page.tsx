"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type ServiceStatus = {
  configured: boolean
  active: boolean
  message: string
  details?: Record<string, any>
}

export default function NotificationServicesPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<ServiceStatus | null>(null)
  const [smsStatus, setSmsStatus] = useState<ServiceStatus | null>(null)

  const [emailTestTo, setEmailTestTo] = useState("")
  const [smsTestTo, setSmsTestTo] = useState("")

  const [emailTestResult, setEmailTestResult] = useState<any>(null)
  const [smsTestResult, setSmsTestResult] = useState<any>(null)

  const [emailTestLoading, setEmailTestLoading] = useState(false)
  const [smsTestLoading, setSmsTestLoading] = useState(false)

  const [activatingEmail, setActivatingEmail] = useState(false)
  const [activatingSms, setActivatingSms] = useState(false)

  useEffect(() => {
    fetchServicesStatus()
  }, [])

  async function fetchServicesStatus() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/notification-services")

      if (!response.ok) {
        throw new Error(`Failed to fetch services status: ${response.status}`)
      }

      const data = await response.json()
      setEmailStatus(data.email)
      setSmsStatus(data.sms)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch services status")
    } finally {
      setLoading(false)
    }
  }

  async function activateService(service: "email_service" | "sms_service") {
    if (service === "email_service") {
      setActivatingEmail(true)
    } else {
      setActivatingSms(true)
    }

    try {
      const response = await fetch("/api/admin/notification-services", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ service }),
      })

      if (!response.ok) {
        throw new Error(`Failed to activate service: ${response.status}`)
      }

      // Refresh status
      await fetchServicesStatus()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to activate service")
    } finally {
      if (service === "email_service") {
        setActivatingEmail(false)
      } else {
        setActivatingSms(false)
      }
    }
  }

  async function sendTestEmail() {
    if (!emailTestTo) {
      setEmailTestResult({
        success: false,
        message: "Email address is required",
      })
      return
    }

    setEmailTestLoading(true)
    setEmailTestResult(null)

    try {
      const response = await fetch("/api/admin/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: emailTestTo }),
      })

      const data = await response.json()
      setEmailTestResult(data)
    } catch (err) {
      setEmailTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to send test email",
      })
    } finally {
      setEmailTestLoading(false)
    }
  }

  async function sendTestSms() {
    if (!smsTestTo) {
      setSmsTestResult({
        success: false,
        message: "Phone number is required",
      })
      return
    }

    setSmsTestLoading(true)
    setSmsTestResult(null)

    try {
      const response = await fetch("/api/admin/test-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: smsTestTo }),
      })

      const data = await response.json()
      setSmsTestResult(data)
    } catch (err) {
      setSmsTestResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to send test SMS",
      })
    } finally {
      setSmsTestLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Notification Services</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Email Service</CardTitle>
              {emailStatus && (
                <Badge variant={emailStatus.configured && emailStatus.active ? "success" : "destructive"}>
                  {emailStatus.configured && emailStatus.active ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
            <CardDescription>Manage and test email delivery</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : emailStatus ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <p>{emailStatus.message}</p>
                </div>

                {emailStatus.details && (
                  <div>
                    <h3 className="font-medium mb-2">Configuration</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Server:</div>
                        <div>{emailStatus.details.server || "Not set"}</div>

                        <div className="font-medium">Port:</div>
                        <div>{emailStatus.details.port || "Not set"}</div>

                        <div className="font-medium">Secure:</div>
                        <div>{emailStatus.details.secure || "Not set"}</div>

                        <div className="font-medium">From:</div>
                        <div>{emailStatus.details.from || "Not set"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {(!emailStatus.configured || !emailStatus.active) && (
                  <Button onClick={() => activateService("email_service")} disabled={activatingEmail}>
                    {activatingEmail ? "Activating..." : "Activate Email Service"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">No status information available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>SMS Service</CardTitle>
              {smsStatus && (
                <Badge variant={smsStatus.configured && smsStatus.active ? "success" : "destructive"}>
                  {smsStatus.configured && smsStatus.active ? "Active" : "Inactive"}
                </Badge>
              )}
            </div>
            <CardDescription>Manage and test SMS delivery</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : smsStatus ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <p>{smsStatus.message}</p>
                </div>

                {smsStatus.details && (
                  <div>
                    <h3 className="font-medium mb-2">Configuration</h3>
                    <div className="bg-gray-50 p-3 rounded-md text-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="font-medium">Account SID:</div>
                        <div>{smsStatus.details.accountSid || "Not set"}</div>

                        <div className="font-medium">Phone Number:</div>
                        <div>{smsStatus.details.phoneNumber || "Not set"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {(!smsStatus.configured || !smsStatus.active) && (
                  <Button onClick={() => activateService("sms_service")} disabled={activatingSms}>
                    {activatingSms ? "Activating..." : "Activate SMS Service"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-4">No status information available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Test Email</TabsTrigger>
          <TabsTrigger value="sms">Test SMS</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Send Test Email</CardTitle>
              <CardDescription>Send a test email to verify your email configuration is working</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emailTo">Email Address</Label>
                  <Input
                    id="emailTo"
                    type="email"
                    placeholder="Enter recipient email address"
                    value={emailTestTo}
                    onChange={(e) => setEmailTestTo(e.target.value)}
                  />
                </div>

                {emailTestResult && (
                  <Alert variant={emailTestResult.success ? "default" : "destructive"}>
                    <AlertTitle>{emailTestResult.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{emailTestResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={sendTestEmail} disabled={emailTestLoading || !emailTestTo}>
                {emailTestLoading ? "Sending..." : "Send Test Email"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>Send Test SMS</CardTitle>
              <CardDescription>Send a test SMS to verify your Twilio configuration is working</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsTo">Phone Number</Label>
                  <Input
                    id="smsTo"
                    type="tel"
                    placeholder="Enter phone number with country code"
                    value={smsTestTo}
                    onChange={(e) => setSmsTestTo(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Format: +1XXXXXXXXXX (US), +91XXXXXXXXXX (India), etc.</p>
                </div>

                {smsTestResult && (
                  <Alert variant={smsTestResult.success ? "default" : "destructive"}>
                    <AlertTitle>{smsTestResult.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{smsTestResult.message}</AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={sendTestSms} disabled={smsTestLoading || !smsTestTo}>
                {smsTestLoading ? "Sending..." : "Send Test SMS"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Guide</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-orange-600">SMS not being sent</h3>
            <p className="mt-1 ml-6">
              Ensure all Twilio environment variables are set correctly. Verify your Twilio account has sufficient
              credits and the phone number is verified in trial accounts.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-orange-600">Email not being sent</h3>
            <p className="mt-1 ml-6">
              Check that all email configuration variables are set correctly. Make sure the email server allows
              connections from your deployment environment.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blue-600">Development vs. Production</h3>
            <p className="mt-1 ml-6">
              In development mode, SMS and email messages are simulated and logged to the console. In production, they
              are sent via their respective services.
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg font-semibold">Common Solutions</h3>
            <ul className="list-disc list-inside mt-2 ml-6 space-y-2">
              <li>Verify all environment variables are correctly set in your Vercel project settings</li>
              <li>For Gmail, you may need to enable "Less secure apps" or use an app password</li>
              <li>For Twilio trial accounts, you must verify the recipient</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
