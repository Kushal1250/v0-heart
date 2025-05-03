"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  User,
  Mail,
  Shield,
  Key,
  Clock,
  AlertCircle,
  CheckCircle2,
  Save,
  X,
  Edit,
  Phone,
  RefreshCw,
} from "lucide-react"

export default function AdminProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isRetrying, setIsRetrying] = useState(false)
  const [profileData, setProfileData] = useState({
    id: "",
    name: "Admin",
    email: "admin@example.com",
    phone: "",
    role: "admin",
    created_at: new Date().toISOString(),
    profile_picture: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    fetchAdminProfile()
  }, [])

  const fetchAdminProfile = async () => {
    try {
      setIsLoading(true)
      setError("")
      setIsRetrying(false)

      console.log("Fetching admin profile...")
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      })

      console.log("Profile API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Profile API error:", errorData)

        if (response.status === 401) {
          // Unauthorized - redirect to login
          toast({
            title: "Session expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          })
          router.push("/admin-login")
          return
        }

        throw new Error(errorData.message || "Failed to fetch profile data")
      }

      const data = await response.json()
      console.log("Profile data received:", data)

      // Use received data but fallback to defaults for missing fields
      setProfileData({
        id: data.id || "",
        name: data.name || "Admin",
        email: data.email || "admin@example.com",
        phone: data.phone || "",
        role: data.role || "admin",
        created_at: data.created_at || new Date().toISOString(),
        profile_picture: data.profile_picture || "",
      })

      setFormData({
        name: data.name || "Admin",
        email: data.email || "admin@example.com",
        phone: data.phone || "",
      })
    } catch (error) {
      console.error("Error fetching profile:", error)
      setError("Failed to load profile data. Please try again later.")
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update profile")
      }

      const data = await response.json()
      setProfileData((prev) => ({
        ...prev,
        name: data.name || prev.name,
        phone: data.phone || prev.phone,
      }))

      setSuccess("Profile updated successfully!")
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
      setIsEditing(false)

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profileData.name || "",
      email: profileData.email || "",
      phone: profileData.phone || "",
    })
    setIsEditing(false)
    setError("")
  }

  const handleRetry = () => {
    setIsRetrying(true)
    fetchAdminProfile()
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground mt-4">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" /> Admin Profile
          </CardTitle>
          <CardDescription>View and manage your admin account information</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={handleRetry} disabled={isRetrying} className="ml-2 h-8">
                  {isRetrying ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" /> Retry
                    </>
                  )}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              {profileData.profile_picture ? (
                <AvatarImage src={profileData.profile_picture || "/placeholder.svg"} alt={profileData.name} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {profileData.name?.charAt(0) || "A"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {profileData.name}
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Admin</span>
              </h2>
              <p className="text-gray-600">{profileData.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Admin since: {new Date(profileData.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile Information
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Key className="h-4 w-4" /> Security Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
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
                      <Input id="email" name="email" value={formData.email} disabled className="bg-muted" />
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

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value="Administrator" disabled className="bg-muted" />
                      <p className="text-xs text-muted-foreground">Admin role cannot be changed</p>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                        {isSaving ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" /> Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 p-4 rounded-md bg-gray-50">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <User className="h-4 w-4" /> Name
                        </div>
                        <div className="font-medium">{profileData.name || "Not set"}</div>
                      </div>

                      <div className="space-y-2 p-4 rounded-md bg-gray-50">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email
                        </div>
                        <div className="font-medium">{profileData.email || "Not set"}</div>
                      </div>

                      <div className="space-y-2 p-4 rounded-md bg-gray-50">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" /> Phone
                        </div>
                        <div className="font-medium">{profileData.phone || "Not set"}</div>
                      </div>

                      <div className="space-y-2 p-4 rounded-md bg-gray-50">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4" /> Role
                        </div>
                        <div className="font-medium flex items-center">
                          Administrator
                          <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">Admin</span>
                        </div>
                      </div>

                      <div className="space-y-2 p-4 rounded-md bg-gray-50">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Account Created
                        </div>
                        <div className="font-medium">{new Date(profileData.created_at).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                        <Edit className="h-4 w-4" /> Edit Profile
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    <div>
                      <h3 className="font-medium text-amber-800">Security Settings</h3>
                      <p className="text-sm text-amber-700">Manage your account security settings and password.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Password Management</h3>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Change Password</p>
                        <p className="text-sm text-muted-foreground">
                          Update your password to maintain account security
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => router.push("/change-password")}>
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Account Security</h3>
                  <div className="p-4 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-red-800 flex items-center gap-2">
                      <Shield className="h-5 w-5" /> Admin Account Security
                    </h3>
                    <p className="text-sm text-red-700 mt-2">
                      Your admin account has full access to the system. Please ensure you maintain strong security
                      practices, including:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                      <li>Using a strong, unique password</li>
                      <li>Enabling two-factor authentication when available</li>
                      <li>Not sharing your credentials with others</li>
                      <li>Logging out when not using the system</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
