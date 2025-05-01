"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function AdminSystemPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any>(null)

  // Fetch system status on component mount
  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch("/api/admin/system-status")
        if (response.ok) {
          const data = await response.json()
          setSystemStatus(data)
        }
      } catch (error) {
        console.error("Error fetching system status:", error)
      }
    }

    fetchSystemStatus()
  }, [])

  const handleSystemLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "System login failed")
      }

      setSuccess(true)

      // Refresh the page after successful login
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">System Administration</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Existing System Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and diagnostics</CardDescription>
          </CardHeader>
          <CardContent>
            {systemStatus ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Database Status</h3>
                  <p className={systemStatus.database ? "text-green-600" : "text-red-600"}>
                    {systemStatus.database ? "Connected" : "Disconnected"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Email Service</h3>
                  <p className={systemStatus.email ? "text-green-600" : "text-red-600"}>
                    {systemStatus.email ? "Operational" : "Not Configured"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">SMS Service</h3>
                  <p className={systemStatus.sms ? "text-green-600" : "text-red-600"}>
                    {systemStatus.sms ? "Operational" : "Not Configured"}
                  </p>
                </div>
              </div>
            ) : (
              <p>Loading system status...</p>
            )}
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/system-health">View Detailed Health</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* New Admin Login Card (matching the screenshot) */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>Sign in to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 bg-green-50">
                <AlertDescription className="text-green-600">Login successful! Redirecting...</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSystemLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              Return to home
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Additional System Tools Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">System Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-auto py-4">
            <Link href="/admin/diagnostics">
              <div className="flex flex-col items-center">
                <span className="text-lg font-medium">Run Diagnostics</span>
                <span className="text-sm text-gray-500">Check system components</span>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4">
            <Link href="/admin/fix-issues">
              <div className="flex flex-col items-center">
                <span className="text-lg font-medium">Fix Issues</span>
                <span className="text-sm text-gray-500">Repair common problems</span>
              </div>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4">
            <Link href="/admin/database-diagnostics">
              <div className="flex flex-col items-center">
                <span className="text-lg font-medium">Database Tools</span>
                <span className="text-sm text-gray-500">Manage database</span>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
