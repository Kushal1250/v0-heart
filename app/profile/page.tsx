"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

// Define the HealthService type
type HealthService = {
  id: string
  name: string
  icon: React.ReactNode
  connected: boolean
}

// External Services Sync Component
const ExternalServicesSync = ({
  connectedServices,
  onConnect,
  onDisconnect,
}: {
  connectedServices: HealthService[]
  onConnect: (service: HealthService) => void
  onDisconnect: (serviceId: string) => void
}) => {
  const availableServices: HealthService[] = [
    { id: "fitbit", name: "Fitbit", icon: <Activity className="h-5 w-5" />, connected: false },
    { id: "apple-health", name: "Apple Health", icon: <Heart className="h-5 w-5" />, connected: false },
    { id: "google-fit", name: "Google Fit", icon: <Activity className="h-5 w-5" />, connected: false },
    { id: "samsung-health", name: "Samsung Health", icon: <Heart className="h-5 w-5" />, connected: false },
  ]

  // Update connected status based on connectedServices
  const services = availableServices.map((service) => ({
    ...service,
    connected: connectedServices.some((cs) => cs.id === service.id),
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {services.map((service) => (
        <div
          key={service.id}
          className="bg-gray-50 p-4 rounded-md border border-gray-200 flex justify-between items-center"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full">{service.icon}</div>
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-xs text-muted-foreground">{service.connected ? "Connected" : "Not connected"}</p>
            </div>
          </div>
          <Button
            variant={service.connected ? "outline" : "default"}
            size="sm"
            onClick={() => (service.connected ? onDisconnect(service.id) : onConnect(service))}
          >
            {service.connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      ))}
    </div>
  )
}

// Recent Health Notifications Component
const RecentHealthNotifications = ({ hasPendingHealth }: { hasPendingHealth: boolean }) => {
  const notifications = [
    {
      id: 1,
      title: "Heart Health Assessment Due",
      description: "It's been 3 months since your last assessment",
      date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      type: "reminder",
    },
    {
      id: 2,
      title: "Blood Pressure Trend",
      description: "Your blood pressure readings have improved over the last month",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      type: "achievement",
    },
    {
      id: 3,
      title: "New Health Article",
      description: "Read our latest article on heart-healthy diets",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      type: "info",
    },
  ]

  return (
    <div className="space-y-4">
      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-md border ${
              notification.type === "reminder"
                ? "bg-amber-50 border-amber-200"
                : notification.type === "achievement"
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium">{notification.title}</h4>
                <p className="text-sm text-muted-foreground">{notification.description}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(notification.date, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-md border border-gray-200">
          <p className="text-muted-foreground">No notifications at this time</p>
        </div>
      )}
    </div>
  )
}

// Heart Health Routine Component
const HeartHealthRoutine = () => {
  const routines = [
    {
      id: 1,
      title: "Morning Walk",
      description: "30 minutes of brisk walking",
      time: "7:00 AM",
      completed: true,
    },
    {
      id: 2,
      title: "Blood Pressure Check",
      description: "Record your blood pressure",
      time: "9:00 AM",
      completed: true,
    },
    {
      id: 3,
      title: "Medication",
      description: "Take your daily medication",
      time: "8:00 AM & 8:00 PM",
      completed: false,
    },
    {
      id: 4,
      title: "Evening Relaxation",
      description: "15 minutes of meditation",
      time: "9:30 PM",
      completed: false,
    },
  ]

  return (
    <div className="space-y-4">
      {routines.map((routine) => (
        <div
          key={routine.id}
          className={`p-4 rounded-md border ${
            routine.completed ? "bg-gray-50 border-gray-200" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium flex items-center">
                {routine.completed && <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />}
                {routine.title}
              </h4>
              <p className="text-sm text-muted-foreground">{routine.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{routine.time}</p>
            </div>
            {!routine.completed && (
              <Button variant="outline" size="sm">
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const { user, isLoading, logout, updateUserProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("personal")
  const [useSimpleUploader, setUseSimpleUploader] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
    emailNotifications: false,
    smsNotifications: false,
    appNotifications: false,

    // Privacy & Security
    twoFactorEnabled: false,
    emailVerified: false,
    phoneVerified: false,
    dataSharing: false,
    anonymousDataCollection: false,

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

  const [connectedServices, setConnectedServices] = useState<HealthService[]>([])
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [hasPendingHealth, setHasPendingHealth] = useState(false)
  const [reminderDate, setReminderDate] = useState<Date | undefined>(undefined)

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
      // Simulate loading without fetching real data
      setTimeout(() => {
        setIsFetchingProfile(false)

        // Just update with empty/placeholder values
        if (user) {
          setProfileData((prevData) => ({
            ...prevData,
            name: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            profile_picture: user.profile_picture || "",
          }))

          setFormData({
            name: user.name || "",
            phone: user.phone || "",
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
        }

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

  const handleServiceConnection = (service: HealthService) => {
    setConnectedServices((prev) => [...prev, service])
    toast({
      title: `Connected to ${service.name}`,
      description: `Your ${service.name} health data will now sync with your profile.`,
    })
  }

  const handleDisconnectService = (serviceId: string) => {
    setConnectedServices((prev) => prev.filter((service) => service.id !== serviceId))
    toast({
      title: "Service disconnected",
      description: "The service has been disconnected from your account.",
    })
  }

  const handleSetReminder = (date: Date | undefined) => {
    setReminderDate(date)
    setShowCalendar(false)
    if (date) {
      toast({
        title: "Health check reminder set",
        description: `You'll receive a reminder on ${format(date, "MMMM d, yyyy")}`,
      })
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
      // Simulate a submission without sending real data
      setTimeout(() => {
        // Update local state
        setProfileData((prev) => ({
          ...prev,
          name: formData.name,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
        }))

        // Update auth context if available
        if (updateUserProfile) {
          updateUserProfile({
            name: formData.name,
            phone: formData.phone,
          })
        }

        setIsEditing(false)
        setIsSubmitting(false)
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

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      setAlert({
        type: "error",
        message: "An error occurred during logout. Please try again.",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground mt-4">Loading account information...</p>
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
                <div className="space-y-6">
                  <div className="pt-2">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" /> Security Settings
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
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
                          <Button variant="outline" size="sm">
                            {profileData.twoFactorEnabled ? "Disable" : "Enable"}
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
                          {profileData.emailVerified ? (
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

                      <Separator />

                      <div className="flex items-center justify-between">
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
                          checked={profileData.dataSharing}
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
                                <td className="py-3 px-4 flex gap-2">
                                  <Button variant="link" size="sm" className="p-0 h-auto">
                                    View Details
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-auto">
                                    <FileText className="h-4 w-4 mr-1" /> PDF
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

                    {profileData.heartHealthScores && profileData.heartHealthScores.length > 0 ? (
                      <div className="bg-white p-4 rounded-md border border-gray-200 h-48">
                        {/* Visual representation of scores would go here */}
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

                  {/* Connected Health Services Section */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <RefreshCw className="h-5 w-5" /> Connected Health Services
                    </h3>

                    <ExternalServicesSync
                      connectedServices={connectedServices}
                      onConnect={handleServiceConnection}
                      onDisconnect={handleDisconnectService}
                    />
                  </div>

                  {/* Health Check Reminder Section */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Bell className="h-5 w-5" /> Health Check Reminder
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Schedule your next health check</p>
                          <p className="text-sm text-muted-foreground">
                            {reminderDate
                              ? `Reminder set for ${format(reminderDate, "MMMM d, yyyy")}`
                              : "No reminder set yet"}
                          </p>
                        </div>
                        <Button variant="outline" onClick={() => setShowCalendar(!showCalendar)}>
                          <CalendarIcon className="h-4 w-4 mr-2" />
                          {reminderDate ? "Change date" : "Set reminder"}
                        </Button>
                      </div>

                      {showCalendar && (
                        <div className="mt-4 p-4 bg-white border rounded-md">
                          <div className="flex justify-end mb-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowCalendar(false)}>
                              Close
                            </Button>
                          </div>
                          <div className="flex flex-col space-y-4">
                            <div className="grid grid-cols-7 gap-2">
                              {Array.from({ length: 30 }, (_, i) => {
                                const date = new Date()
                                date.setDate(date.getDate() + i + 1)
                                return (
                                  <Button
                                    key={i}
                                    variant="outline"
                                    className="h-10 p-0"
                                    onClick={() => handleSetReminder(date)}
                                  >
                                    {date.getDate()}
                                  </Button>
                                )
                              })}
                            </div>
                            <Button variant="outline" onClick={() => handleSetReminder(undefined)}>
                              Clear reminder
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Health Notifications */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Bell className="h-5 w-5" /> Health Notifications
                    </h3>

                    <RecentHealthNotifications hasPendingHealth={hasPendingHealth} />
                  </div>

                  {/* Personalized Health Routine */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" /> Your Heart Health Routine
                    </h3>

                    <HeartHealthRoutine />
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
