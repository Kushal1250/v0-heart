"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  UserCog,
  Activity,
  Ruler,
  Weight,
  Droplet,
  AlertTriangle,
  Pill,
  UserPlus,
  BadgeCheck,
  Lock,
  FileText,
  TrendingUp,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { SimpleProfileUpload } from "@/components/simple-profile-upload"

export default function ProfilePage() {
  const { user, isLoading, updateUserProfile, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [isFetchingProfile, setIsFetchingProfile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    profile_picture: "",
    createdAt: "",
    height: "",
    weight: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    medications: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    emailVerified: false,
    phoneVerified: false,
    twoFactorEnabled: false,
    dataSharing: true,
    anonymousDataCollection: true,
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
    accountType: "Standard",
    subscriptionStatus: "Free",
    lastLogin: "",
    recentAssessments: [],
    heartHealthScores: [],
  })

  // Form data for editing
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

  const [alert, setAlert] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // Redirect if not logged in
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
      }))

      setFormData((prevForm) => ({
        ...prevForm,
        name: user.name || "",
        phone: user.phone || "",
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
        },
        cache: "no-store",
      })

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
        createdAt: data.createdAt || "",
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

  const handleToggleChange = (setting: string) => {
    setProfileData((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }))

    // In a real app, you would also send this update to the API
    toast({
      title: "Setting updated",
      description: `${setting} has been ${profileData[setting as keyof typeof profileData] ? "disabled" : "enabled"}.`,
    })
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
            <div className="relative">
              <Avatar className="h-24 w-24 border-2 border-primary">
                <AvatarImage
                  src={profileData.profile_picture || "/abstract-profile.png"}
                  alt={profileData.name || "User"}
                />
                <AvatarFallback>{profileData.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <SimpleProfileUpload
                currentImage={profileData.profile_picture || null}
                onImageUpdate={handleProfileImageUpdate}
              />
            </div>
          </div>

          {isFetchingProfile && !alert.type ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground mt-4">Loading profile data...</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Personal
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Health
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Security
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
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <User className="h-4 w-4" /> Name
                        </div>
                        <div className="font-medium">{profileData.name || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email
                        </div>
                        <div className="font-medium">{profileData.email || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Phone className="h-4 w-4" /> Phone
                        </div>
                        <div className="font-medium">{profileData.phone || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Date of Birth
                        </div>
                        <div className="font-medium">
                          {profileData.dateOfBirth
                            ? format(new Date(profileData.dateOfBirth), "MMMM d, yyyy")
                            : "Not provided"}
                        </div>
                      </div>

                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
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
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Ruler className="h-4 w-4" /> Height
                        </div>
                        <div className="font-medium">
                          {profileData.height ? `${profileData.height} cm` : "Not provided"}
                        </div>
                      </div>

                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Weight className="h-4 w-4" /> Weight
                        </div>
                        <div className="font-medium">
                          {profileData.weight ? `${profileData.weight} kg` : "Not provided"}
                        </div>
                      </div>

                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Droplet className="h-4 w-4" /> Blood Type
                        </div>
                        <div className="font-medium">{profileData.bloodType || "Not provided"}</div>
                      </div>

                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" /> Allergies
                        </div>
                        <div className="font-medium">{profileData.allergies || "None"}</div>
                      </div>
                    </div>

                    <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4" /> Medical Conditions
                      </div>
                      <div className="font-medium">{profileData.medicalConditions || "None"}</div>
                    </div>

                    <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
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
                        <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                          <div className="text-sm font-medium text-muted-foreground">Name</div>
                          <div className="font-medium">{profileData.emergencyContactName || "Not provided"}</div>
                        </div>

                        <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                          <div className="text-sm font-medium text-muted-foreground">Phone</div>
                          <div className="font-medium">{profileData.emergencyContactPhone || "Not provided"}</div>
                        </div>

                        <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
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

              {/* Security Tab */}
              <TabsContent value="security">
                <div className="space-y-6">
                  <div className="pt-2">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" /> Security Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-md">
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${profileData.twoFactorEnabled ? "text-green-600" : "text-amber-600"}`}
                          >
                            {profileData.twoFactorEnabled ? "Enabled" : "Disabled"}
                          </span>
                          <Button variant="outline" size="sm" onClick={() => handleToggleChange("twoFactorEnabled")}>
                            {profileData.twoFactorEnabled ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-md">
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-muted-foreground">Verify your email address</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {profileData.emailVerified ? (
                            <span className="text-green-600 font-medium flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Verification email sent",
                                  description: "Please check your inbox for the verification link.",
                                })
                              }}
                            >
                              Verify Email
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-md">
                        <div>
                          <p className="font-medium">Phone Verification</p>
                          <p className="text-sm text-muted-foreground">Verify your phone number</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {profileData.phoneVerified ? (
                            <span className="text-green-600 font-medium flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Verification SMS sent",
                                  description: "Please check your phone for the verification code.",
                                })
                              }}
                            >
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
                      <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-md">
                        <div>
                          <p className="font-medium">Data Sharing with Healthcare Providers</p>
                          <p className="text-sm text-muted-foreground">
                            Allow your doctors to access your heart health data
                          </p>
                        </div>
                        <Switch
                          checked={profileData.dataSharing}
                          onCheckedChange={() => handleToggleChange("dataSharing")}
                        />
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-md">
                        <div>
                          <p className="font-medium">Anonymous Data Collection</p>
                          <p className="text-sm text-muted-foreground">
                            Allow anonymized data to be used for research and improving our services
                          </p>
                        </div>
                        <Switch
                          checked={profileData.anonymousDataCollection}
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
                    <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-4 rounded-md">
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

                  {/* Logout Section */}
                  <div className="pt-4 border-t">
                    <div className="bg-red-50 p-4 rounded-md border border-red-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Log out of your account</p>
                          <p className="text-sm text-gray-500">You will need to log in again to access your account</p>
                        </div>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            logout()
                            router.push("/")
                          }}
                        >
                          Log Out
                        </Button>
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
                              <tr key={assessment.id} className="border-b hover:bg-gray-50">
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
                                  <div className="flex gap-2">
                                    <Link href={`/predict/results/${assessment.id}`}>
                                      <Button variant="link" size="sm" className="p-0 h-auto">
                                        View Details
                                      </Button>
                                    </Link>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-auto"
                                      onClick={() => {
                                        toast({
                                          title: "Generating PDF",
                                          description: "Your assessment PDF is being generated.",
                                        })
                                      }}
                                    >
                                      <FileText className="h-4 w-4 mr-1" /> PDF
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-muted-foreground">No health assessments found</p>
                        <Link href="/predict">
                          <Button variant="link" className="mt-2">
                            Take an assessment
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Heart Health Score Trend
                    </h3>

                    {profileData.heartHealthScores && profileData.heartHealthScores.length > 0 ? (
                      <div className="bg-white p-4 rounded-md border border-gray-200 h-48">
                        {/* Visual representation of scores */}
                        <div className="h-full flex items-end justify-between gap-2">
                          {profileData.heartHealthScores.map((score: number, index: number) => (
                            <div key={index} className="flex flex-col items-center">
                              <div
                                className={`w-10 rounded-t-sm ${
                                  score > 80 ? "bg-green-500" : score > 60 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ height: `${score}%` }}
                              ></div>
                              <span className="text-xs mt-1">{score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-muted-foreground">No heart health scores available</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Complete a health assessment to view your trend
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Account Information */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <UserCog className="h-5 w-5" /> Account Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4" /> Account Type
                        </div>
                        <div className="font-medium">{profileData.accountType}</div>
                      </div>

                      <div className="space-y-2 bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-md">
                        <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Member Since
                        </div>
                        <div className="font-medium">
                          {profileData.createdAt
                            ? `${formatDistanceToNow(new Date(profileData.createdAt))} ago`
                            : "Unknown"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Take New Assessment Button */}
                  <div className="pt-4 border-t">
                    <div className="bg-primary/10 p-4 rounded-md border border-primary/20">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="font-medium">Take a new heart health assessment</p>
                          <p className="text-sm text-muted-foreground">
                            Regular assessments help track your heart health over time
                          </p>
                        </div>
                        <Link href="/predict">
                          <Button>
                            <Heart className="h-4 w-4 mr-2" /> Start Assessment
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
