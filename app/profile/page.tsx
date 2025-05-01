"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
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
  FileText,
  CalendarIcon,
  TrendingUp,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { SimpleProfileUpload } from "@/components/simple-profile-upload"
import { SecuritySettings } from "@/components/security-settings"
// Import the SecuritySettingsSection component
import { SecuritySettingsSection } from "@/components/security-settings-section"

export default function ProfilePage() {
  const { user, isLoading, updateUserProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("personal")
  const [useSimpleUploader, setUseSimpleUploader] = useState(false)

  // Profile data state
  const [profileData, setProfileData] = useState({
    // Personal Information
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    profile_picture: "",
    createdAt: "",

    // Health Information
    height: "",
    weight: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    medications: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",

    // Account Information
    accountType: "Standard",
    lastLogin: "",
    subscriptionStatus: "Free",
    subscriptionRenewal: "",
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,

    // Privacy & Security
    twoFactorEnabled: false,
    emailVerified: false,
    phoneVerified: false,
    dataSharing: true,
    anonymousDataCollection: true,

    // Activity Summary
    recentAssessments: [],
    heartHealthScores: [],
    upcomingAppointments: [],
    recentReports: [],
  })

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
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)
  const [alert, setAlert] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (user) {
      // Fetch user profile data
      fetchUserProfile()
    }
  }, [user, isLoading, router])

  // Update profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData((prevData) => ({
        ...prevData,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profile_picture: user.profile_picture || "",
        emailVerified: true, // Assuming email is verified if user is logged in
      }))
    }
  }, [user])

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

      // Update profile data with fetched data
      setProfileData((prevData) => ({
        ...prevData,
        name: data.name || user?.name || "",
        email: data.email || user?.email || "",
        phone: data.phone || user?.phone || "",
        profile_picture: data.profile_picture || user?.profile_picture || "",
        createdAt: data.created_at || "",
        // Add any other fields that might be returned from the API
      }))

      // Also fetch health data if available
      try {
        const healthResponse = await fetch("/api/user/health-metrics", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        })

        if (healthResponse.ok) {
          const healthData = await healthResponse.json()
          setProfileData((prevData) => ({
            ...prevData,
            height: healthData.height || "",
            weight: healthData.weight || "",
            bloodType: healthData.bloodType || "",
            // Add other health fields
          }))
        }
      } catch (healthError) {
        console.error("Error fetching health data:", healthError)
        // Don't throw error here, just log it
      }

      // Also fetch user predictions/assessments if available
      try {
        const predictionsResponse = await fetch("/api/user/predictions", {
          method: "GET",
          headers: {
            "Cache-Control": "no-cache",
          },
          cache: "no-store",
        })

        if (predictionsResponse.ok) {
          const predictionsData = await predictionsResponse.json()

          // Format the predictions data for the UI
          const formattedAssessments = predictionsData.map((pred: any) => ({
            id: pred.id,
            date: pred.created_at,
            score: Math.round(pred.result * 100),
            risk: getRiskLevel(pred.result * 100),
          }))

          // Extract scores for the chart
          const scores = formattedAssessments.map((a: any) => a.score).reverse()

          setProfileData((prevData) => ({
            ...prevData,
            recentAssessments: formattedAssessments,
            heartHealthScores: scores,
          }))
        }
      } catch (predictionsError) {
        console.error("Error fetching predictions data:", predictionsError)
        // Don't throw error here, just log it
      }

      // Initialize form data with profile data
      setFormData({
        name: data.name || user?.name || "",
        phone: data.phone || user?.phone || "",
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        height: profileData.height,
        weight: profileData.weight,
        bloodType: profileData.bloodType,
        allergies: profileData.allergies,
        medicalConditions: profileData.medicalConditions,
        medications: profileData.medications,
        emergencyContactName: profileData.emergencyContactName,
        emergencyContactPhone: profileData.emergencyContactPhone,
        emergencyContactRelation: profileData.emergencyContactRelation,
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

  // Helper function to determine risk level based on score
  const getRiskLevel = (score: number) => {
    if (score >= 80) return "Low"
    if (score >= 60) return "Moderate"
    return "High"
  }

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
      console.log("Submitting profile update:", formData)

      // Send the update to the API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          // Add other fields as needed
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to update profile")
      }

      const updatedProfile = await response.json()

      // Update the profile data state
      setProfileData((prev) => ({
        ...prev,
        name: updatedProfile.name || formData.name,
        phone: updatedProfile.phone || formData.phone,
        // Update other fields from form data
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        bloodType: formData.bloodType,
        allergies: formData.allergies,
        medicalConditions: formData.medicalConditions,
        medications: formData.medications,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
      }))

      // Update the auth context if available
      if (updateUserProfile) {
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
    setProfileData((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }))

    // In a real app, you would also send this update to the API
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
            <h2 className="text-xl font-semibold mb-2">Welcome, {profileData.name || "User"}!</h2>
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
          ) : (
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
                      <Input id="email" value={profileData.email} disabled className="bg-muted" />
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
                      <Select
                        defaultValue={formData.gender}
                        onValueChange={(value) => handleSelectChange("gender", value)}
                      >
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
                        <div className="font-medium">{profileData.name || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email
                        </div>
                        <div className="font-medium">{profileData.email || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" /> Phone
                        </div>
                        <div className="font-medium">{profileData.phone || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Date of Birth
                        </div>
                        <div className="font-medium">
                          {profileData.dateOfBirth
                            ? format(new Date(profileData.dateOfBirth), "MMMM d, yyyy")
                            : "Not provided"}
                        </div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <User className="h-4 w-4" /> Gender
                        </div>
                        <div className="font-medium">{profileData.gender || "Not provided"}</div>
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
                          {profileData.height ? `${profileData.height} cm` : "Not provided"}
                        </div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Weight className="h-4 w-4" /> Weight
                        </div>
                        <div className="font-medium">
                          {profileData.weight ? `${profileData.weight} kg` : "Not provided"}
                        </div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Droplet className="h-4 w-4" /> Blood Type
                        </div>
                        <div className="font-medium">{profileData.bloodType || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 profile-hover-item p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" /> Allergies
                        </div>
                        <div className="font-medium">{profileData.allergies || "None"}</div>
                      </div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4" /> Medical Conditions
                      </div>
                      <div className="font-medium">{profileData.medicalConditions || "None"}</div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Pill className="h-4 w-4" /> Medications
                      </div>
                      <div className="font-medium">{profileData.medications || "None"}</div>
                    </div>

                    <div className="pt-4 border-t">
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <UserPlus className="h-5 w-5" /> Emergency Contact
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2 profile-hover-item p-3 rounded-md">
                          <div className="text-sm font-medium text-muted-foreground">Name</div>
                          <div className="font-medium">{profileData.emergencyContactName || "Not provided"}</div>
                        </div>

                        <div className="space-y-2 profile-hover-item p-3 rounded-md">
                          <div className="text-sm font-medium text-muted-foreground">Phone</div>
                          <div className="font-medium">{profileData.emergencyContactPhone || "Not provided"}</div>
                        </div>

                        <div className="space-y-2 profile-hover-item p-3 rounded-md">
                          <div className="text-sm font-medium text-muted-foreground">Relationship</div>
                          <div className="font-medium">{profileData.emergencyContactRelation || "Not provided"}</div>
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
                      <div className="font-medium">{profileData.accountType}</div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" /> Member Since
                      </div>
                      <div className="font-medium">
                        {profileData.createdAt
                          ? `${formatDistanceToNow(new Date(profileData.createdAt))} ago`
                          : "Unknown"}
                      </div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Last Login
                      </div>
                      <div className="font-medium">
                        {profileData.lastLogin
                          ? `${formatDistanceToNow(new Date(profileData.lastLogin))} ago`
                          : "Unknown"}
                      </div>
                    </div>

                    <div className="space-y-2 profile-hover-item p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Subscription Status
                      </div>
                      <div className="font-medium">{profileData.subscriptionStatus}</div>
                    </div>
                  </div>

                  <div className="space-y-2 profile-hover-item p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Subscription Renewal
                    </div>
                    <div className="font-medium">
                      {profileData.subscriptionRenewal
                        ? format(new Date(profileData.subscriptionRenewal), "MMMM d, yyyy")
                        : "N/A"}
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
                          checked={profileData.emailNotifications}
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
                          checked={profileData.smsNotifications}
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
                          checked={profileData.appNotifications}
                          onCheckedChange={() => handleToggleChange("appNotifications")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Privacy & Security Tab */}
              <TabsContent value="privacy">
                <SecuritySettings profileData={profileData} handleToggleChange={handleToggleChange} />
                <div className="mt-8">
                  <SecuritySettingsSection />
                </div>
              </TabsContent>

              {/* Activity Summary Tab */}
              <TabsContent value="activity">
                <div className="space-y-6">
                  <div className="pt-2">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Heart className="h-5 w-5" /> Recent Health Assessments
                    </h3>

                    {profileData.recentAssessments && profileData.recentAssessments.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4">Date</th>
                              <th className="text-left py-3 px-4">Score</th>
                              <th className="text-left py-3 px-4">Risk Level</th>
                              <th className="text-left py-3 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {profileData.recentAssessments.map((assessment: any) => (
                              <tr key={assessment.id} className="border-b">
                                <td className="py-3 px-4">{format(new Date(assessment.date), "MMM d, yyyy")}</td>
                                <td className="py-3 px-4">{assessment.score}</td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${
                                      assessment.risk === "Low"
                                        ? "bg-green-100 text-green-800"
                                        : assessment.risk === "Moderate"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {assessment.risk}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <Button variant="link" size="sm" className="p-0 h-auto">
                                    View Details
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-muted-foreground">No health assessments found</p>
                        <Button variant="link" className="mt-2">
                          Take an assessment
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Heart Health Score Trend
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-48 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-muted-foreground">
                          {profileData.heartHealthScores && profileData.heartHealthScores.length > 0
                            ? `Heart Health Score: ${profileData.heartHealthScores[0]}`
                            : "No heart health scores available"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Score trend visualization would appear here
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" /> Upcoming Appointments
                    </h3>

                    {profileData.upcomingAppointments && profileData.upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {profileData.upcomingAppointments.map((appointment: any) => (
                          <div key={appointment.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{appointment.type}</p>
                                <p className="text-sm text-muted-foreground">With {appointment.doctor}</p>
                                <p className="text-sm font-medium mt-2">
                                  {format(new Date(appointment.date), "MMMM d, yyyy")} at{" "}
                                  {format(new Date(appointment.date), "h:mm a")}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  Reschedule
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-muted-foreground">No upcoming appointments</p>
                        <Button variant="link" className="mt-2">
                          Schedule an appointment
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" /> Recent Reports
                    </h3>

                    {profileData.recentReports && profileData.recentReports.length > 0 ? (
                      <div className="space-y-3">
                        {profileData.recentReports.map((report: any) => (
                          <div
                            key={report.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">{report.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(report.date), "MMMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-muted-foreground">No reports available</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
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
