"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Phone, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { isValidEmail, isValidPhone } from "@/lib/client-validation"

interface ProfileFormProps {
  user: {
    id: string
    name: string | null
    email: string
    phone?: string
    profile_picture?: string
  }
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const { updateUserProfile } = useAuth()
  const [name, setName] = useState(user.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [phone, setPhone] = useState(user.phone || "")
  const [profilePicture, setProfilePicture] = useState(user.profile_picture || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setFieldErrors({})

    // Validate inputs
    const newFieldErrors: { [key: string]: string } = {}

    if (!name.trim()) {
      newFieldErrors.name = "Name is required"
    }

    if (!email.trim()) {
      newFieldErrors.email = "Email is required"
    } else if (!isValidEmail(email)) {
      newFieldErrors.email = "Invalid email format"
    }

    if (phone && !isValidPhone(phone)) {
      newFieldErrors.phone = "Invalid phone format. Please include country code (e.g., +1)"
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          profile_picture: profilePicture,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to update profile")
      }

      const data = await response.json()

      // Update the user context
      updateUserProfile({
        name,
        email,
        phone,
        profile_picture: profilePicture,
      })

      setSuccess("Profile updated successfully!")

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err: any) {
      setError(err.message || "An error occurred while updating your profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors({ ...fieldErrors, profilePicture: "Image size should be less than 5MB" })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      setFieldErrors({ ...fieldErrors, profilePicture: "Please upload an image file" })
      return
    }

    // For now, we'll just use a placeholder URL
    // In a real app, you would upload this to a storage service
    setProfilePicture(`/placeholder.svg?height=200&width=200&query=${encodeURIComponent(name || "User")}`)

    // Clear any previous errors
    if (fieldErrors.profilePicture) {
      const { profilePicture, ...rest } = fieldErrors
      setFieldErrors(rest)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Personal Information</h2>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 border-2 border-gray-200">
              <AvatarImage
                src={
                  profilePicture || `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(name || "User")}`
                }
                alt={name || "User"}
              />
              <AvatarFallback className="text-2xl">
                {name ? name[0].toUpperCase() : user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={triggerFileInput}>
              <Upload className="h-4 w-4 mr-2" />
              Change Photo
            </Button>
            {fieldErrors.profilePicture && <p className="text-red-500 text-xs mt-1">{fieldErrors.profilePicture}</p>}
          </div>

          <div className="flex-1 w-full">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">
                  Full Name
                </Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`pl-10 ${fieldErrors.name ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
                    placeholder="Your full name"
                  />
                </div>
                {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email" className="text-gray-700">
                  Email Address
                </Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${fieldErrors.email ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
                    placeholder="you@example.com"
                  />
                </div>
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone" className="text-gray-700">
                  Phone Number
                </Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`pl-10 ${fieldErrors.phone ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                {fieldErrors.phone && <p className="text-red-500 text-xs mt-1">{fieldErrors.phone}</p>}
                <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US/Canada)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading} className="bg-red-500 hover:bg-red-600 text-white">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
