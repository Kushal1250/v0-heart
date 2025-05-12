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
  UserCog,
  Bell,
  Shield,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { SimpleProfileUpload } from "@/components/simple-profile-upload"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import type { UserProfile } from "@/lib/user-profile-types"

export default function EnhancedProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    name: "",
    email: "",
    phone: "",
    created_at: "",
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
  const [activeTab, setActiveTab] = useState("personal")

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: false,
    sms: false,
    push: false,
    reminders: false,
    newsletter: false,
    assessment_results: false,
  })

  // Privacy preferences
  const [privacyPrefs, setPrivacyPrefs] = useState({
    share_with_doctors: false,
    share_for_research: false,
    anonymized_data_usage: false,
  })

  // Health data
  const [healthData, setHealthData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    blood_type: "",
    allergies: "",
    last_checkup_date: "",
  })

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
      // Just set loading state without fetching any real data
      setTimeout(() => {
        setIsFetchingProfile(false)
        setAlert({ type: null, message: "" })
      }, 500)
    } catch (error) {
      console.error("Error fetching profile:", error)
      setAlert({
        type: "error",
        message: "Failed to load profile data. Please try again later.",
      })
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

  const handleHealthDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setHealthData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNotificationToggle = (key: string) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handlePrivacyToggle = (key: string) => {
    setPrivacyPrefs((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAlert({ type: null, message: "" })

    try {
      // Simulate submission without actually sending data
      setTimeout(() => {
        setIsEditing(false)
        setAlert({
          type: "success",
          message: "Profile updated successfully!",
        })
        toast({
          title: "Success",
          description: "Your profile has been updated successfully!",
        })

        setTimeout(() => {
          setAlert({ type: null, message: "" })
        }, 3000)

        setIsSubmitting(false)
      }, 1000)
    } catch (error: any) {
      setAlert({
        type: "error",
        message: "An error occurred while updating your profile",
      })
      toast({
        title: "Error",
        description: "An error occurred while updating your profile",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleHealthDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate submission
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Your health information has been updated successfully!",
        })
        setIsSubmitting(false)
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An error occurred while updating your health information",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate submission
      setTimeout(() => {
        toast({
          title: "Success",
          description: "Your preferences have been updated successfully!",
        })
        setIsSubmitting(false)
      }, 1000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: "An error occurred while updating your preferences",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleProfileImageUpdate = (imageUrl: string) => {
    // Just update state without sending any data
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
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> Personal
                </TabsTrigger>
                <TabsTrigger value="health" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Health
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" /> Preferences
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Security
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
                          {profileData.created_at
                            ? `${formatDistanceToNow(new Date(profileData.created_at))} ago`
                            : "Unknown"}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Health Information Tab */}
              <TabsContent value="health">
                <form onSubmit={handleHealthDataSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={healthData.age}
                        onChange={handleHealthDataChange}
                        placeholder="Enter your age"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        name="gender"
                        value={healthData.gender}
                        onChange={(e) => setHealthData((prev) => ({ ...prev, gender: e.target.value }))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="height">Height (cm)</Label>
                      <Input
                        id="height"
                        name="height"
                        type="number"
                        value={healthData.height}
                        onChange={handleHealthDataChange}
                        placeholder="Enter your height in cm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        name="weight"
                        type="number"
                        value={healthData.weight}
                        onChange={handleHealthDataChange}
                        placeholder="Enter your weight in kg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="blood_type">Blood Type</Label>
                      <select
                        id="blood_type"
                        name="blood_type"
                        value={healthData.blood_type}
                        onChange={(e) => setHealthData((prev) => ({ ...prev, blood_type: e.target.value }))}
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
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_checkup_date">Last Checkup Date</Label>
                      <Input
                        id="last_checkup_date"
                        name="last_checkup_date"
                        type="date"
                        value={healthData.last_checkup_date}
                        onChange={handleHealthDataChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies (comma separated)</Label>
                    <Input
                      id="allergies"
                      name="allergies"
                      value={healthData.allergies}
                      onChange={handleHealthDataChange}
                      placeholder="Enter allergies separated by commas"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                        </>
                      ) : (
                        "Save Health Information"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Bell className="h-5 w-5" /> Notification Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email_notifications" className="font-medium">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch
                          id="email_notifications"
                          checked={notificationPrefs.email}
                          onCheckedChange={() => handleNotificationToggle("email")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms_notifications" className="font-medium">
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">Receive updates via text message</p>
                        </div>
                        <Switch
                          id="sms_notifications"
                          checked={notificationPrefs.sms}
                          onCheckedChange={() => handleNotificationToggle("sms")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="push_notifications" className="font-medium">
                            Push Notifications
                          </Label>
                          <p className="text-sm text-muted-foreground">Receive push notifications</p>
                        </div>
                        <Switch
                          id="push_notifications"
                          checked={notificationPrefs.push}
                          onCheckedChange={() => handleNotificationToggle("push")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="reminders" className="font-medium">
                            Reminders
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive reminders for assessments and follow-ups
                          </p>
                        </div>
                        <Switch
                          id="reminders"
                          checked={notificationPrefs.reminders}
                          onCheckedChange={() => handleNotificationToggle("reminders")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="newsletter" className="font-medium">
                            Newsletter
                          </Label>
                          <p className="text-sm text-muted-foreground">Receive our monthly heart health newsletter</p>
                        </div>
                        <Switch
                          id="newsletter"
                          checked={notificationPrefs.newsletter}
                          onCheckedChange={() => handleNotificationToggle("newsletter")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="assessment_results" className="font-medium">
                            Assessment Results
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications about your assessment results
                          </p>
                        </div>
                        <Switch
                          id="assessment_results"
                          checked={notificationPrefs.assessment_results}
                          onCheckedChange={() => handleNotificationToggle("assessment_results")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" /> Privacy Preferences
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="share_with_doctors" className="font-medium">
                            Share with Doctors
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Allow your doctors to access your heart health data
                          </p>
                        </div>
                        <Switch
                          id="share_with_doctors"
                          checked={privacyPrefs.share_with_doctors}
                          onCheckedChange={() => handlePrivacyToggle("share_with_doctors")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="share_for_research" className="font-medium">
                            Share for Research
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Allow your data to be used for medical research
                          </p>
                        </div>
                        <Switch
                          id="share_for_research"
                          checked={privacyPrefs.share_for_research}
                          onCheckedChange={() => handlePrivacyToggle("share_for_research")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="anonymized_data_usage" className="font-medium">
                            Anonymized Data Usage
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Allow anonymized data to be used for improving our services
                          </p>
                        </div>
                        <Switch
                          id="anonymized_data_usage"
                          checked={privacyPrefs.anonymized_data_usage}
                          onCheckedChange={() => handlePrivacyToggle("anonymized_data_usage")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security">
                <div className="space-y-6">
                  {/* Password Management Section */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <KeyRound className="h-5 w-5" /> Password Management
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Change your password</p>
                          <p className="text-sm text-gray-500">Update your password to keep your account secure</p>
                        </div>
                        <Button variant="outline" onClick={() => router.push("/change-password")}>
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" /> Two-Factor Authentication
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Enable two-factor authentication</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Setup 2FA</Button>
                      </div>
                    </div>
                  </div>

                  {/* Account Verification */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" /> Account Verification
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div>
                          <p className="font-medium">Email Verification</p>
                          <p className="text-sm text-gray-500">Verify your email address</p>
                        </div>
                        <div className="flex items-center">
                          {profileData.verification_status?.email_verified ? (
                            <span className="text-green-600 font-medium flex items-center">
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                            </span>
                          ) : (
                            <Button variant="outline" size="sm">
                              Verify Email
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div>
                          <p className="font-medium">Phone Verification</p>
                          <p className="text-sm text-gray-500">Verify your phone number</p>
                        </div>
                        <div className="flex items-center">
                          {profileData.verification_status?.phone_verified ? (
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
