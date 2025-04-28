"use client"

import Link from "next/link"
import { ArrowLeft, SettingsIcon, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useState, useEffect, useRef } from "react"

export default function SettingsPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [saveHistory, setSaveHistory] = useState(true)
  const [notifications, setNotifications] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)
  const themeToggleRef = useRef<HTMLDivElement>(null)

  // Ensure we're mounted before rendering theme-dependent UI
  useEffect(() => {
    setMounted(true)

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "dark" | "light"
    if (savedTheme) {
      setTheme(savedTheme)
    }

    // Initialize settings from localStorage
    const savedHistory = localStorage.getItem("saveHistory")
    if (savedHistory !== null) {
      setSaveHistory(savedHistory === "true")
    }

    const savedNotifications = localStorage.getItem("notifications")
    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true")
    }
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

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-red-500" />
              Application Settings
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
                <Label htmlFor="save-history" className="text-base">
                  Save Assessment History
                </Label>
                <p className="text-sm text-gray-400">Store your assessment history in your browser</p>
              </div>
              <Switch id="save-history" checked={saveHistory} onCheckedChange={handleSaveHistoryToggle} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-base">
                  Notifications
                </Label>
                <p className="text-sm text-gray-400">Receive reminders for follow-up assessments</p>
              </div>
              <Switch id="notifications" checked={notifications} onCheckedChange={handleNotificationsToggle} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8 relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="code-settings-animation"></div>
            </div>
            <p className="text-gray-400 mb-4">You are not currently logged in.</p>
            <Button className="settings-button text-white">Create Account</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
