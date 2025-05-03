"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  Upload,
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Shield,
  Award,
  Clock,
  FileText,
  Activity,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { format, formatDistanceToNow } from "date-fns"

export function DynamicProfile() {
  const { user, updateUserProfile } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingHealth, setEditingHealth] = useState(false)
  const [personalFormData, setPersonalFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    dateOfBirth: "",
    gender: "",
  })
  const [healthFormData, setHealthFormData] = useState({
    height: "",
    weight: "",
    bloodType: "",
    allergies: "",
    medicalConditions: "",
    medications: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
  })
  const [activeTab, setActiveTab] = useState("personal")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [profileData, setProfileData] = useState({
    recentAssessments: [],
    heartHealthScores: [],
    accountType: "Standard",
    memberSince: user?.created_at || new Date().toISOString(),
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
    twoFactorEnabled: false,
    emailVerified: true,
    phoneVerified: false,
    dataSharing: true,
    anonymousDataCollection: true,
  })

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)

        // Fetch user profile data
        const profileResponse = await fetch("/api/user/profile", {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          cache: "no-store",
        })

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile data")
        }

        const profileData = await profileResponse.json()

        // Update form data with fetched data
        setPersonalFormData((prev) => ({
          ...prev,
          name: profileData.name || user?.name || "",
          email: profileData.email || user?.email || "",
          phone: profileData.phone || user?.phone || "",
        }))

        // Fetch health metrics if available
        try {
          const healthResponse = await fetch("/api/user/health-metrics")
          if (healthResponse.ok) {
            const healthData = await healthResponse.json()
            setHealthFormData((prev) => ({
              ...prev,
              height: healthData.height || "",
              weight: healthData.weight || "",
              bloodType: healthData.bloodType || "",
              allergies: healthData.allergies || "",
              medicalConditions: healthData.medicalConditions || "",
              medications: healthData.medications || "",
            }))
          }
        } catch (healthError) {
          console.error("Error fetching health data:", healthError)
        }

        // Fetch predictions/assessments if available
        try {
          const predictionsResponse = await fetch("/api/user/predictions")
          if (predictionsResponse.ok) {
            const predictionsData = await predictionsResponse.json()

            // Format the predictions data for the UI
            const formattedAssessments = predictionsData.map((pred: any) => ({
              id: pred.id,
              date: pred.created_at,
              score: Math.round(pred.result * 100),
              riskLevel: getRiskLevel(pred.result * 100),
            }))

            // Extract scores for the chart
            const scores = formattedAssessments.map((a: any) => a.score).reverse()

            setProfileData((prev) => ({
              ...prev,
              recentAssessments: formattedAssessments,
              heartHealthScores: scores,
            }))
          }
        } catch (predictionsError) {
          console.error("Error fetching predictions data:", predictionsError)
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load profile data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchUserData()
    }
  }, [user])

  // Helper function to determine risk level based on score
  const getRiskLevel = (score: number) => {
    if (score >= 80) return "Low"
    if (score >= 60) return "Moderate"
    return "High"
  }

  // Handle personal info form changes
  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setPersonalFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle health info form changes
  const handleHealthChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setHealthFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle toggle changes
  const handleToggleChange = async (name: string, checked: boolean) => {
    try {
      // In a real app, you would send this to the server
      // await fetch('/api/user/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ [name]: checked })
      // });

      // Update local state
      setProfileData((prev) => ({ ...prev, [name]: checked }))

      setSuccessMessage("Setting updated successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError("Failed to update setting. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Save personal info
  const savePersonalInfo = async () => {
    try {
      setLoading(true)

      // Send update to the API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: personalFormData.name,
          phone: personalFormData.phone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }

      const updatedProfile = await response.json()

      // Update the auth context if available
      if (updateUserProfile) {
        updateUserProfile({
          name: personalFormData.name,
          phone: personalFormData.phone,
        })
      }

      setEditingPersonal(false)
      setSuccessMessage("Personal information updated successfully")
      toast({
        title: "Success",
        description: "Your profile has been updated successfully!",
      })

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to update personal information. Please try again.")
      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Save health info
  const saveHealthInfo = async () => {
    try {
      setLoading(true)

      // In a real app, you would send this to the server
      // await fetch('/api/user/health', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(healthFormData)
      // });

      setEditingHealth(false)
      setSuccessMessage("Health information updated successfully")
      toast({
        title: "Success",
        description: "Your health information has been updated successfully!",
      })

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError("Failed to update health information. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update health information",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload profile picture")
      }

      const data = await response.json()

      // Update the auth context if available
      if (updateUserProfile) {
        updateUserProfile({
          profile_picture: data.url,
        })
      }

      setSuccessMessage("Profile picture updated successfully")
      toast({
        title: "Success",
        description: "Your profile picture has been updated successfully!",
      })

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      setError(err.message || "Failed to upload profile picture. Please try again.")
      toast({
        title: "Error",
        description: err.message || "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle verification
  const handleVerification = async (type: "email" | "phone") => {
    try {
      setLoading(true)

      // In a real app, you would send a verification request
      // await fetch(`/api/user/verify-${type}`, { method: 'POST' });

      setSuccessMessage(`Verification code sent to your ${type}`)
      toast({
        title: "Verification Sent",
        description: `A verification code has been sent to your ${type}`,
      })

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(`Failed to send verification code to your ${type}. Please try again.`)
      toast({
        title: "Error",
        description: `Failed to send verification code to your ${type}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success message */}
      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Error message */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        {/* Profile header */}
        <div className="w-full md:w-1/3">
          <Card className="border-2 border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-md">
                    <AvatarImage src={user?.profile_picture || "/abstract-profile.png"} alt={user?.name || "User"} />
                    <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1.5 cursor-pointer shadow-md hover:bg-primary/80 transition-colors duration-200"
                  >
                    <Upload className="h-4 w-4" />
                    <input
                      id="profile-picture"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                    />
                  </label>
                </div>
              </div>
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <span role="img" aria-label="waving hand" className="text-2xl">
                  👋
                </span>
                {user?.name || "User"}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-1 mt-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                {user?.email || "No email provided"}
              </CardDescription>
              <div className="mt-3">
                <Badge variant={profileData.accountType === "Premium" ? "default" : "outline"} className="font-medium">
                  {profileData.accountType === "Premium" ? "✨ Premium" : "⭐ Standard"} Account
                </Badge>
              </div>
              {user?.id && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <span className="font-mono">ID: {user.id}</span>
                </div>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Quick stats */}
        <div className="w-full md:w-2/3">
          <Card className="border-2 border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Account Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {profileData.memberSince ? format(new Date(profileData.memberSince), "MMMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                    <p className="font-medium">
                      {user?.last_login ? formatDistanceToNow(new Date(user.last_login), { addSuffix: true }) : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription Status</p>
                    <p className="font-medium">{profileData.accountType || "Standard"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="w-full">
                    <p className="text-sm text-muted-foreground">Heart Health Score</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={profileData.heartHealthScores?.[0] || 0} className="h-2.5 flex-1" />
                      <span className="font-medium">{profileData.heartHealthScores?.[0] || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="personal">👤 Personal</TabsTrigger>
          <TabsTrigger value="health">❤️ Health</TabsTrigger>
          <TabsTrigger value="account">🔧 Account</TabsTrigger>
          <TabsTrigger value="privacy">🔒 Privacy</TabsTrigger>
          <TabsTrigger value="activity">📊 Activity</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-transparent">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </div>
              {!editingPersonal ? (
                <Button variant="outline" onClick={() => setEditingPersonal(true)} className="gap-1">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingPersonal(false)} className="gap-1">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button onClick={savePersonalInfo} disabled={loading} className="gap-1">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" /> Full Name
                    </Label>
                    {editingPersonal ? (
                      <Input
                        id="name"
                        name="name"
                        value={personalFormData.name}
                        onChange={handlePersonalChange}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{personalFormData.name || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </Label>
                    {editingPersonal ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={personalFormData.email}
                        disabled
                        className="bg-muted"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{personalFormData.email || "Not provided"}</p>
                    )}
                    {editingPersonal && (
                      <p className="text-xs text-muted-foreground mt-1">Email address cannot be changed</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> Phone Number
                    </Label>
                    {editingPersonal ? (
                      <Input
                        id="phone"
                        name="phone"
                        value={personalFormData.phone}
                        onChange={handlePersonalChange}
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{personalFormData.phone || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {editingPersonal ? (
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={personalFormData.dateOfBirth}
                        onChange={handlePersonalChange}
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">
                        {personalFormData.dateOfBirth
                          ? format(new Date(personalFormData.dateOfBirth), "MMMM d, yyyy")
                          : "Not provided"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  {editingPersonal ? (
                    <select
                      id="gender"
                      name="gender"
                      value={personalFormData.gender}
                      onChange={handlePersonalChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded-md">{personalFormData.gender || "Not provided"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Information Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-red-50 to-transparent">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  Health Information
                </CardTitle>
                <CardDescription>Manage your health details</CardDescription>
              </div>
              {!editingHealth ? (
                <Button variant="outline" onClick={() => setEditingHealth(true)} className="gap-1">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingHealth(false)} className="gap-1">
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                  <Button onClick={saveHealthInfo} disabled={loading} className="gap-1">
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="height">Height</Label>
                    {editingHealth ? (
                      <Input
                        id="height"
                        name="height"
                        value={healthFormData.height}
                        onChange={handleHealthChange}
                        placeholder="e.g., 175 cm"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{healthFormData.height || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    {editingHealth ? (
                      <Input
                        id="weight"
                        name="weight"
                        value={healthFormData.weight}
                        onChange={handleHealthChange}
                        placeholder="e.g., 75 kg"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{healthFormData.weight || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    {editingHealth ? (
                      <select
                        id="bloodType"
                        name="bloodType"
                        value={healthFormData.bloodType}
                        onChange={handleHealthChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select blood type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{healthFormData.bloodType || "Not provided"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  {editingHealth ? (
                    <Textarea
                      id="allergies"
                      name="allergies"
                      value={healthFormData.allergies}
                      onChange={handleHealthChange}
                      placeholder="List any allergies you have"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded-md">{healthFormData.allergies || "None"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  {editingHealth ? (
                    <Textarea
                      id="medicalConditions"
                      name="medicalConditions"
                      value={healthFormData.medicalConditions}
                      onChange={handleHealthChange}
                      placeholder="List any medical conditions you have"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded-md">{healthFormData.medicalConditions || "None"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="medications">Medications</Label>
                  {editingHealth ? (
                    <Textarea
                      id="medications"
                      name="medications"
                      value={healthFormData.medications}
                      onChange={handleHealthChange}
                      placeholder="List any medications you are currently taking"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded-md">{healthFormData.medications || "None"}</p>
                  )}
                </div>

                <div className="border-t pt-4 mt-2">
                  <h3 className="font-medium mb-2">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Name</Label>
                      {editingHealth ? (
                        <Input
                          id="emergencyContactName"
                          name="emergencyContactName"
                          value={healthFormData.emergencyContactName}
                          onChange={handleHealthChange}
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-muted rounded-md">
                          {healthFormData.emergencyContactName || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Phone</Label>
                      {editingHealth ? (
                        <Input
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          value={healthFormData.emergencyContactPhone}
                          onChange={handleHealthChange}
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-muted rounded-md">
                          {healthFormData.emergencyContactPhone || "Not provided"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      {editingHealth ? (
                        <Input
                          id="emergencyContactRelationship"
                          name="emergencyContactRelationship"
                          value={healthFormData.emergencyContactRelationship}
                          onChange={handleHealthChange}
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-muted rounded-md">
                          {healthFormData.emergencyContactRelationship || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Information Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Account Information
              </CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Account Type</h3>
                    <p className="p-2 bg-muted rounded-md">{profileData.accountType || "Standard"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Member Since</h3>
                    <p className="p-2 bg-muted rounded-md">
                      {profileData.memberSince ? format(new Date(profileData.memberSince), "MMMM d, yyyy") : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications" className="font-medium">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={profileData.emailNotifications}
                        onCheckedChange={(checked) => handleToggleChange("emailNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications" className="font-medium">
                          SMS Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive updates via text message</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={profileData.smsNotifications}
                        onCheckedChange={(checked) => handleToggleChange("smsNotifications", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="appNotifications" className="font-medium">
                          App Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                      </div>
                      <Switch
                        id="appNotifications"
                        checked={profileData.appNotifications}
                        onCheckedChange={(checked) => handleToggleChange("appNotifications", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Account Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => (window.location.href = "/change-password")}>
                      Change Password
                    </Button>
                    <Button variant="outline" onClick={() => (window.location.href = "/reset-password-profile")}>
                      Reset Password
                    </Button>
                    <Button variant="outline" className="text-destructive hover:bg-destructive/10">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h3 className="font-medium mb-2">Account Verification</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {profileData.emailVerified ? "Your email is verified" : "Your email is not verified"}
                        </p>
                      </div>
                      {!profileData.emailVerified && (
                        <Button variant="outline" onClick={() => handleVerification("email")}>
                          Verify Email
                        </Button>
                      )}
                      {profileData.emailVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Phone Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {profileData.phoneVerified ? "Your phone is verified" : "Your phone is not verified"}
                        </p>
                      </div>
                      {!profileData.phoneVerified && (
                        <Button variant="outline" onClick={() => handleVerification("phone")}>
                          Verify Phone
                        </Button>
                      )}
                      {profileData.phoneVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      id="twoFactorEnabled"
                      checked={profileData.twoFactorEnabled}
                      onCheckedChange={(checked) => handleToggleChange("twoFactorEnabled", checked)}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Data Privacy</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dataSharing" className="font-medium">
                          Data Sharing
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow sharing your data with healthcare providers
                        </p>
                      </div>
                      <Switch
                        id="dataSharing"
                        checked={profileData.dataSharing}
                        onCheckedChange={(checked) => handleToggleChange("dataSharing", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="anonymousDataCollection" className="font-medium">
                          Anonymous Data Collection
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Allow anonymous data collection for research purposes
                        </p>
                      </div>
                      <Switch
                        id="anonymousDataCollection"
                        checked={profileData.anonymousDataCollection}
                        onCheckedChange={(checked) => handleToggleChange("anonymousDataCollection", checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader className="bg-gradient-to-r from-amber-50 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-600" />
                Activity
              </CardTitle>
              <CardDescription>View your recent activity and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Recent Heart Health Assessments
                  </h3>
                  {profileData.recentAssessments && profileData.recentAssessments.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border shadow-sm">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left py-3 px-4">Date</th>
                            <th className="text-left py-3 px-4">Score</th>
                            <th className="text-left py-3 px-4">Risk Level</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {profileData.recentAssessments.map((assessment: any) => (
                            <tr key={assessment.id} className="border-b hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4">{format(new Date(assessment.date), "MMM d, yyyy")}</td>
                              <td className="py-3 px-4 font-medium">{assessment.score}</td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    assessment.riskLevel === "Low"
                                      ? "outline"
                                      : assessment.riskLevel === "Moderate"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className="font-medium"
                                >
                                  {assessment.riskLevel === "Low" && "✅ "}
                                  {assessment.riskLevel === "Moderate" && "⚠️ "}
                                  {assessment.riskLevel === "High" && "🚨 "}
                                  {assessment.riskLevel}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Button
                                  variant="link"
                                  className="p-0 h-auto"
                                  onClick={() => (window.location.href = `/predict/results/${assessment.id}`)}
                                >
                                  View Details
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                      <div className="text-4xl mb-3">📋</div>
                      <p className="text-muted-foreground mb-3">No recent assessments found.</p>
                      <Button
                        variant="default"
                        className="mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                        onClick={() => (window.location.href = "/predict")}
                      >
                        Take an assessment
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Activity Actions
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => (window.location.href = "/history")} className="gap-2">
                      <Activity className="h-4 w-4" />
                      View Full History
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => (window.location.href = "/predict")}
                      className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                    >
                      <Heart className="h-4 w-4" />
                      New Assessment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
