"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SMSDiagnosticsPage() {
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleTestSMS = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setResult(null)
    setLoading(true)

    try {
      const response = await fetch("/api/admin/sms-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || "Failed to send test SMS")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("An error occurred while testing SMS")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckConfig = async () => {
    setError("")
    setResult(null)
    setLoading(true)

    try {
      const response = await fetch("/api/admin/sms-config")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || "Failed to check SMS configuration")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("An error occurred while checking SMS configuration")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">SMS Diagnostics</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test SMS Delivery</CardTitle>
            <CardDescription>Send a test SMS to verify your Twilio configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTestSMS} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number with country code"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500">Format: +1XXXXXXXXXX (US), +91XXXXXXXXXX (India), etc.</p>
              </div>

              <Button type="submit" disabled={loading || !phone}>
                {loading ? "Sending..." : "Send Test SMS"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SMS Configuration</CardTitle>
            <CardDescription>Check your Twilio configuration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleCheckConfig} disabled={loading}>
              {loading ? "Checking..." : "Check Configuration"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
