"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, Send, Info } from "lucide-react"

export default function SMSDiagnosticsPage() {
  const [phone, setPhone] = useState("")
  const [testResult, setTestResult] = useState<any>(null)
  const [configResult, setConfigResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("test")

  const handleTestSMS = async () => {
    if (!phone) {
      setTestResult({
        success: false,
        message: "Please enter a phone number",
      })
      return
    }

    setLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/admin/sms-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()
      setTestResult(data)
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkSMSConfig = async () => {
    setLoading(true)
    setConfigResult(null)

    try {
      const response = await fetch("/api/admin/sms-config")
      const data = await response.json()
      setConfigResult(data)
    } catch (error) {
      setConfigResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">SMS Diagnostics</h1>
      <p className="text-muted-foreground">Use this page to test and diagnose SMS sending functionality.</p>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test">Test SMS</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Send Test SMS</CardTitle>
              <CardDescription>Send a test SMS message to verify your Twilio configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <div className="flex space-x-2">
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Button onClick={handleTestSMS} disabled={loading || !phone}>
                    {loading ? "Sending..." : "Send Test SMS"}
                    {!loading && <Send className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {testResult && (
                <Alert variant={testResult.success ? "success" : "destructive"}>
                  {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>
                    {testResult.message}
                    {testResult.sid && (
                      <div className="mt-2">
                        <span className="font-semibold">Message SID: </span>
                        <code className="bg-muted px-2 py-1 rounded">{testResult.sid}</code>
                      </div>
                    )}
                    {testResult.debugInfo && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm">Debug Information</summary>
                        <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-auto">
                          {JSON.stringify(testResult.debugInfo, null, 2)}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Configuration</CardTitle>
              <CardDescription>Check your SMS configuration settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={checkSMSConfig} disabled={loading}>
                {loading ? "Checking..." : "Check Configuration"}
                {!loading && <Info className="ml-2 h-4 w-4" />}
              </Button>

              {configResult && (
                <Alert variant={configResult.success ? "success" : "destructive"}>
                  {configResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>{configResult.success ? "Configuration Valid" : "Configuration Error"}</AlertTitle>
                  <AlertDescription>
                    {configResult.message}
                    {configResult.details && (
                      <div className="mt-2 space-y-2">
                        <h4 className="font-semibold">Configuration Details:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {Object.entries(configResult.details).map(([key, value]: [string, any]) => (
                            <li key={key}>
                              <span className="font-medium">{key}:</span>{" "}
                              {typeof value === "boolean" ? (value ? "✅" : "❌") : value}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {configResult.missingEnvVars && configResult.missingEnvVars.length > 0 && (
                      <div className="mt-2">
                        <h4 className="font-semibold">Missing Environment Variables:</h4>
                        <ul className="list-disc pl-5">
                          {configResult.missingEnvVars.map((variable: string) => (
                            <li key={variable}>{variable}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Make sure all required environment variables are set correctly.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>SMS Troubleshooting Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Common Issues:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <span className="font-medium">Missing Environment Variables</span> - Ensure TWILIO_ACCOUNT_SID,
                TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER are set
              </li>
              <li>
                <span className="font-medium">Invalid Phone Number Format</span> - Phone numbers should be in E.164
                format (+1XXXXXXXXXX)
              </li>
              <li>
                <span className="font-medium">Twilio Account Restrictions</span> - Trial accounts can only send to
                verified numbers
              </li>
              <li>
                <span className="font-medium">Insufficient Twilio Credits</span> - Check your Twilio account balance
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Recommended Actions:</h3>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Verify your Twilio credentials in the Twilio dashboard</li>
              <li>Ensure your Twilio account has sufficient credits</li>
              <li>For trial accounts, verify recipient phone numbers in the Twilio console</li>
              <li>Check that your Twilio phone number is capable of sending SMS</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
