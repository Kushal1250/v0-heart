"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  Loader2,
  Upload,
  RefreshCw,
  KeyRound,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [isUploading, setIsUploading] = useState(false)
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)
  const [alert, setAlert] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // Add a state to track the avatar key for cache busting
  const [avatarKey, setAvatarKey] = useState(Date.now())

  // Add state for phone number update
  const [phone, setPhone] = useState("")
  const [isUpdatingPhone, setIsUpdatingPhone] = useState(false)
  const [updateMessage, setUpdateMessage] = useState("")
  const [updateSuccess, setUpdateSuccess] = useState(false)

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
      setPhone(data.phone || "") // Initialize phone state

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

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or GIF image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("profile_picture", file)

      console.log("Uploading profile picture...")
      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
        cache: "no-store",
      })

      console.log("Upload response status:", response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error("Upload error:", error)
        throw new Error(error.message || "Failed to upload profile picture")
      }

      const data = await response.json()
      console.log("Upload response data:", data)

      if (!data.profile_picture) {
        throw new Error("No profile picture URL returned from server")
      }

      // Update profile data with new image URL
      setProfileData((prev) => ({
        ...prev,
        profile_picture: data.profile_picture,
      }))

      // Update avatar key to force re-render
      setAvatarKey(Date.now())

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      })
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleUpdatePhone = async () => {
    if (!phone) return

    setIsUpdatingPhone(true)

    try {
      const response = await fetch("/api/user/profile/update-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update phone number")
      }

      // Show success message
      setUpdateMessage("Phone number updated successfully")
      setUpdateSuccess(true)
      fetchUserProfile() // Refresh profile data after successful update
      toast({
        title: "Success",
        description: "Phone number updated successfully!",
      })
    } catch (error) {
      setUpdateMessage(error instanceof Error ? error.message : "Failed to update phone number")
      setUpdateSuccess(false)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update phone number",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPhone(false)
    }
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
            <div className="relative">
              <div
                className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer group relative"
                onClick={handleProfilePictureClick}
              >
                {profileData.profile_picture ? (
                  <>
                    {profileData.profile_picture.startsWith("data:") ? (
                      // For data URLs
                      <div className="h-full w-full">
                        <img
                          src={`${profileData.profile_picture}`}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          key={`profile-img-${avatarKey}`}
                        />
                      </div>
                    ) : (
                      // For regular URLs
                      <Avatar className="h-24 w-24">
                        <AvatarImage
                          src={`${profileData.profile_picture}${profileData.profile_picture.includes("?") ? "&" : "?"}v=${avatarKey}`}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                          {profileData.name?.[0]?.toUpperCase() ||
                            user?.name?.[0]?.toUpperCase() ||
                            user?.email?.[0]?.toUpperCase() ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <User className="h-12 w-12 text-gray-400" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                  </>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs"
                onClick={handleProfilePictureClick}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                {isUploading ? "Uploading..." : "Change"}
              </Button>
            </div>
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

              {/* Add this section to your existing profile page component */}
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="flex-1"
                  />
                  <Button onClick={handleUpdatePhone} disabled={isUpdatingPhone}>
                    {isUpdatingPhone ? "Updating..." : "Update"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Adding a phone number enables SMS verification for password resets and account security.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              </div>
            </div>
          )}

          {!isEditing && (
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
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
