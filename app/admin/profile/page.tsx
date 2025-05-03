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
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Shield,
  Key,
  Clock,
  Settings,
  Users,
  Activity,
  Database,
  Bell,
  Lock,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

export default function AdminProfilePage() {
  const { user, isLoading, updateUserProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("personal")
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alert, setAlert] = useState<{
    type: "success" | "error" | null
    message: string
  }>({ type: null, message: "" })

  // Admin profile data
  const [profileData, setProfileData] = useState({
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    lastLogin: new Date().toISOString(),
    createdAt: "2023-01-01T00:00:00Z",
    permissions: ["users.manage", "predictions.view", "predictions.delete", "settings.manage", "system.manage"],
    activityLog: [
      { action: "User created", timestamp: new Date(Date.now() - 3600000).toISOString() },
      { action: "System settings updated", timestamp: new Date(Date.now() - 7200000).toISOString() },
      { action: "Database migration", timestamp: new Date(Date.now() - 86400000).toISOString() },
    ],
    systemAccess: {
      database: true,
      api: true,
      fileSystem: true,
      emailService: true,
      smsService: true,
    },
    securitySettings: {
      twoFactorEnabled: false,
      lastPasswordChange: new Date(Date.now() - 30 * 86400000).toISOString(),
      sessionTimeout: 60,
      ipRestrictions: false,
    },
    notificationSettings: {
      email: true,
      system: true,
      criticalAlerts: true,
    },
  })

  // Form data for editing
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/admin-login")
    } else if (user) {
      // Update profile data with user data
      setProfileData((prev) => ({
        ...prev,
        name: user.name || "Admin",
        email: user.email || "admin@example.com",
        role: user.role || "admin",
      }))

      // Initialize form data
      setFormData({
        name: user.name || "Admin",
        email: user.email || "admin@example.com",
      })
    }
  }, [user, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleToggleChange = (setting: string) => {
    if (setting.includes(".")) {
      const [category, name] = setting.split(".")
      setProfileData((prev) => ({
        ...prev,
        [category]: {
          ...prev[category as keyof typeof prev],
          [name]: !prev[category as keyof typeof prev][name as any],
        },
      }))
    } else {
      setProfileData((prev) => ({
        ...prev,
        [setting]: !prev[setting as keyof typeof prev],
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setAlert({ type: null, message: "" })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update profile data
      setProfileData((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
      }))

      // Update auth context if available
      if (updateUserProfile) {
        updateUserProfile({
          name: formData.name,
          email: formData.email,
        })
      }

      setIsEditing(false)
      setAlert({
        type: "success",
        message: "Profile updated successfully!",
      })
      toast({
        title: "Success",
        description: "Your profile has been updated successfully!",
      })

      // Clear alert after 3 seconds
      setTimeout(() => {
        setAlert({ type: null, message: "" })
      }, 3000)
    } catch (error: any) {
      setAlert({
        type: "error",
        message: error.message || "An error occurred while updating your profile",
      })
      toast({
        title: "Error",
        description: error.message || "An error occurred while updating your profile",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground mt-4">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Shield className="h-6 w-6 text-red-500" /> Admin Profile
          </CardTitle>
          <CardDescription>View and manage your admin account information</CardDescription>
        </CardHeader>
        <CardContent>
          {alert.type && (
            <Alert
              variant={alert.type === "error" ? "destructive" : "default"}
              className={`mb-6 ${alert.type === "success" ? "bg-green-50 text-green-800 border-green-200" : ""}`}
            >
              {alert.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
              <AlertTitle>{alert.type === "error" ? "Error" : "Success"}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="mb-6 flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {profileData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {profileData.name}
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">Admin</span>
              </h2>
              <p className="text-gray-600">{profileData.email}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Admin since: {new Date(profileData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Personal
              </TabsTrigger>
              <TabsTrigger value="permissions" className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Permissions
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" /> Activity
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
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input id="role" value="Administrator" disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Admin role cannot be changed</p>
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
                    <div className="space-y-2 p-3 rounded-md bg-gray-50">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <User className="h-4 w-4" /> Name
                      </div>
                      <div className="font-medium">{profileData.name}</div>
                    </div>

                    <div className="space-y-2 p-3 rounded-md bg-gray-50">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email
                      </div>
                      <div className="font-medium">{profileData.email}</div>
                    </div>

                    <div className="space-y-2 p-3 rounded-md bg-gray-50">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Shield className="h-4 w-4" /> Role
                      </div>
                      <div className="font-medium flex items-center">
                        Administrator
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">Admin</span>
                      </div>
                    </div>

                    <div className="space-y-2 p-3 rounded-md bg-gray-50">
                      <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Last Login
                      </div>
                      <div className="font-medium">{new Date(profileData.lastLogin).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button onClick={() => setIsEditing(true)}>Edit Profile Information</Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Permissions Tab */}
            <TabsContent value="permissions">
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                    <div>
                      <h3 className="font-medium text-amber-800">Administrator Privileges</h3>
                      <p className="text-sm text-amber-700">
                        As an administrator, you have full access to all system features and settings. Please use these
                        privileges responsibly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Users className="h-5 w-5" /> User Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">View Users</p>
                        <p className="text-sm text-muted-foreground">Access to view all user accounts</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Manage Users</p>
                        <p className="text-sm text-muted-foreground">Create, edit, and delete user accounts</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Prediction Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">View Predictions</p>
                        <p className="text-sm text-muted-foreground">Access to view all user predictions</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Manage Predictions</p>
                        <p className="text-sm text-muted-foreground">Edit and delete prediction records</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Settings className="h-5 w-5" /> System Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">System Settings</p>
                        <p className="text-sm text-muted-foreground">Configure application settings</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Database Management</p>
                        <p className="text-sm text-muted-foreground">Manage database operations</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Email Services</p>
                        <p className="text-sm text-muted-foreground">Configure email settings</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">SMS Services</p>
                        <p className="text-sm text-muted-foreground">Configure SMS settings</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Activity className="h-5 w-5" /> Recent Activity
                  </h3>
                  <div className="space-y-4">
                    {profileData.activityLog.map((activity, index) => (
                      <div key={index} className="flex items-start p-3 bg-gray-50 rounded-md">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Database className="h-5 w-5" /> System Access
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Database Access</p>
                        <p className="text-sm text-muted-foreground">Direct access to database</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-green-600 mr-2">Enabled</span>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">API Access</p>
                        <p className="text-sm text-muted-foreground">Access to system APIs</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-green-600 mr-2">Enabled</span>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">File System Access</p>
                        <p className="text-sm text-muted-foreground">Access to system files</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-green-600 mr-2">Enabled</span>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Email Service Access</p>
                        <p className="text-sm text-muted-foreground">Access to email services</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-green-600 mr-2">Enabled</span>
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Lock className="h-5 w-5" /> Security Settings
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Switch
                        checked={profileData.securitySettings.twoFactorEnabled}
                        onCheckedChange={() => handleToggleChange("securitySettings.twoFactorEnabled")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">IP Restrictions</p>
                        <p className="text-sm text-muted-foreground">Limit access to specific IP addresses</p>
                      </div>
                      <Switch
                        checked={profileData.securitySettings.ipRestrictions}
                        onCheckedChange={() => handleToggleChange("securitySettings.ipRestrictions")}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Key className="h-5 w-5" /> Password Management
                  </h3>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Last Password Change</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(profileData.securitySettings.lastPasswordChange).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline">Change Password</Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Bell className="h-5 w-5" /> Notification Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                      </div>
                      <Switch
                        checked={profileData.notificationSettings.email}
                        onCheckedChange={() => handleToggleChange("notificationSettings.email")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">System Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive in-app notifications</p>
                      </div>
                      <Switch
                        checked={profileData.notificationSettings.system}
                        onCheckedChange={() => handleToggleChange("notificationSettings.system")}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="font-medium">Critical Alerts</p>
                        <p className="text-sm text-muted-foreground">Receive alerts for critical system events</p>
                      </div>
                      <Switch
                        checked={profileData.notificationSettings.criticalAlerts}
                        onCheckedChange={() => handleToggleChange("notificationSettings.criticalAlerts")}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-red-800 flex items-center gap-2">
                      <Shield className="h-5 w-5" /> Admin Account Security
                    </h3>
                    <p className="text-sm text-red-700 mt-2">
                      Your admin account has full access to the system. Please ensure you maintain strong security
                      practices, including:
                    </p>
                    <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                      <li>Using a strong, unique password</li>
                      <li>Enabling two-factor authentication</li>
                      <li>Not sharing your credentials with others</li>
                      <li>Logging out when not using the system</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin")}>
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
