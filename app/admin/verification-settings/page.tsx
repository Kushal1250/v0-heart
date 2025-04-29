"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { VerificationMethodStatus } from "@/components/verification-method-status"
import { Separator } from "@/components/ui/separator"

export default function VerificationSettingsPage() {
  const [testPhone, setTestPhone] = useState("")
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTestSMS = async () => {
    if (!testPhone) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/verification/test-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: testPhone }),
      })

      const data = await response.json()

      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "SMS sent successfully" : "Failed to send SMS"),
      })
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while testing SMS",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    if (!testEmail) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/verification/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: testEmail }),
      })

      const data = await response.json()

      setResult({
        success: response.ok,
        message: data.message || (response.ok ? "Email sent successfully" : "Failed to send email"),
      })
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred while testing email",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Verification Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>SMS Verification Status</CardTitle>
            <CardDescription>Check if SMS verification is properly configured</CardDescription>
          </CardHeader>
          <CardContent>
            <VerificationMethodStatus type="sms" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Verification Status</CardTitle>
            <CardDescription>Check if email verification is properly configured</CardDescription>
          </CardHeader>
          <CardContent>
            <VerificationMethodStatus type="email" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Verification Methods</CardTitle>
          <CardDescription>Send a test verification code to verify your configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="sms" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="sms">Test SMS</TabsTrigger>
              <TabsTrigger value="email">Test Email</TabsTrigger>
            </TabsList>

            <TabsContent value="sms">
              <div className="space-y-4">
                <div>
                  <label htmlFor="testPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="testPhone"
                      type="tel"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button onClick={handleTestSMS} disabled={loading || !testPhone}>
                      {loading ? "Sending..." : "Send Test SMS"}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: +1 (555) 123-4567 or 5551234567</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="email">
              <div className="space-y-4">
                <div>
                  <label htmlFor="testEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="testEmail"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="user@example.com"
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button onClick={handleTestEmail} disabled={loading || !testEmail}>
                      {loading ? "Sending..." : "Send Test Email"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {result && (
            <>
              <Separator className="my-4" />
              <Alert
                className={
                  result.success
                    ? "bg-green-50 text-green-800 border-green-200"
                    : "bg-red-50 text-red-800 border-red-200"
                }
              >
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
