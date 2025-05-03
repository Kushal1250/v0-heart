"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import GlobalErrorHandler from "./global-error-handler"

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  profilePicture?: string
  role: string
  createdAt: string
}

export function ProfileContent() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showErrorHandler, setShowErrorHandler] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/user/profile", {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login")
            return
          }
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        })
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError("Failed to load profile. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile().catch((err) => {
      console.error("Unhandled error in fetchProfile:", err)
      setShowErrorHandler(true)
    })
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const updatedProfile = await response.json()
      setProfile(updatedProfile)
      setSuccessMessage("Profile updated successfully!")

      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (showErrorHandler) {
    return <GlobalErrorHandler />
  }

  if (loading) {
    return null // Using Suspense fallback instead
  }

  if (error && !profile) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Manage your account information</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            {successMessage && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success</AlertTitle>
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.profilePicture || ""} alt={profile?.name || "User"} />
                <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{profile?.name}</h3>
                <p className="text-sm text-muted-foreground">{profile?.role || "User"}</p>
              </div>
            </div>

            <Separator className="my-4" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleInputChange} />
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="activity">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recent Activity</h3>
              <p className="text-muted-foreground">
                Your recent heart health assessments and activities will appear here.
              </p>
              <div className="rounded-md bg-muted p-4 text-center">
                <p>No recent activity found</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Security Settings</h3>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" disabled />
              </div>
              <Button disabled>Change Password</Button>
              <p className="text-sm text-muted-foreground mt-2">
                Password changes are currently disabled. Please use the dedicated password change page.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
        <Button variant="outline" onClick={() => router.push("/change-password")}>
          Change Password
        </Button>
      </CardFooter>
    </Card>
  )
}
