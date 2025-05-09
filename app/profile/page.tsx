"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import ProfileForm from "@/components/profile-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("personal")

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user && !isLoading) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <span className="ml-2">Loading profile...</span>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="p-6 bg-white shadow-md rounded-lg">
            <ProfileForm user={user} />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
            <p className="text-gray-600 mb-4">
              Manage your password and account security settings here. We recommend using a strong, unique password and
              enabling two-factor authentication if available.
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium">Change Password</h3>
                <p className="text-sm text-gray-500 mt-1">
                  For security reasons, you'll need to confirm your current password before setting a new one.
                </p>
                <div className="mt-3">
                  <a
                    href="/change-password"
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push("/change-password")
                    }}
                  >
                    Change Password →
                  </a>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Add an extra layer of security to your account by requiring a verification code when you sign in.
                </p>
                <div className="mt-3">
                  <span className="text-gray-400 text-sm">Coming soon</span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <p className="text-gray-600 mb-4">
              Manage your notification preferences and account settings. These settings help personalize your experience
              with our heart health platform.
            </p>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium">Notification Settings</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Control which notifications you receive and how you receive them.
                </p>
                <div className="mt-3">
                  <a
                    href="/settings"
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push("/settings")
                    }}
                  >
                    Manage Notifications →
                  </a>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-md">
                <h3 className="font-medium">Data Sharing Preferences</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Control how your data is used and shared within our platform.
                </p>
                <div className="mt-3">
                  <a
                    href="/settings"
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push("/settings")
                    }}
                  >
                    Manage Data Settings →
                  </a>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
