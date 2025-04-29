"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("patelkushal1533@gmail.com")
  const [password, setPassword] = useState("Kushal@1533")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/admin"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Submitting admin login with:", { email, password })

      // Clear any existing cookies
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      console.log("Admin login response status:", response.status)

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Admin login failed")
      }

      const data = await response.json()
      console.log("Admin login success:", data)

      // Check if cookies were set
      setTimeout(() => {
        const cookies = document.cookie
        console.log("Cookies after login:", cookies)

        const isAdminCookie = cookies.split(";").find((cookie) => cookie.trim().startsWith("is_admin="))
        if (!isAdminCookie || isAdminCookie.split("=")[1] !== "true") {
          console.warn("Admin cookie not set properly")
        }
      }, 100)

      setSuccess(true)

      // Redirect after a short delay to show success message
      setTimeout(() => {
        // Force a hard navigation to the admin page
        window.location.href = redirectPath
      }, 1500)
    } catch (err) {
      console.error("Admin login error:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
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
              <AlertDescription className="text-green-600">
                Login successful! Redirecting to admin dashboard...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={loading}>
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
  )
}
