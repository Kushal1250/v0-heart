"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, User, Settings, Lock, Activity, Heart } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { ExternalServicesSync } from "@/components/external-services-sync"
import { RecentHealthNotifications } from "@/components/recent-health-notifications"
import { HeartHealthRoutine } from "@/components/heart-health-routine"
import { ProfileImageUpload } from "@/components/profile-image-upload"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  profilePicture: string | null
  role: string
  createdAt: string
}

interface HealthData {
  height: number
  weight: number
  bloodType: string
  allergies: string
  medications: string
  conditions: string
  familyHistory: string
  lastCheckup: string
}

interface UserPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  appNotifications: boolean
  darkMode: boolean
  language: string
  dataSharing: boolean
  twoFactorAuth: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [healthData, setHealthData] = useState<HealthData>({
    height: 0,
    weight: 0,
    bloodType: "",
    allergies: "",
    medications: "",
    conditions: "",
    familyHistory: "",
    lastCheckup: "",
  })
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    appNotifications: true,
    darkMode: false,
    language: "English",
    dataSharing: false,
    twoFactorAuth: false,
  })
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/user/profile")
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
          name: data.name,
          email: data.email,
          phone: data.phone || "",
        })
        setLoading(false)
      } catch (err) {
        setError("Failed to load profile. Please try again later.")
        setLoading(false)
      }
    }

    const fetchHealthData = async () => {
      try {
        const response = await fetch("/api/user/health-data")
        if (response.ok) {
          const data = await response.json()
          setHealthData(data)
        }
      } catch (err) {
        console.error("Failed to fetch health data", err)
      }
    }

    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/user/preferences")
        if (response.ok) {
          const data = await response.json()
          setPreferences(data)
        }
      } catch (err) {
        console.error("Failed to fetch preferences", err)
      }
    }

    fetchUserProfile()
    fetchHealthData()
    fetchPreferences()
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
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
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError("Failed to update profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to change password")
      }

      setSuccess("Password changed successfully!")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err: any) {
      setError(err.message || "Failed to change password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleHealthDataUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/user/health-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(healthData),
      })

      if (!response.ok) {
        throw new Error("Failed to update health data")
      }

      setSuccess("Health information updated successfully!")
    } catch (err) {
      setError("Failed to update health information. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePreferencesUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) {
        throw new Error("Failed to update preferences")
      }

      setSuccess("Preferences updated successfully!")
    } catch (err) {
      setError("Failed to update preferences. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Profile</CardTitle>
              <CardDescription>Manage your personal information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <div className="mb-4">
                <ProfileImageUpload
                  currentImage={profile?.profilePicture || "/abstract-profile.png"}
                  userId={profile?.id || ""}
                  onSuccess={() => setSuccess("Profile picture updated successfully!")}
                  onError={() => setError("Failed to update profile picture")}
                />
              </div>
              <h3 className="text-xl font-semibold">{profile?.name}</h3>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <div className="mt-2">
                <Badge variant="outline" className="mr-1">
                  {profile?.role || "User"}
                </Badge>
                <Badge variant="outline">
                  Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="md:w-2/3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="health" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Health</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">Success</AlertTitle>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle>Health Information</CardTitle>
                  <CardDescription>Manage your health details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleHealthDataUpdate}>
                    <div className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="height">Height (cm)</Label>
                          <Input
                            id="height"
                            type="number"
                            value={healthData.height || ""}
                            onChange={(e) => setHealthData({ ...healthData, height: Number(e.target.value) })}
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="weight">Weight (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            value={healthData.weight || ""}
                            onChange={(e) => setHealthData({ ...healthData, weight: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Input
                          id="bloodType"
                          value={healthData.bloodType || ""}
                          onChange={(e) => setHealthData({ ...healthData, bloodType: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                          id="allergies"
                          value={healthData.allergies || ""}
                          onChange={(e) => setHealthData({ ...healthData, allergies: e.target.value })}
                          placeholder="List any allergies you have"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="medications">Current Medications</Label>
                        <Textarea
                          id="medications"
                          value={healthData.medications || ""}
                          onChange={(e) => setHealthData({ ...healthData, medications: e.target.value })}
                          placeholder="List any medications you're currently taking"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="conditions">Medical Conditions</Label>
                        <Textarea
                          id="conditions"
                          value={healthData.conditions || ""}
                          onChange={(e) => setHealthData({ ...healthData, conditions: e.target.value })}
                          placeholder="List any medical conditions you have"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="familyHistory">Family Medical History</Label>
                        <Textarea
                          id="familyHistory"
                          value={healthData.familyHistory || ""}
                          onChange={(e) => setHealthData({ ...healthData, familyHistory: e.target.value })}
                          placeholder="Relevant family medical history"
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="lastCheckup">Last Medical Checkup</Label>
                        <Input
                          id="lastCheckup"
                          type="date"
                          value={healthData.lastCheckup || ""}
                          onChange={(e) => setHealthData({ ...healthData, lastCheckup: e.target.value })}
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Health Information"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePreferencesUpdate} className="mb-8">
                    <div className="grid gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notifications</h3>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={preferences.emailNotifications}
                            onCheckedChange={(checked) =>
                              setPreferences({ ...preferences, emailNotifications: checked })
                            }
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="smsNotifications">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive text message updates</p>
                          </div>
                          <Switch
                            id="smsNotifications"
                            checked={preferences.smsNotifications}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, smsNotifications: checked })}
                          />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="appNotifications">App Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                          </div>
                          <Switch
                            id="appNotifications"
                            checked={preferences.appNotifications}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, appNotifications: checked })}
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Appearance</h3>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="darkMode">Dark Mode</Label>
                            <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                          </div>
                          <Switch
                            id="darkMode"
                            checked={preferences.darkMode}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, darkMode: checked })}
                          />
                        </div>
                        <Separator />
                        <div className="grid gap-3">
                          <Label htmlFor="language">Language</Label>
                          <Input
                            id="language"
                            value={preferences.language}
                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Preferences"}
                      </Button>
                    </div>
                  </form>

                  <Separator className="my-8" />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange}>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" disabled={loading}>
                          {loading ? "Changing..." : "Change Password"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy & Security</CardTitle>
                  <CardDescription>Manage your privacy and security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePreferencesUpdate}>
                    <div className="grid gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Data Sharing</h3>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="dataSharing">Share Anonymous Data</Label>
                            <p className="text-sm text-muted-foreground">
                              Allow anonymous data sharing for research purposes
                            </p>
                          </div>
                          <Switch
                            id="dataSharing"
                            checked={preferences.dataSharing}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, dataSharing: checked })}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="twoFactorAuth">Enable 2FA</Label>
                            <p className="text-sm text-muted-foreground">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Switch
                            id="twoFactorAuth"
                            checked={preferences.twoFactorAuth}
                            onCheckedChange={(checked) => setPreferences({ ...preferences, twoFactorAuth: checked })}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Connected Services</h3>
                        <ExternalServicesSync />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Privacy Settings"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your recent actions and notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Health Notifications</h3>
                        <RecentHealthNotifications />
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-4">Heart Health Routine</h3>
                        <HeartHealthRoutine />
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-medium mb-4">Assessment History</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Heart Disease Risk Assessment</h4>
                              <p className="text-sm text-muted-foreground">Completed on May 10, 2023</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => router.push("/history")}>
                              View Details
                            </Button>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Cardiovascular Health Check</h4>
                              <p className="text-sm text-muted-foreground">Completed on April 22, 2023</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => router.push("/history")}>
                              View Details
                            </Button>
                          </div>
                          <Separator />
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">Lifestyle Assessment</h4>
                              <p className="text-sm text-muted-foreground">Completed on March 15, 2023</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => router.push("/history")}>
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => router.push("/history")}>
                      View All Activity
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
