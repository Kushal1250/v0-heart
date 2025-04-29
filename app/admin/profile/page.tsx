"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function AdminProfilePage() {
  const { user, isAdmin, isLoading, updateUserDetails } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin-login")
    }

    if (user) {
      // Load saved admin details from localStorage if available
      try {
        const savedDetails = localStorage.getItem("adminDetails")
        if (savedDetails) {
          const details = JSON.parse(savedDetails)
          setFormData({
            name: details.name || user.name || "Admin",
            email: details.email || user.email || "",
            phone: details.phone || "",
          })
        } else {
          setFormData({
            name: user.name || "Admin",
            email: user.email || "",
            phone: user.phone || "",
          })
        }
      } catch (error) {
        console.error("Error loading saved admin details:", error)
        setFormData({
          name: user.name || "Admin",
          email: user.email || "",
          phone: user.phone || "",
        })
      }
    }
  }, [user, isAdmin, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Update user details in context
      updateUserDetails({
        name: formData.name,
        email: formData.email,
      })

      // Save to localStorage for persistence
      localStorage.setItem(
        "adminDetails",
        JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      )

      toast({
        title: "Profile Updated",
        description: "Your admin profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating admin profile:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
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

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <User className="h-6 w-6" /> Admin Profile
          </CardTitle>
          <CardDescription>Update your admin profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Display Name
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your display name"
              />
              <p className="text-xs text-muted-foreground">This name will be displayed in the admin dropdown menu</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
              />
              <p className="text-xs text-muted-foreground">This email will be displayed in the admin dropdown menu</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
              <p className="text-xs text-muted-foreground">Optional: For account recovery and notifications</p>
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-xs text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </CardFooter>
      </Card>
    </div>
  )
}
