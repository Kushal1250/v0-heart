"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SimpleProfileUploadProps {
  currentImage: string | null
  onImageUpdate: (imageUrl: string) => void
}

export function SimpleProfileUpload({ currentImage, onImageUpdate }: SimpleProfileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to upload image")
      }

      const data = await response.json()
      onImageUpdate(data.url)

      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      })
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="absolute bottom-0 right-0">
      <label htmlFor="profile-upload" className="cursor-pointer">
        <div className="bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-colors">
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
        </div>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
    </div>
  )
}
