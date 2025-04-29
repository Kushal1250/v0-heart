"use client"

import Link from "next/link"
import { ArrowLeft, SettingsIcon, Moon, Sun, Shield, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [saveHistory, setSaveHistory] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [dataSharing, setDataSharing] = useState(false)
  const [language, setLanguage] = useState("english")
  const [units, setUnits] = useState("metric")
  const [privacyMode, setPrivacyMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)
  const themeToggleRef = useRef<HTMLDivElement>(null)

  const { user, updateUserDetails } = useAuth()

  // Ensure we're mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true)

    // Fetch user settings from the API
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/settings")
        if (response.ok) {
          const data = await response.json()
          setTheme(data.theme || "dark")
          setSaveHistory(data.saveHistory !== undefined ? data.saveHistory : true)
          setNotifications(data.notifications !== undefined ? data.notifications : false)
          setEmailNotifications(data.emailNotifications !== undefined ? data.emailNotifications : false)
          setDataSharing(data.dataSharing !== undefined ? data.dataSharing : false)
          setLanguage(data.language || "english")
          setUnits(data.units || "metric")
          setPrivacyMode(data.privacyMode !== undefined ? data.privacyMode : false)
        } else {
          // If API fails, fall back to localStorage
          const savedTheme = localStorage.getItem("theme") as "dark" | "light"
          if (savedTheme) {
            setTheme(savedTheme)
          }

          const savedHistory = localStorage.getItem("saveHistory")
          if (savedHistory !== null) {
            setSaveHistory(savedHistory === "true")
          }

          const savedNotifications = localStorage.getItem("notifications")
          if (savedNotifications !== null) {
            setNotifications(savedNotifications === "true")
          }

          const savedEmailNotifications = localStorage.getItem("emailNotifications")
          if (savedEmailNotifications !== null) {
            setEmailNotifications(savedEmailNotifications === "true")
          }

          const savedDataSharing = localStorage.getItem("dataSharing")
          if (savedDataSharing !== null) {
            setDataSharing(savedDataSharing === "true")
          }

          const savedLanguage = localStorage.getItem("language")
          if (savedLanguage !== null) {
            setLanguage(savedLanguage)
          }

          const savedUnits = localStorage.getItem("units")
          if (savedUnits !== null) {
            setUnits(savedUnits)
          }

          const savedPrivacyMode = localStorage.getItem("privacyMode")
          if (savedPrivacyMode !== null) {
            setPrivacyMode(savedPrivacyMode === "true")
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
      }
    }

    fetchSettings()
  }, [])

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    document.documentElement.classList.toggle("light", newTheme === "light")

    // Dispatch a custom event for the background animation
    window.dispatchEvent(new CustomEvent("themeChange", { detail: { theme: newTheme } }))

    // Add animation effect
    if (themeToggleRef.current) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 600)
    }
  }

  // Handle save history toggle
  const handleSaveHistoryToggle = (checked: boolean) => {
    setSaveHistory(checked)
    localStorage.setItem("saveHistory", checked.toString())
  }

  // Handle notifications toggle
  const handleNotificationsToggle = (checked: boolean) => {
    setNotifications(checked)
    localStorage.setItem("notifications", checked.toString())
  }

  // Handle email notifications toggle
  const handleEmailNotificationsToggle = (checked: boolean) => {
    setEmailNotifications(checked)
    localStorage.setItem("emailNotifications", checked.toString())
  }

  // Handle data sharing toggle
  const handleDataSharingToggle = (checked: boolean) => {
    setDataSharing(checked)
    localStorage.setItem("dataSharing", checked.toString())
  }

  // Handle language change
  const handleLanguageChange = async (value: string) => {
    setLanguage(value)
    localStorage.setItem("language", value)

    try {
      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ language: value }),
      })

      if (!response.ok) {
        console.error("Failed to save language setting to server")
      }
    } catch (error) {
      console.error("Error saving language setting:", error)
    }
  }

  // Handle units change
  const handleUnitsChange = (value: string) => {
    setUnits(value)
    localStorage.setItem("units", value)
  }

  // Handle privacy mode toggle
  const handlePrivacyModeToggle = (checked: boolean) => {
    setPrivacyMode(checked)
    localStorage.setItem("privacyMode", checked.toString())
  }

  if (!mounted) {
    return null // Avoid rendering until client-side to prevent hydration mismatch
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 relative">
      <div className="settings-bg-animation">
        <div className="light-source light-1"></div>
        <div className="light-source light-2"></div>
        <div className="light-source light-3"></div>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-center">Settings</h1>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Profile Details</h3>
            <p className="text-sm text-gray-500">Update your profile information displayed in the dropdown menu.</p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  placeholder="Your display name"
                  defaultValue={user?.name || ""}
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      updateUserDetails({ name: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-email">Display Email</Label>
                <Input
                  id="display-email"
                  placeholder="Your display email"
                  defaultValue={user?.email || ""}
                  onChange={(e) => {
                    if (e.target.value.trim()) {
                      updateUserDetails({ email: e.target.value })
                    }
                  }}
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={() => {
                toast({
                  title: "Profile details updated",
                  description: "Your profile details have been updated successfully.",
                })
              }}
            >
              Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Data</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-red-500" />
                  Appearance Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="code-settings-animation"></div>
                </div>

                <div className="flex items-center justify-between relative">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="dark-mode" className="text-base">
                      Dark Mode
                    </Label>
                    {theme === "dark" ? (
                      <Moon className="h-4 w-4 text-blue-400" />
                    ) : (
                      <Sun className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                  <div ref={themeToggleRef} className={`theme-toggle-animation ${animating ? "active" : ""}`}>
                    <Switch id="dark-mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="language" className="text-base">
                      Language
                    </Label>
                    <p className="text-sm text-gray-400">Select your preferred language</p>
                  </div>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px]" id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  Privacy & Data Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="code-settings-animation"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="save-history" className="text-base">
                      Save Assessment History
                    </Label>
                    <p className="text-sm text-gray-400">Store your assessment history in your browser</p>
                  </div>
                  <Switch id="save-history" checked={saveHistory} onCheckedChange={handleSaveHistoryToggle} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing" className="text-base">
                      Anonymous Data Sharing
                    </Label>
                    <p className="text-sm text-gray-400">Share anonymous data to improve our predictions</p>
                  </div>
                  <Switch id="data-sharing" checked={dataSharing} onCheckedChange={handleDataSharingToggle} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="privacy-mode" className="text-base">
                      Enhanced Privacy Mode
                    </Label>
                    <p className="text-sm text-gray-400">Hide sensitive health information from view</p>
                  </div>
                  <Switch id="privacy-mode" checked={privacyMode} onCheckedChange={handlePrivacyModeToggle} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-500" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="code-settings-animation"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications" className="text-base">
                      Browser Notifications
                    </Label>
                    <p className="text-sm text-gray-400">Receive reminders for follow-up assessments</p>
                  </div>
                  <Switch id="notifications" checked={notifications} onCheckedChange={handleNotificationsToggle} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-400">Receive updates and reminders via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={handleEmailNotificationsToggle}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="units" className="text-base">
                      Measurement Units
                    </Label>
                    <p className="text-sm text-gray-400">Choose your preferred measurement system</p>
                  </div>
                  <Select value={units} onValueChange={handleUnitsChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metric">Metric (cm, kg)</SelectItem>
                      <SelectItem value="imperial">Imperial (in, lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
