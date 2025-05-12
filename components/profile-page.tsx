"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle, Clock, Activity, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data for fallback when API fails
const MOCK_DATA = {
  profile: {
    id: "user-1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    profilePicture: "/abstract-profile.png",
    dateOfBirth: "1985-05-15",
    gender: "male",
    address: "123 Main St, Anytown, USA",
    emergencyContact: "Jane Doe (Wife) - +1 (555) 987-6543",
    bio: "Health enthusiast focused on heart wellness.",
  },
  healthInfo: {
    height: "175",
    weight: "70",
    bloodType: "O+",
    allergies: "None",
    medications: "Lisinopril 10mg daily",
    conditions: "Mild hypertension",
    familyHistory: "Father had heart disease",
  },
  notificationPreferences: [
    { id: "notif-1", type: "Email Notifications", enabled: true },
    { id: "notif-2", type: "SMS Notifications", enabled: false },
    { id: "notif-3", type: "App Notifications", enabled: true },
    { id: "notif-4", type: "Health Reminders", enabled: true },
  ],
  privacySettings: [
    { id: "privacy-1", setting: "Share Health Data with Doctors", enabled: true },
    { id: "privacy-2", setting: "Anonymous Data for Research", enabled: true },
    { id: "privacy-3", setting: "Third-Party App Access", enabled: false },
    { id: "privacy-4", setting: "Location Tracking", enabled: false },
  ],
  healthReminders: [
    { id: "reminder-1", title: "Blood Pressure Check", date: "2023-06-15", completed: true },
    { id: "reminder-2", title: "Annual Physical", date: "2023-07-20", completed: false },
    { id: "reminder-3", title: "Medication Refill", date: "2023-06-05", completed: true },
  ],
  healthAssessments: [
    { id: "assessment-1", date: "2023-05-10", score: 85, risk: "Low" },
    { id: "assessment-2", date: "2023-04-05", score: 78, risk: "Low" },
    { id: "assessment-3", date: "2023-03-01", score: 72, risk: "Medium" },
  ],
  connectedServices: [
    { id: "service-1", name: "Fitbit", connected: true, lastSync: "2023-05-28T14:30:00Z" },
    { id: "service-2", name: "Apple Health", connected: false, lastSync: "" },
    { id: "service-3", name: "Google Fit", connected: false, lastSync: "" },
    { id: "service-4", name: "Samsung Health", connected: true, lastSync: "2023-05-27T09:15:00Z" },
  ],
  healthScore: 82,
}

// Types
interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  profilePicture: string
  dateOfBirth: string
  gender: string
  address: string
  emergencyContact: string
  bio: string
}

interface HealthInfo {
  height: string
  weight: string
  bloodType: string
  allergies: string
  medications: string
  conditions: string
  familyHistory: string
}

interface NotificationPreference {
  id: string
  type: string
  enabled: boolean
}

interface PrivacySetting {
  id: string
  setting: string
  enabled: boolean
}

interface HealthReminder {
  id: string
  title: string
  date: string
  completed: boolean
}

interface HealthAssessment {
  id: string
  date: string
  score: number
  risk: string
}

interface HealthService {
  id: string
  name: string
  connected: boolean
  lastSync: string
}

// External Services Sync Component
export function ExternalServicesSync({
  services,
  onToggleService,
}: {
  services: HealthService[]
  onToggleService: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {services.map((service) => (
        <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-full mr-3">
              <Activity className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="font-medium">{service.name}</p>
              <p className="text-xs text-gray-500">
                {service.connected
                  ? `Last synced: ${new Date(service.lastSync).toLocaleString() || "Never"}`
                  : "Not connected"}
              </p>
            </div>
          </div>
          <Button
            variant={service.connected ? "outline" : "default"}
            size="sm"
            onClick={() => onToggleService(service.id)}
          >
            {service.connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      ))}
    </div>
  )
}

// Recent Health Notifications Component
export function RecentHealthNotifications() {
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
      {notifications.map((notification) => (
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
            <p className="text-xs text-muted-foreground">{notification.date.toLocaleDateString()}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// Heart Health Routine Component
export function HeartHealthRoutine() {
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
                {routine.completed && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
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
  const { user, isLoading: authLoading, updateUserProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // State for user profile data
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null)
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([])
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([])
  const [healthReminders, setHealthReminders] = useState<HealthReminder[]>([])
  const [healthAssessments, setHealthAssessments] = useState<HealthAssessment[]>([])
  const [connectedServices, setConnectedServices] = useState<HealthService[]>([])
  const [healthScore, setHealthScore] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState<boolean>(false)
  const [retryCount, setRetryCount] = useState<number>(0)
  const [useFallbackData, setUseFallbackData] = useState<boolean>(false)

  // Fetch user profile data
  useEffect(() => {
    if (authLoading) return

    if (!user && !useFallbackData) {
      router.push("/login")
      return
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (useFallbackData) {
          // Use mock data if we've decided to use fallback data
          setProfile(MOCK_DATA.profile)
          setHealthInfo(MOCK_DATA.healthInfo)
          setNotificationPreferences(MOCK_DATA.notificationPreferences)
          setPrivacySettings(MOCK_DATA.privacySettings)
          setHealthReminders(MOCK_DATA.healthReminders)
          setHealthAssessments(MOCK_DATA.healthAssessments)
          setConnectedServices(MOCK_DATA.connectedServices)
          setHealthScore(MOCK_DATA.healthScore)
          setLoading(false)
          return
        }

        // Try to fetch real data from API
        // Fetch user profile
        const profileResponse = await fetch("/api/user/profile", {
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!profileResponse.ok) {
          throw new Error("Failed to fetch profile data")
        }

        const profileData = await profileResponse.json()

        // Map API response to our expected format
        setProfile({
          id: profileData.id || "user-1",
          name: profileData.name || user?.name || "User",
          email: profileData.email || user?.email || "user@example.com",
          phone: profileData.phone || "",
          profilePicture: profileData.profile_picture || "/abstract-profile.png",
          dateOfBirth: profileData.dateOfBirth || "",
          gender: profileData.gender || "",
          address: profileData.address || "",
          emergencyContact: profileData.emergencyContact || "",
          bio: profileData.bio || "",
        })

        // Try to fetch other data, but don't fail if these requests fail
        try {
          const healthResponse = await fetch("/api/user/health-data")
          if (healthResponse.ok) {
            const healthData = await healthResponse.json()
            setHealthInfo(healthData)
          }
        } catch (err) {
          console.warn("Could not fetch health data, using defaults", err)
          setHealthInfo(MOCK_DATA.healthInfo)
        }

        try {
          const notificationsResponse = await fetch("/api/user/preferences/notifications")
          if (notificationsResponse.ok) {
            const notificationsData = await notificationsResponse.json()
            setNotificationPreferences(notificationsData)
          }
        } catch (err) {
          console.warn("Could not fetch notification preferences, using defaults", err)
          setNotificationPreferences(MOCK_DATA.notificationPreferences)
        }

        try {
          const privacyResponse = await fetch("/api/user/preferences/privacy")
          if (privacyResponse.ok) {
            const privacyData = await privacyResponse.json()
            setPrivacySettings(privacyData)
          }
        } catch (err) {
          console.warn("Could not fetch privacy settings, using defaults", err)
          setPrivacySettings(MOCK_DATA.privacySettings)
        }

        try {
          const remindersResponse = await fetch("/api/user/health-reminders")
          if (remindersResponse.ok) {
            const remindersData = await remindersResponse.json()
            setHealthReminders(remindersData)
          }
        } catch (err) {
          console.warn("Could not fetch health reminders, using defaults", err)
          setHealthReminders(MOCK_DATA.healthReminders)
        }

        try {
          const assessmentsResponse = await fetch("/api/user/predictions")
          if (assessmentsResponse.ok) {
            const assessmentsData = await assessmentsResponse.json()

            // Format the predictions data for the UI
            const formattedAssessments = assessmentsData.map((pred: any) => ({
              id: pred.id,
              date: pred.created_at,
              score: Math.round(pred.result * 100),
              risk: getRiskLevel(pred.result * 100),
            }))

            setHealthAssessments(formattedAssessments)
          }
        } catch (err) {
          console.warn("Could not fetch health assessments, using defaults", err)
          setHealthAssessments(MOCK_DATA.healthAssessments)
        }

        try {
          const servicesResponse = await fetch("/api/user/health-services")
          if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json()
            setConnectedServices(servicesData)
          }
        } catch (err) {
          console.warn("Could not fetch connected services, using defaults", err)
          setConnectedServices(MOCK_DATA.connectedServices)
        }

        try {
          const scoreResponse = await fetch("/api/user/health-metrics")
          if (scoreResponse.ok) {
            const scoreData = await scoreResponse.json()
            setHealthScore(scoreData.heartHealthScore || MOCK_DATA.healthScore)
          }
        } catch (err) {
          console.warn("Could not fetch health score, using defaults", err)
          setHealthScore(MOCK_DATA.healthScore)
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError("Failed to load profile data. Please try again later.")
        setLoading(false)
      }
    }

    fetchProfileData()
  }, [user, authLoading, router, retryCount, useFallbackData])

  // Helper function to determine risk level based on score
  const getRiskLevel = (score: number) => {
    if (score >= 80) return "Low"
    if (score >= 60) return "Medium"
    return "High"
  }

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useFallbackData) {
      toast({
        title: "Demo Mode",
        description: "Profile updates are disabled in demo mode.",
        variant: "default",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile?.name,
          phone: profile?.phone,
          // Add other fields as needed
        }),
      })

      if (!response.ok) throw new Error("Failed to update profile")

      setSuccessMessage("Profile updated successfully!")

      // Update the auth context if available
      if (updateUserProfile && profile) {
        updateUserProfile({
          name: profile.name,
          phone: profile.phone,
        })
      }

      setTimeout(() => setSuccessMessage(null), 3000)
      setLoading(false)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError("Failed to update profile. Please try again.")
      setLoading(false)
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle health info update
  const handleHealthInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (useFallbackData) {
      toast({
        title: "Demo Mode",
        description: "Health information updates are disabled in demo mode.",
        variant: "default",
      })
      return
    }

    try {
      setLoading(true)
      const response = await fetch("/api/user/health-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(healthInfo),
      })

      if (!response.ok) throw new Error("Failed to update health information")

      setSuccessMessage("Health information updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      setLoading(false)
    } catch (err) {
      console.error("Error updating health info:", err)
      setError("Failed to update health information. Please try again.")
      setLoading(false)
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle notification preference toggle
  const handleNotificationToggle = async (id: string) => {
    if (useFallbackData) {
      // Just update the UI in demo mode
      setNotificationPreferences((prev) =>
        prev.map((pref) => (pref.id === id ? { ...pref, enabled: !pref.enabled } : pref)),
      )
      return
    }

    try {
      const updatedPreferences = notificationPreferences.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref,
      )

      setNotificationPreferences(updatedPreferences)

      const toggledPref = updatedPreferences.find((pref) => pref.id === id)

      const response = await fetch("/api/user/preferences/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, enabled: toggledPref?.enabled }),
      })

      if (!response.ok) {
        // Revert the change if the API call fails
        setNotificationPreferences(notificationPreferences)
        throw new Error("Failed to update notification preference")
      }
    } catch (err) {
      console.error("Error toggling notification:", err)
      setError("Failed to update notification preference. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle privacy setting toggle
  const handlePrivacyToggle = async (id: string) => {
    if (useFallbackData) {
      // Just update the UI in demo mode
      setPrivacySettings((prev) =>
        prev.map((setting) => (setting.id === id ? { ...setting, enabled: !setting.enabled } : setting)),
      )
      return
    }

    try {
      const updatedSettings = privacySettings.map((setting) =>
        setting.id === id ? { ...setting, enabled: !setting.enabled } : setting,
      )

      setPrivacySettings(updatedSettings)

      const toggledSetting = updatedSettings.find((setting) => setting.id === id)

      const response = await fetch("/api/user/preferences/privacy", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, enabled: toggledSetting?.enabled }),
      })

      if (!response.ok) {
        // Revert the change if the API call fails
        setPrivacySettings(privacySettings)
        throw new Error("Failed to update privacy setting")
      }
    } catch (err) {
      console.error("Error toggling privacy setting:", err)
      setError("Failed to update privacy setting. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle health reminder toggle
  const handleReminderToggle = async (id: string) => {
    if (useFallbackData) {
      // Just update the UI in demo mode
      setHealthReminders((prev) =>
        prev.map((reminder) => (reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder)),
      )
      return
    }

    try {
      const updatedReminders = healthReminders.map((reminder) =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder,
      )

      setHealthReminders(updatedReminders)

      const toggledReminder = updatedReminders.find((reminder) => reminder.id === id)

      const response = await fetch("/api/user/health-reminders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, completed: toggledReminder?.completed }),
      })

      if (!response.ok) {
        // Revert the change if the API call fails
        setHealthReminders(healthReminders)
        throw new Error("Failed to update health reminder")
      }
    } catch (err) {
      console.error("Error toggling health reminder:", err)
      setError("Failed to update health reminder. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (useFallbackData) {
      toast({
        title: "Demo Mode",
        description: "Image uploads are disabled in demo mode.",
        variant: "default",
      })
      return
    }

    try {
      setUploadingImage(true)

      const formData = new FormData()
      formData.append("profileImage", file)

      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload profile image")

      const data = await response.json()

      setProfile((prev) => (prev ? { ...prev, profilePicture: data.imageUrl } : null))

      // Update the auth context if available
      if (updateUserProfile) {
        updateUserProfile({
          profile_picture: data.imageUrl,
        })
      }

      setSuccessMessage("Profile image updated successfully!")
      setTimeout(() => setSuccessMessage(null), 3000)
      setUploadingImage(false)
    } catch (err) {
      console.error("Error uploading profile image:", err)
      setError("Failed to upload profile image. Please try again.")
      setUploadingImage(false)
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle service connection toggle
  const handleServiceToggle = async (id: string) => {
    if (useFallbackData) {
      // Just update the UI in demo mode
      setConnectedServices((prev) =>
        prev.map((service) => {
          if (service.id === id) {
            return {
              ...service,
              connected: !service.connected,
              lastSync: !service.connected ? new Date().toISOString() : service.lastSync,
            }
          }
          return service
        }),
      )

      const service = connectedServices.find((s) => s.id === id)
      if (service) {
        toast({
          title: service.connected ? "Service Disconnected" : "Service Connected",
          description: `${service.name} has been ${service.connected ? "disconnected" : "connected"} successfully.`,
          variant: "default",
        })
      }

      return
    }

    try {
      const service = connectedServices.find((s) => s.id === id)

      if (!service) return

      if (service.connected) {
        // Disconnect service
        const response = await fetch(`/api/user/health-services/${id}/disconnect`, {
          method: "POST",
        })

        if (!response.ok) throw new Error("Failed to disconnect service")

        setConnectedServices((prev) => prev.map((s) => (s.id === id ? { ...s, connected: false } : s)))

        setSuccessMessage(`Disconnected from ${service.name} successfully!`)
      } else {
        // Connect service - this would typically redirect to OAuth flow
        // For demo purposes, we'll just simulate a successful connection
        const response = await fetch(`/api/user/health-services/${id}/connect`, {
          method: "POST",
        })

        if (!response.ok) throw new Error("Failed to connect service")

        setConnectedServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, connected: true, lastSync: new Date().toISOString() } : s)),
        )

        setSuccessMessage(`Connected to ${service.name} successfully!`)
      }

      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error("Error toggling service connection:", err)
      setError("Failed to update service connection. Please try again.")
      setTimeout(() => setError(null), 3000)
    }
  }

  // Handle retry
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
    setError(null)
  }

  // Handle using demo data
  const handleUseDemoData = () => {
    setUseFallbackData(true)
    setError(null)
  }

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span>{error}</span>
            <div className="flex gap-2 mt-2 sm:mt-0 sm:ml-auto">
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-1" /> Retry
              </Button>
              <Button variant="outline" size="sm" onClick={handleUseDemoData}>
                Use Demo Data
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
        </Alert>
      )}

      {useFallbackData && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-700">Demo Mode</AlertTitle>
          <AlertDescription className="text-blue-600">
            You are viewing demo data. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profile?.profilePicture || "/abstract-profile.png"}
                      alt={profile?.name || "User"}
                    />
                    <AvatarFallback>{profile?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-image-upload"
                    className="absolute bottom-0 right-0 bg-red-500 text-white rounded-full p-1 cursor-pointer hover:bg-red-600 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <input
                      id="profile-image-upload"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
              </div>
              <CardTitle className="text-xl">{profile?.name || "User Name"}</CardTitle>
              <CardDescription>{profile?.email || "user@example.com"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Heart Health Score</p>
                  <div className="mt-1">
                    <Progress value={healthScore} className="h-2" />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">0</span>
                      <span className="text-xs font-medium">{healthScore}%</span>
                      <span className="text-xs text-gray-500">100</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                  <div className="mt-2 space-y-2">
                    {healthAssessments.slice(0, 3).map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Activity className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm">Health Assessment</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-500 mr-2">
                            {new Date(assessment.date).toLocaleDateString()}
                          </span>
                          <Badge
                            variant={
                              assessment.risk === "Low"
                                ? "outline"
                                : assessment.risk === "Medium"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {assessment.risk}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profile?.name || ""}
                          onChange={(e) => setProfile((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || ""}
                          onChange={(e) => setProfile((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profile?.phone || ""}
                          onChange={(e) => setProfile((prev) => (prev ? { ...prev, phone: e.target.value } : null))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={profile?.dateOfBirth || ""}
                          onChange={(e) =>
                            setProfile((prev) => (prev ? { ...prev, dateOfBirth: e.target.value } : null))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <select
                          id="gender"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={profile?.gender || ""}
                          onChange={(e) => setProfile((prev) => (prev ? { ...prev, gender: e.target.value } : null))}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="emergency">Emergency Contact</Label>
                        <Input
                          id="emergency"
                          value={profile?.emergencyContact || ""}
                          onChange={(e) =>
                            setProfile((prev) => (prev ? { ...prev, emergencyContact: e.target.value } : null))
                          }
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea
                          id="address"
                          value={profile?.address || ""}
                          onChange={(e) => setProfile((prev) => (prev ? { ...prev, address: e.target.value } : null))}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profile?.bio || ""}
                          onChange={(e) => setProfile((prev) => (prev ? { ...prev, bio: e.target.value } : null))}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Information Tab */}
            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <CardTitle>Health Information</CardTitle>
                  <CardDescription>Update your health details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleHealthInfoUpdate}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          value={healthInfo?.height || ""}
                          onChange={(e) => setHealthInfo((prev) => (prev ? { ...prev, height: e.target.value } : null))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          value={healthInfo?.weight || ""}
                          onChange={(e) => setHealthInfo((prev) => (prev ? { ...prev, weight: e.target.value } : null))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <select
                          id="bloodType"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={healthInfo?.bloodType || ""}
                          onChange={(e) =>
                            setHealthInfo((prev) => (prev ? { ...prev, bloodType: e.target.value } : null))
                          }
                        >
                          <option value="">Select Blood Type</option>
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

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="allergies">Allergies</Label>
                        <Textarea
                          id="allergies"
                          value={healthInfo?.allergies || ""}
                          onChange={(e) =>
                            setHealthInfo((prev) => (prev ? { ...prev, allergies: e.target.value } : null))
                          }
                          placeholder="List any allergies you have"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="medications">Current Medications</Label>
                        <Textarea
                          id="medications"
                          value={healthInfo?.medications || ""}
                          onChange={(e) =>
                            setHealthInfo((prev) => (prev ? { ...prev, medications: e.target.value } : null))
                          }
                          placeholder="List any medications you're currently taking"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="conditions">Medical Conditions</Label>
                        <Textarea
                          id="conditions"
                          value={healthInfo?.conditions || ""}
                          onChange={(e) =>
                            setHealthInfo((prev) => (prev ? { ...prev, conditions: e.target.value } : null))
                          }
                          placeholder="List any medical conditions you have"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="familyHistory">Family Medical History</Label>
                        <Textarea
                          id="familyHistory"
                          value={healthInfo?.familyHistory || ""}
                          onChange={(e) =>
                            setHealthInfo((prev) => (prev ? { ...prev, familyHistory: e.target.value } : null))
                          }
                          placeholder="Describe any relevant family medical history"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <Button type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Notification Preferences</h3>
                      <p className="text-sm text-gray-500 mb-4">Control which notifications you receive</p>

                      <div className="space-y-4">
                        {notificationPreferences.map((pref) => (
                          <div key={pref.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{pref.type}</p>
                              <p className="text-sm text-gray-500">
                                {pref.type === "Email Notifications"
                                  ? "Receive updates and alerts via email"
                                  : pref.type === "SMS Notifications"
                                    ? "Receive updates and alerts via SMS"
                                    : pref.type === "App Notifications"
                                      ? "Receive in-app notifications"
                                      : pref.type === "Health Reminders"
                                        ? "Receive reminders for health check-ups"
                                        : "Receive important updates"}
                              </p>
                            </div>
                            <Switch checked={pref.enabled} onCheckedChange={() => handleNotificationToggle(pref.id)} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium">Password & Security</h3>
                      <p className="text-sm text-gray-500 mb-4">Update your password and security settings</p>

                      <div className="space-y-4">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Change Password
                        </Button>

                        <Button variant="outline" className="w-full sm:w-auto">
                          Enable Two-Factor Authentication
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                      <p className="text-sm text-gray-500 mb-4">Irreversible actions for your account</p>

                      <div className="space-y-4">
                        <Button variant="destructive" className="w-full sm:w-auto">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>Manage your data privacy preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">Data Sharing</h3>
                      <p className="text-sm text-gray-500 mb-4">Control how your data is shared</p>

                      <div className="space-y-4">
                        {privacySettings.map((setting) => (
                          <div key={setting.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{setting.setting}</p>
                              <p className="text-sm text-gray-500">
                                {setting.setting === "Share Health Data with Doctors"
                                  ? "Allow your doctors to access your health data"
                                  : setting.setting === "Anonymous Data for Research"
                                    ? "Contribute anonymized data for medical research"
                                    : setting.setting === "Third-Party App Access"
                                      ? "Allow third-party apps to access your data"
                                      : setting.setting === "Location Tracking"
                                        ? "Allow the app to track your location for personalized recommendations"
                                        : "Control how your data is used"}
                              </p>
                            </div>
                            <Switch checked={setting.enabled} onCheckedChange={() => handlePrivacyToggle(setting.id)} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium">Data Management</h3>
                      <p className="text-sm text-gray-500 mb-4">Manage your personal data</p>

                      <div className="space-y-4">
                        <Button variant="outline" className="w-full sm:w-auto">
                          Download My Data
                        </Button>

                        <Button variant="outline" className="w-full sm:w-auto">
                          Request Data Deletion
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Health Assessments</CardTitle>
                    <CardDescription>Your recent heart health assessments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {healthAssessments.length > 0 ? (
                        healthAssessments.map((assessment) => (
                          <div
                            key={assessment.id}
                            className="flex items-center justify-between border-b pb-3 last:border-0"
                          >
                            <div>
                              <p className="font-medium">Health Assessment</p>
                              <p className="text-sm text-gray-500">{new Date(assessment.date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center">
                              <span className="mr-2">{assessment.score}%</span>
                              <Badge
                                variant={
                                  assessment.risk === "Low"
                                    ? "outline"
                                    : assessment.risk === "Medium"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {assessment.risk} Risk
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No health assessments found</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      View All Assessments
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Heart Health Score Trend</CardTitle>
                    <CardDescription>Your heart health score over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-60 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <p>Chart visualization would go here</p>
                      <p className="text-sm">Showing your heart health progress</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Connected Health Services</CardTitle>
                    <CardDescription>Manage your connected health services</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ExternalServicesSync services={connectedServices} onToggleService={handleServiceToggle} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Health Check Reminders</CardTitle>
                    <CardDescription>Upcoming health check reminders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {healthReminders.length > 0 ? (
                        healthReminders.map((reminder) => (
                          <div key={reminder.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="mr-3">
                                {reminder.completed ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <Clock className="h-5 w-5 text-amber-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{reminder.title}</p>
                                <p className="text-sm text-gray-500">{new Date(reminder.date).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <Switch
                              checked={reminder.completed}
                              onCheckedChange={() => handleReminderToggle(reminder.id)}
                            />
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No reminders found</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      Add Reminder
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Health Notifications</CardTitle>
                    <CardDescription>Recent health-related notifications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentHealthNotifications />
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Your Heart Health Routine</CardTitle>
                    <CardDescription>Personalized heart health routine</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HeartHealthRoutine />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
