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
import { AlertCircle, CheckCircle, Edit, Save, Upload, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface UserData {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  gender?: string
  profilePicture?: string
  height?: string
  weight?: string
  bloodType?: string
  allergies?: string
  medicalConditions?: string
  medications?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  accountType?: string
  memberSince?: string
  lastLogin?: string
  subscriptionStatus?: string
  subscriptionRenewal?: string
  emailNotifications?: boolean
  smsNotifications?: boolean
  appNotifications?: boolean
  twoFactorEnabled?: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
  dataSharing?: boolean
  anonymousDataCollection?: boolean
  recentAssessments?: Array<{
    id: string
    date: string
    score: number
    riskLevel: string
  }>
  appointments?: Array<{
    id: string
    date: string
    doctor: string
    purpose: string
  }>
  reports?: Array<{
    id: string
    date: string
    title: string
    link: string
  }>
}

export default function DynamicProfile() {
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
    appointments: [],
    reports: [],
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

  const handlePasswordChange = () => {
    // Implement password change logic here
    console.log("Password change initiated")
  }

  // Loading state
  if (loading) {
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

  // If no user data is available
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>No user data available. Please log in again.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => (window.location.href = "/login")}>Go to Login</Button>
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
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.profilePicture || "/abstract-profile.png"} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1 cursor-pointer"
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
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="mt-2">
                <Badge variant={user.accountType === "Premium" ? "default" : "outline"}>
                  {user.accountType || "Standard"} Account
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Quick stats */}
        <div className="w-full md:w-2/3">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{user.memberSince || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">{user.lastLogin || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription Status</p>
                  <p className="font-medium">{user.subscriptionStatus || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heart Health Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={user.recentAssessments?.[0]?.score || 0} className="h-2" />
                    <span className="font-medium">{user.recentAssessments?.[0]?.score || "N/A"}</span>
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
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Manage your personal details</CardDescription>
              </div>
              {!editingPersonal ? (
                <Button variant="outline" onClick={() => setEditingPersonal(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingPersonal(false)}>
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button onClick={savePersonalInfo}>
                    <Save className="h-4 w-4 mr-2" /> Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    {editingPersonal ? (
                      <Input
                        id="name"
                        name="name"
                        value={personalFormData.name || ""}
                        onChange={handlePersonalChange}
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{user.name || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    {editingPersonal ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={personalFormData.email || ""}
                        onChange={handlePersonalChange}
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{user.email || "Not provided"}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    {editingPersonal ? (
                      <Input
                        id="phone"
                        name="phone"
                        value={personalFormData.phone || ""}
                        onChange={handlePersonalChange}
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{user.phone || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    {editingPersonal ? (
                      <Input
                        id="dateOfBirth"
                        name="dateOfBirth"
                        type="date"
                        value={personalFormData.dateOfBirth || ""}
                        onChange={handlePersonalChange}
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{user.dateOfBirth || "Not provided"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  {editingPersonal ? (
                    <select
                      id="gender"
                      name="gender"
                      value={personalFormData.gender || ""}
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
                    <p className="mt-1 p-2 bg-muted rounded-md">{user.gender || "Not provided"}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Information Tab */}
        <TabsContent value="health">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Health Information</CardTitle>
                <CardDescription>Manage your health details</CardDescription>
              </div>
              {!editingHealth ? (
                <Button variant="outline" onClick={() => setEditingHealth(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditingHealth(false)}>
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button onClick={saveHealthInfo}>
                    <Save className="h-4 w-4 mr-2" /> Save
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
                        value={healthFormData.height || ""}
                        onChange={handleHealthChange}
                        placeholder="e.g., 175 cm"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{user.height || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight</Label>
                    {editingHealth ? (
                      <Input
                        id="weight"
                        name="weight"
                        value={healthFormData.weight || ""}
                        onChange={handleHealthChange}
                        placeholder="e.g., 75 kg"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-muted rounded-md">{user.weight || "Not provided"}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    {editingHealth ? (
                      <select
                        id="bloodType"
                        name="bloodType"
                        value={healthFormData.bloodType || ""}
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
                      <p className="mt-1 p-2 bg-muted rounded-md">{user.bloodType || "Not provided"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="allergies">Allergies</Label>
                  {editingHealth ? (
                    <Textarea
                      id="allergies"
                      name="allergies"
                      value={healthFormData.allergies || ""}
                      onChange={handleHealthChange}
                      placeholder="List any allergies you have"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded-md">{user.allergies || "None"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="medicalConditions">Medical Conditions</Label>
                  {editingHealth ? (
                    <Textarea
                      id="medicalConditions"
                      name="medicalConditions"
                      value={healthFormData.medicalConditions || ""}
                      onChange={handleHealthChange}
                      placeholder="List any medical conditions you have"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded-md">{user.medicalConditions || "None"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="medications">Medications</Label>
                  {editingHealth ? (
                    <Textarea
                      id="medications"
                      name="medications"
                      value={healthFormData.medications || ""}
                      onChange={handleHealthChange}
                      placeholder="List any medications you are currently taking"
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded-md">{user.medications || "None"}</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Emergency Contact</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Name</Label>
                      {editingHealth ? (
                        <Input
                          id="emergencyContactName"
                          name="emergencyContactName"
                          value={healthFormData.emergencyContactName || ""}
                          onChange={handleHealthChange}
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-muted rounded-md">{user.emergencyContactName || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Phone</Label>
                      {editingHealth ? (
                        <Input
                          id="emergencyContactPhone"
                          name="emergencyContactPhone"
                          value={healthFormData.emergencyContactPhone || ""}
                          onChange={handleHealthChange}
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-muted rounded-md">{user.emergencyContactPhone || "Not provided"}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                      {editingHealth ? (
                        <Input
                          id="emergencyContactRelationship"
                          name="emergencyContactRelationship"
                          value={healthFormData.emergencyContactRelationship || ""}
                          onChange={handleHealthChange}
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-muted rounded-md">
                          {user.emergencyContactRelationship || "Not provided"}
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
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Manage your account details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Account Type</h3>
                    <p className="p-2 bg-muted rounded-md">{user.accountType || "Standard"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Member Since</h3>
                    <p className="p-2 bg-muted rounded-md">{user.memberSince || "N/A"}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Subscription</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="p-2 bg-muted rounded-md">{user.subscriptionStatus || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Renewal Date</p>
                      <p className="p-2 bg-muted rounded-md">{user.subscriptionRenewal || "N/A"}</p>
                    </div>
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
                        checked={user.emailNotifications || false}
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
                        checked={user.smsNotifications || false}
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
                        checked={user.appNotifications || false}
                        onCheckedChange={(checked) => handleToggleChange("appNotifications", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Account Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handlePasswordChange}>
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

        {/* Activity Tab */}
        <TabsContent value="activity">
          <div className="space-y-6">
            {/* Recent Health Assessments */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 mr-2"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                  <CardTitle>Recent Health Assessments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profileData.recentAssessments && profileData.recentAssessments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Score</th>
                          <th className="text-left py-2 px-4">Risk Level</th>
                          <th className="text-left py-2 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profileData.recentAssessments.map((assessment: any) => (
                          <tr key={assessment.id} className="border-b">
                            <td className="py-2 px-4">{new Date(assessment.date).toLocaleDateString()}</td>
                            <td className="py-2 px-4">{assessment.score}</td>
                            <td className="py-2 px-4">
                              <Badge
                                variant={
                                  assessment.riskLevel === "Low"
                                    ? "outline"
                                    : assessment.riskLevel === "Moderate"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {assessment.riskLevel}
                              </Badge>
                            </td>
                            <td className="py-2 px-4">
                              <Button variant="link" className="p-0 h-auto">
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground mb-4">No health assessments found</p>
                    <Button
                      variant="link"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => (window.location.href = "/predict")}
                    >
                      Take an assessment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Heart Health Score Trend */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 mr-2"
                  >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                  <CardTitle>Heart Health Score Trend</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profileData.heartHealthScores && profileData.heartHealthScores.length > 0 ? (
                  <div className="h-60">
                    {/* Chart would go here */}
                    <p>Score trend visualization would appear here</p>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground mb-2">No heart health scores available</p>
                    <p className="text-sm text-muted-foreground">Score trend visualization would appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 mr-2"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profileData.appointments && profileData.appointments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Doctor</th>
                          <th className="text-left py-2 px-4">Purpose</th>
                          <th className="text-left py-2 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profileData.appointments.map((appointment: any) => (
                          <tr key={appointment.id} className="border-b">
                            <td className="py-2 px-4">{appointment.date}</td>
                            <td className="py-2 px-4">{appointment.doctor}</td>
                            <td className="py-2 px-4">{appointment.purpose}</td>
                            <td className="py-2 px-4">
                              <div className="flex gap-2">
                                <Button variant="link" className="p-0 h-auto">
                                  Reschedule
                                </Button>
                                <Button variant="link" className="p-0 h-auto text-destructive">
                                  Cancel
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                    <Button variant="link" className="text-blue-500 hover:text-blue-700">
                      Schedule an appointment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 mr-2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                    <path d="M10 9H8" />
                  </svg>
                  <CardTitle>Recent Reports</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {profileData.reports && profileData.reports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Date</th>
                          <th className="text-left py-2 px-4">Title</th>
                          <th className="text-left py-2 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {profileData.reports.map((report: any) => (
                          <tr key={report.id} className="border-b">
                            <td className="py-2 px-4">{report.date}</td>
                            <td className="py-2 px-4">{report.title}</td>
                            <td className="py-2 px-4">
                              <div className="flex gap-2">
                                <Button variant="link" className="p-0 h-auto">
                                  View
                                </Button>
                                <Button variant="link" className="p-0 h-auto">
                                  Download
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-md">
                    <p className="text-muted-foreground">No reports available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
