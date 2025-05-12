"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Loader2 } from "lucide-react"

interface ProfileImageUploadProps {
  currentImage: string
  userId: string
  onSuccess?: () => void
  onError?: () => void
}

export function ProfileImageUpload({ currentImage, userId, onSuccess, onError }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview the image
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload the image
    setUploading(true)

    const formData = new FormData()
    formData.append("profileImage", file)
    formData.append("userId", userId)

    try {
      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to upload image")
      }

      onSuccess?.()
    } catch (error) {
      console.error("Error uploading image:", error)
      onError?.()
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative">
      <Avatar className="h-24 w-24">
        <AvatarImage src={imagePreview || currentImage} alt="Profile" />
        <AvatarFallback>
          {uploading ? <Loader2 className="h-8 w-8 animate-spin" /> : userId.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <label
        htmlFor="profile-image-upload"
        className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
      >
        <Camera className="h-4 w-4" />
        <span className="sr-only">Upload profile picture</span>
      </label>
      <input
        id="profile-image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageChange}
        disabled={uploading}
      />
    </div>
  )
}
