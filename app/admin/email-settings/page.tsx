"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import EmailConfigStatus from "@/components/email-config-status"

export default function EmailSettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState({
    server: "",
    port: "",
    secure: false,
    user: "",
    from: "",
  })

  useEffect(() => {
    // Fetch current config
    fetch("/api/email-test")
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          setConfig({
            server: data.config.server || "",
            port: data.config.port || "",
            secure: data.config.secure || false,
            user: data.config.user || "",
            from: data.config.from || "",
          })
        }
      })
      .catch((err) => console.error("Failed to fetch email config:", err))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Email Settings</h1>

        <div className="mb-8">
          <EmailConfigStatus />
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>
              Configure your email service to enable sending assessment results via email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="server">SMTP Server</Label>
              <Input
                id="server"
                placeholder="smtp.example.com"
                value={config.server}
                onChange={(e) => setConfig({ ...config, server: e.target.value })}
                className="bg-gray-800 border-gray-700"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400">The hostname of your SMTP server</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  placeholder="587"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400">Usually 587 (TLS) or 465 (SSL)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secure">Secure Connection</Label>
                <select
                  id="secure"
                  value={config.secure ? "true" : "false"}
                  onChange={(e) => setConfig({ ...config, secure: e.target.value === "true" })}
                  className="w-full h-10 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
                  disabled={isLoading}
                >
                  <option value="false">No (TLS)</option>
                  <option value="true">Yes (SSL)</option>
                </select>
                <p className="text-xs text-gray-400">Use SSL for port 465</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">SMTP Username</Label>
              <Input
                id="user"
                placeholder="user@example.com"
                value={config.user}
                onChange={(e) => setConfig({ ...config, user: e.target.value })}
                className="bg-gray-800 border-gray-700"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400">Usually your email address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">SMTP Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-gray-800 border-gray-700"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400">Your email account password or app password</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From Address</Label>
              <Input
                id="from"
                placeholder="noreply@example.com"
                value={config.from}
                onChange={(e) => setConfig({ ...config, from: e.target.value })}
                className="bg-gray-800 border-gray-700"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400">The email address that will appear as the sender</p>
            </div>

            <div className="pt-4">
              <Button className="w-full" disabled={isLoading}>
                Save Configuration
              </Button>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Note: Email settings are stored in environment variables and require a server restart to take effect.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800 mt-8">
          <CardHeader>
            <CardTitle>Email Troubleshooting</CardTitle>
            <CardDescription>Common issues and solutions for email delivery problems.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Common Issues</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>
                  <strong>Authentication failure:</strong> Check your username and password. For Gmail, you may need to
                  use an app password.
                </li>
                <li>
                  <strong>Connection timeout:</strong> Your server might be blocking outgoing SMTP connections. Try
                  using port 587 with TLS.
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
              <h3 className="text-lg font-medium mb-2">Testing Your Configuration</h3>
              <p className="text-gray-300 mb-4">
                You can test your email configuration by sending a test email to yourself:
              </p>
              <Button variant="outline" className="w-full" disabled={isLoading}>
                Send Test Email
              </Button>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Alternative Options</h3>
              <p className="text-gray-300">
                If you continue to have issues with email delivery, consider using one of these alternatives:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                <li>
                  <strong>PDF Download:</strong> Users can download their results as a PDF and share it manually.
                </li>
                <li>
                  <strong>Direct Share:</strong> On mobile devices, users can use the native share functionality.
                </li>
                <li>
                  <strong>Third-party Email Services:</strong> Services like SendGrid, Mailgun, or Amazon SES offer
                  better deliverability.
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
