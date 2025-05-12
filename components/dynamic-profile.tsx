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
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPersonal, setEditingPersonal] = useState(false)
  const [editingHealth, setEditingHealth] = useState(false)
  const [personalFormData, setPersonalFormData] = useState<Partial<UserData>>({})
  const [healthFormData, setHealthFormData] = useState<Partial<UserData>>({})
  const [activeTab, setActiveTab] = useState("personal")
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true)

      // Instead of fetching, use empty data
      const fallbackData: UserData = {
        id: "",
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        profilePicture: "/abstract-profile.png",
        height: "",
        weight: "",
        bloodType: "",
        allergies: "",
        medicalConditions: "",
        medications: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelationship: "",
        accountType: "Standard",
        memberSince: "",
        lastLogin: "",
        subscriptionStatus: "Free",
        subscriptionRenewal: "",
        emailNotifications: false,
        smsNotifications: false,
        appNotifications: false,
        twoFactorEnabled: false,
        emailVerified: false,
        phoneVerified: false,
        dataSharing: false,
        anonymousDataCollection: false,
        recentAssessments: [],
        appointments: [],
        reports: [],
      }

      // Set the user data with empty values
      setUser(fallbackData)
      setPersonalFormData({
        name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
      })

      setHealthFormData({
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
    } catch (err) {
      console.error("Error fetching user data:", err)
      setError("Failed to load profile data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

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
      setUser((prev) => (prev ? { ...prev, [name]: checked } : null))

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
      // Don't actually send any data
      setTimeout(() => {
        setUser((prev) => (prev ? { ...prev, ...personalFormData } : null))
        setEditingPersonal(false)

        setSuccessMessage("Personal information updated successfully")
        setTimeout(() => setSuccessMessage(null), 3000)
      }, 500)
    } catch (err) {
      setError("Failed to update personal information. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Save health info
  const saveHealthInfo = async () => {
    try {
      // Don't actually send any data
      setTimeout(() => {
        setUser((prev) => (prev ? { ...prev, ...healthFormData } : null))
        setEditingHealth(false)

        setSuccessMessage("Health information updated successfully")
        setTimeout(() => setSuccessMessage(null), 3000)
      }, 500)
    } catch (err) {
      setError("Failed to update health information. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle profile picture upload
  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      // For demo, just create a local URL without uploading
      const localUrl = URL.createObjectURL(file)
      setUser((prev) => (prev ? { ...prev, profilePicture: localUrl } : null))

      setSuccessMessage("Profile picture updated successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError("Failed to upload profile picture. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle verification
  const handleVerification = async (type: "email" | "phone") => {
    try {
      // In a real app, you would send a verification request
      // await fetch(`/api/user/verify-${type}`, { method: 'POST' });

      setSuccessMessage(`Verification code sent to your ${type}`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(`Failed to send verification code to your ${type}. Please try again.`)
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle password change
  const handlePasswordChange = () => {
    // In a real app, you would redirect to password change page
    window.location.href = "/change-password"
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

                <div className="border-t pt-4 mt-2">
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

        {/* Privacy & Security Tab */}
        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
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
                          {user.emailVerified ? "Your email is verified" : "Your email is not verified"}
                        </p>
                      </div>
                      {!user.emailVerified && (
                        <Button variant="outline" onClick={() => handleVerification("email")}>
                          Verify Email
                        </Button>
                      )}
                      {user.emailVerified && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Phone Verification</p>
                        <p className="text-sm text-muted-foreground">
                          {user.phoneVerified ? "Your phone is verified" : "Your phone is not verified"}
                        </p>
                      </div>
                      {!user.phoneVerified && (
                        <Button variant="outline" onClick={() => handleVerification("phone")}>
                          Verify Phone
                        </Button>
                      )}
                      {user.phoneVerified && (
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
                      checked={user.twoFactorEnabled || false}
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
                        checked={user.dataSharing || false}
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
                        checked={user.anonymousDataCollection || false}
                        onCheckedChange={(checked) => handleToggleChange("anonymousDataCollection", checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Security Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => (window.location.href = "/login-activity")}>
                      View Login Activity
                    </Button>
                    <Button variant="outline" onClick={() => (window.location.href = "/security-log")}>
                      Security Log
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>View your recent activity and assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div>
                  <h3 className="font-medium mb-2">Recent Heart Health Assessments</h3>
                  {user.recentAssessments && user.recentAssessments.length > 0 ? (
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
                          {user.recentAssessments.map((assessment) => (
                            <tr key={assessment.id} className="border-b">
                              <td className="py-2 px-4">{assessment.date}</td>
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
                    <p className="text-muted-foreground">No recent assessments found.</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Upcoming Appointments</h3>
                  {user.appointments && user.appointments.length > 0 ? (
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
                          {user.appointments.map((appointment) => (
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
                    <p className="text-muted-foreground">No upcoming appointments.</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Recent Reports</h3>
                  {user.reports && user.reports.length > 0 ? (
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
                          {user.reports.map((report) => (
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
                    <p className="text-muted-foreground">No recent reports.</p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Activity Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => (window.location.href = "/history")}>
                      View Full History
                    </Button>
                    <Button variant="outline" onClick={() => (window.location.href = "/predict")}>
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
