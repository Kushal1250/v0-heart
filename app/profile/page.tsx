"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, User, Mail, Phone, Calendar, RefreshCw, KeyRound, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { SimpleProfileUpload } from "@/components/simple-profile-upload"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    createdAt: "",
    profile_picture: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)
  const [alert, setAlert] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  const [useSimpleUploader, setUseSimpleUploader] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      // Fetch user profile data
      fetchUserProfile()
    }
  }, [user, isLoading, router])

  const fetchUserProfile = async () => {
    if (isFetchingProfile) return

    setIsFetchingProfile(true)
    try {
      console.log("Fetching user profile...")
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        cache: "no-store",
      })

      console.log("Profile response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Profile fetch error:", errorData)
        throw new Error(errorData.message || "Failed to fetch profile data")
      }

      const data = await response.json()
      console.log("Profile data received:", data)

      setProfileData(data)
      setFormData({
        name: data.name || "",
        phone: data.phone || "",
      })

      // Clear any existing error
      setAlert({ type: null, message: "" })
    } catch (error) {
      console.error("Error fetching profile:", error)
      setAlert({
        type: "error",
        message: "Failed to load profile data. Please try again later.",
      })
    } finally {
      setIsFetchingProfile(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAlert({ type: null, message: "" })

    try {
      console.log("Submitting profile update:", formData)
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("Update response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Profile update error:", errorData)
        throw new Error(errorData.message || "Failed to update profile")
      }

      const updatedProfile = await response.json()
      console.log("Updated profile data:", updatedProfile)

      setProfileData((prev) => ({
        ...prev,
        name: updatedProfile.name,
        phone: updatedProfile.phone,
      }))
      setIsEditing(false)
      setAlert({
        type: "success",
        message: "Profile updated successfully!",
      })
      toast({
        title: "Success",
        description: "Your profile has been updated successfully!",
      })

      // Clear alert after 3 seconds
      setTimeout(() => {
        setAlert({ type: null, message: "" })
      }, 3000)
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message || "An error occurred while updating your profile",
      })
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfileImageUpdate = (imageUrl: string) => {
    setProfileData((prev) => ({
      ...prev,
      profile_picture: imageUrl,
    }))
  }

  const handleAdvancedUploaderError = () => {
    setUseSimpleUploader(true)
    toast({
      title: "Using simple uploader",
      description: "We've switched to a simpler upload method that may work better.",
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 relative">
      <div className="profile-bg-animation"></div>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" /> User Profile
          </CardTitle>
          <CardDescription>View and manage your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          {alert.type && (
            <Alert
              variant={alert.type === "error" ? "destructive" : "default"}
              className={`mb-6 ${alert.type === "success" ? "bg-green-50 text-green-800 border-green-200" : ""}`}
            >
              {alert.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <AlertTitle>{alert.type === "error" ? "Error" : "Success"}</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                {alert.type === "error" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUserProfile}
                    disabled={isFetchingProfile}
                    className="ml-2"
                  >
                    {isFetchingProfile ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-1" />
                    )}
                    Retry
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Welcome, {profileData.name || user?.name || "User"}!</h2>
            <p className="text-gray-600">Manage your personal information and account settings below.</p>
          </div>

          <div className="flex justify-center mb-6">
            {useSimpleUploader ? (
              <SimpleProfileUpload
                currentImage={profileData.profile_picture || null}
                onImageUpdate={handleProfileImageUpdate}
              />
            ) : (
              <div>
                <ProfileImageUpload
                  currentImage={profileData.profile_picture || null}
                  onImageUpdate={handleProfileImageUpdate}
                />
                <Button variant="link" size="sm" onClick={handleAdvancedUploaderError} className="text-xs mt-2">
                  Having trouble? Try simple uploader
                </Button>
              </div>
            )}
          </div>

          {isFetchingProfile && !alert.type ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground mt-4">Loading profile data...</p>
            </div>
          ) : isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={profileData.email || user?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2 profile-hover-item p-3 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" /> Name
                  </div>
                  <div className="font-medium">{profileData.name || user?.name || "Not provided"}</div>
                </div>

                <div className="space-y-2 profile-hover-item p-3 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </div>
                  <div className="font-medium">{profileData.email || user?.email || "Not provided"}</div>
                </div>

                <div className="space-y-2 profile-hover-item p-3 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </div>
                  <div className="font-medium">{profileData.phone || "Not provided"}</div>
                </div>

                <div className="space-y-2 profile-hover-item p-3 rounded-md">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Member Since
                  </div>
                  <div className="font-medium">
                    {profileData.createdAt ? `${formatDistanceToNow(new Date(profileData.createdAt))} ago` : "Unknown"}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            </div>
          )}

          {/* Password Management Section */}
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <KeyRound className="h-5 w-5" /> Password Management
            </h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change your password</p>
                  <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                </div>
                <Link href="/change-password">
                  <Button variant="outline">Change Password</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
