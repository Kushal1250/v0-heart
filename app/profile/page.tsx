"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useProfile } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  KeyRound,
  Loader2,
  Heart,
  Shield,
  Bell,
  UserCog,
  Activity,
  Ruler,
  Weight,
  Droplet,
  AlertTriangle,
  Pill,
  UserPlus,
  CreditCard,
  Clock,
  BadgeCheck,
  Lock,
  FileText,
  CalendarIcon,
  TrendingUp,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { SimpleProfileUpload } from "@/components/simple-profile-upload"

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateUserProfile } = useAuth()
  const { profile, isLoading: profileLoading, error: profileError, fetchProfile, updateProfile } = useProfile()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("personal")
  const [useSimpleUploader, setUseSimpleUploader] = useState(false)

  // Form state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    medications: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
    dataSharing: true,
    anonymousDataCollection: true,
  })

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        height: profile.health_metrics?.height || "",
        weight: profile.health_metrics?.weight || "",
        bloodType: profile.health_metrics?.bloodType || "",
        allergies: profile.health_metrics?.allergies || "",
        medicalConditions: profile.health_metrics?.medicalConditions || "",
        medications: profile.medications || "",
        emergencyContactName: profile.emergencyContactName || "",
        emergencyContactPhone: profile.emergencyContactPhone || "",
        emergencyContactRelation: profile.emergencyContactRelation || "",
      })
    }
  }, [profile])

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
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
      // Prepare update data based on active tab
      const updateData: any = {}

      if (activeTab === "personal") {
        updateData.name = formData.name
        updateData.phone = formData.phone
        // Add other personal fields as needed
      } else if (activeTab === "health") {
        updateData.health_metrics = {
          height: formData.height,
          weight: formData.weight,
          bloodType: formData.bloodType,
          allergies: formData.allergies,
          medicalConditions: formData.medicalConditions,
        }
        // Add other health fields as needed
      }

      // Send update to API
      const updatedProfile = await updateProfile(updateData)

      if (!updatedProfile) {
        throw new Error("Failed to update profile")
      }

      // Update the auth context if available
      if (updateUserProfile && activeTab === "personal") {
        updateUserProfile({
          name: formData.name,
          phone: formData.phone,
        })
      }

      setIsEditing(false)
      setAlert({
        type: "success",
        message: "Profile updated successfully!",
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProfileImageUpdate = (imageUrl: string) => {
    updateProfile({ profile_picture: imageUrl })

    // Update the auth context if available
    if (updateUserProfile) {
      updateUserProfile({
        profile_picture: imageUrl,
      })
    }
  }

  const handleAdvancedUploaderError = () => {
    setUseSimpleUploader(true)
    toast({
      title: "Using simple uploader",
      description: "We've switched to a simpler upload method that may work better.",
    })
  }

  const handleToggleChange = (setting: string) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))

    // In a real app, you would also send this update to the API
  }

  const isLoading = authLoading || profileLoading

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
    <div className="container mx-auto py-10 relative">
      <div className="profile-bg-animation"></div>
      <Card className="w-full max-w-4xl mx-auto">
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
                  <Button variant="outline" size="sm" onClick={fetchProfile} disabled={profileLoading} className="ml-2">
                    {profileLoading ? (
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

          {profileError && !alert.type && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center justify-between">
                <span>{profileError}</span>
                <Button variant="outline" size="sm" onClick={fetchProfile} disabled={profileLoading} className="ml-2">
                  {profileLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-1" />
                  )}
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Welcome, {profile?.name || user?.name || "User"}!</h2>
            <p className="text-gray-600">Manage your personal information and account settings below.</p>
          </div>

          <div className="flex justify-center mb-6">
            {useSimpleUploader ? (
              <SimpleProfileUpload
                currentImage={profile?.profile_picture || null}
                onImageUpdate={handleProfileImageUpdate}
              />
            ) : (
              <div>
                <ProfileImageUpload
                  currentImage={profile?.profile_picture || null}
                  onImageUpdate={handleProfileImageUpdate}
                />
                <Button variant="link" size="sm" onClick={handleAdvancedUploaderError} className="text-xs mt-2">
                  Having trouble? Try simple uploader
                </Button>
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Personal
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Heart className="h-4 w-4" /> Health
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" /> Account
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Privacy
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Activity
              </TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              {isEditing ? (
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
                    <Input id="email" value={profile?.email || ""} disabled className="bg-muted" />
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
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <div className="font-medium">{profile?.name || "Not provided"}</div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email
                      </div>
                      <div className="font-medium">{profile?.email || "Not provided"}</div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone
                      </div>
                      <div className="font-medium">{profile?.phone || "Not provided"}</div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Date of Birth
                      </div>
                      <div className="font-medium">
                        {formData.dateOfBirth ? format(new Date(formData.dateOfBirth), "MMMM d, yyyy") : "Not provided"}
                      </div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" /> Gender
                      </div>
                      <div className="font-medium">{formData.gender || "Not provided"}</div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={() => setIsEditing(true)}>Edit Personal Information</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Health Information Tab */}
            <TabsContent value="health">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleInputChange}
                        placeholder="Enter your height in cm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="Enter your weight in kg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) => handleSelectChange("bloodType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      placeholder="List your allergies, separated by commas"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Input
                      id="medicalConditions"
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      placeholder="List your medical conditions, separated by commas"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medications">Medications</Label>
                    <Input
                      id="medications"
                      name="medications"
                      value={formData.medications}
                      onChange={handleInputChange}
                      placeholder="List your medications, separated by commas"
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Emergency Contact</h3>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">Name</Label>
                        <Input
                          id="emergencyContactName"
                          name="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={handleInputChange}
                          placeholder="Emergency contact name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">Phone</Label>
                        <Input
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={handleInputChange}
                          placeholder="Emergency contact phone"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactRelation">Relationship</Label>
                        <Input
                          id="emergencyContactRelation"
                          name="emergencyContactRelation"
                          value={formData.emergencyContactRelation}
                          onChange={handleInputChange}
                          placeholder="Relationship to emergency contact"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Ruler className="h-4 w-4" /> Height
                      </div>
                      <div className="font-medium">
                        {profile?.health_metrics?.height ? `${profile.health_metrics.height} cm` : "Not provided"}
                      </div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Weight className="h-4 w-4" /> Weight
                      </div>
                      <div className="font-medium">
                        {profile?.health_metrics?.weight ? `${profile.health_metrics.weight} kg` : "Not provided"}
                      </div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Droplet className="h-4 w-4" /> Blood Type
                      </div>
                      <div className="font-medium">{profile?.health_metrics?.bloodType || "Not provided"}</div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Allergies
                      </div>
                      <div className="font-medium">{profile?.health_metrics?.allergies || "None"}</div>
                    </div>
                  </div>

                  <div className="space-y-2 profile-hover-item p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Heart className="h-4 w-4" /> Medical Conditions
                    </div>
                    <div className="font-medium">{profile?.health_metrics?.medicalConditions || "None"}</div>
                  </div>

                  <div className="space-y-2 profile-hover-item p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Pill className="h-4 w-4" /> Medications
                    </div>
                    <div className="font-medium">{formData.medications || "None"}</div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <UserPlus className="h-5 w-5" /> Emergency Contact
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground">Name</div>
                        <div className="font-medium">{formData.emergencyContactName || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground">Phone</div>
                        <div className="font-medium">{formData.emergencyContactPhone || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground">Relationship</div>
                        <div className="font-medium">{formData.emergencyContactRelation || "Not provided"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setIsEditing(true)}>Edit Health Information</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Account Information Tab */}
            <TabsContent value="account">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 profile-hover-item p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BadgeCheck className="h-4 w-4" /> Account Type
                    </div>
                    <div className="font-medium">{profile?.role === "admin" ? "Admin" : "Standard"}</div>
                  </div>

                  <div className="space-y-2 profile-hover-item p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Member Since
                    </div>
                    <div className="font-medium">
                      {profile?.created_at ? `${formatDistanceToNow(new Date(profile.created_at))} ago` : "Unknown"}
                    </div>
                  </div>

                  <div className="space-y-2 profile-hover-item p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Last Login
                    </div>
                    <div className="font-medium">
                      {profile?.last_login ? `${formatDistanceToNow(new Date(profile.last_login))} ago` : "Unknown"}
                    </div>
                  </div>

                  <div className="space-y-2 profile-hover-item p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-4 w-4" /> Subscription Status
                    </div>
                    <div className="font-medium">Free</div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5" /> Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch
                        checked={notificationPreferences.emailNotifications}
                        onCheckedChange={() => handleToggleChange("emailNotifications")}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive updates via text message</p>
                      </div>
                      <Switch
                        checked={notificationPreferences.smsNotifications}
                        onCheckedChange={() => handleToggleChange("smsNotifications")}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">App Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                      <Switch
                        checked={notificationPreferences.appNotifications}
                        onCheckedChange={() => handleToggleChange("appNotifications")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Privacy & Security Tab */}
            <TabsContent value="privacy">
              <div className="space-y-6">
                <div className="pt-2">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5" /> Security Settings
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-amber-600">Disabled</span>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Verification</p>
                        <p className="text-sm text-muted-foreground">Verify your email address</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Phone Verification</p>
                        <p className="text-sm text-muted-foreground">Verify your phone number</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile?.phone ? (
                          <span className="text-green-600 font-medium flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                          </span>
                        ) : (
                          <Button variant="outline" size="sm">
                            Verify Phone
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5" /> Data Privacy
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Sharing with Healthcare Providers</p>
                        <p className="text-sm text-muted-foreground">
                          Allow your doctors to access your heart health data
                        </p>
                      </div>
                      <Switch
                        checked={notificationPreferences.dataSharing}
                        onCheckedChange={() => handleToggleChange("dataSharing")}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Anonymous Data Collection</p>
                        <p className="text-sm text-muted-foreground">
                          Allow anonymized data to be used for research and improving our services
                        </p>
                      </div>
                      <Switch
                        checked={notificationPreferences.anonymousDataCollection}
                        onCheckedChange={() => handleToggleChange("anonymousDataCollection")}
                      />
                    </div>
                  </div>
                </div>

                {/* Password Management Section */}
                <div className="pt-4 border-t">
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
              </div>
            </TabsContent>

            {/* Activity Summary Tab */}
            <TabsContent value="activity">
              <div className="space-y-6">
                <div className="pt-2">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5" /> Recent Health Assessments
                  </h3>

                  <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-muted-foreground">No health assessments found</p>
                    <Button variant="link" className="mt-2">
                      Take an assessment
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" /> Heart Health Score Trend
                  </h3>

                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-muted-foreground">No heart health scores available</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Complete an assessment to see your heart health score
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" /> Upcoming Appointments
                  </h3>

                  <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-muted-foreground">No upcoming appointments</p>
                    <Button variant="link" className="mt-2">
                      Schedule an appointment
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" /> Recent Reports
                  </h3>

                  <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-muted-foreground">No reports available</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
