"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

export default function EmailTestPage() {
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("Test Email")
  const [message, setMessage] = useState("This is a test email from the Heart Health Predictor application.")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    previewUrl?: string
  } | null>(null)
  const [configStatus, setConfigStatus] = useState<any>(null)
  const [loadingConfig, setLoadingConfig] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/email-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to,
          subject,
          message,
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkEmailConfig = async () => {
    setLoadingConfig(true)
    try {
      const response = await fetch("/api/debug/email-config")
      const data = await response.json()
      setConfigStatus(data)
    } catch (error) {
      setConfigStatus({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setLoadingConfig(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Email Testing Tool</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>Check your current email configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkEmailConfig} disabled={loadingConfig}>
              {loadingConfig ? "Checking..." : "Check Email Configuration"}
            </Button>

            {configStatus && (
              <div className="mt-4">
                <Alert variant={configStatus.verification?.success ? "default" : "destructive"} className="mb-4">
                  {configStatus.verification?.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertTitle>
                    {configStatus.verification?.success ? "Configuration Valid" : "Configuration Error"}
                  </AlertTitle>
                  <AlertDescription>{configStatus.verification?.message}</AlertDescription>
                </Alert>

                <div className="bg-gray-100 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Configuration Details:</h3>
                  <pre className="text-xs overflow-auto">{JSON.stringify(configStatus.config, null, 2)}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>Send a test email to verify your configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="to" className="block text-sm font-medium">
                  Recipient Email
                </label>
                <Input
                  id="to"
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="block text-sm font-medium">
                  Subject
                </label>
                <Input id="subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="block text-sm font-medium">
                  Message
                </label>
                <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={4} required />
              </div>

              <Button type="submit" disabled={loading || !to}>
                {loading ? "Sending..." : "Send Test Email"}
              </Button>
            </form>

            {result && (
              <Alert variant={result.success ? "default" : "destructive"} className="mt-4">
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Email Sent" : "Failed to Send Email"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>

                {result.previewUrl && (
                  <div className="mt-2">
                    <a
                      href={result.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      <Info className="h-4 w-4 mr-1" />
                      View Email Preview
                    </a>
                  </div>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
