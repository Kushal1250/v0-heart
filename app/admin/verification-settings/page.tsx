"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { VerificationMethodStatus } from "@/components/verification-method-status"
import { isValidPhone, isValidEmail } from "@/lib/client-validation"
import { CheckCircle, AlertTriangle, Send } from "lucide-react"

export default function VerificationSettingsPage() {
  const [activeTab, setActiveTab] = useState("sms")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [smsResult, setSmsResult] = useState<{ success?: boolean; message?: string; code?: string } | null>(null)
  const [emailResult, setEmailResult] = useState<{ success?: boolean; message?: string; code?: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTestSms = async () => {
    if (!isValidPhone(phone)) {
      setSmsResult({ success: false, message: "Please enter a valid phone number" })
      return
    }

    setLoading(true)
    setSmsResult(null)

    try {
      const response = await fetch("/api/verification/test-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (response.ok) {
        setSmsResult({ success: true, message: data.message, code: data.code })
      } else {
        setSmsResult({ success: false, message: data.message })
      }
    } catch (error) {
      setSmsResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTestEmail = async () => {
    if (!isValidEmail(email)) {
      setEmailResult({ success: false, message: "Please enter a valid email address" })
      return
    }

    setLoading(true)
    setEmailResult(null)

    try {
      const response = await fetch("/api/verification/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setEmailResult({ success: true, message: data.message, code: data.code })
      } else {
        setEmailResult({ success: false, message: data.message })
      }
    } catch (error) {
      setEmailResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Verification Settings</h1>

      <VerificationMethodStatus />

      <Card>
        <CardHeader>
          <CardTitle>Test Verification Methods</CardTitle>
          <CardDescription>Send test messages to verify your configuration is working correctly</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sms">SMS Verification</TabsTrigger>
              <TabsTrigger value="email">Email Verification</TabsTrigger>
            </TabsList>

            <TabsContent value="sms" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number (for testing)
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button onClick={handleTestSms} disabled={loading || !phone}>
                    {loading ? "Sending..." : "Send Test SMS"}
                    {!loading && <Send className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {smsResult && (
                <Alert variant={smsResult.success ? "default" : "destructive"}>
                  {smsResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>{smsResult.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {smsResult.message}
                    {smsResult.code && (
                      <div className="mt-2">
                        <span className="font-semibold">Test code: </span>
                        <code className="bg-muted px-2 py-1 rounded">{smsResult.code}</code>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="email" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address (for testing)
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="test@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button onClick={handleTestEmail} disabled={loading || !email}>
                    {loading ? "Sending..." : "Send Test Email"}
                    {!loading && <Send className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {emailResult && (
                <Alert variant={emailResult.success ? "default" : "destructive"}>
                  {emailResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>{emailResult.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {emailResult.message}
                    {emailResult.code && (
                      <div className="mt-2">
                        <span className="font-semibold">Test code: </span>
                        <code className="bg-muted px-2 py-1 rounded">{emailResult.code}</code>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            These tests will send actual messages to the provided contact information.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
