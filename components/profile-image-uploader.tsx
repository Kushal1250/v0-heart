"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Camera, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

interface ProfileImageUploaderProps {
  currentImage: string | null
  onImageUpdate: (imageUrl: string) => void
  className?: string
}

export function ProfileImageUploader({
  currentImage,
  onImageUpdate,
  className = "w-24 h-24",
}: ProfileImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(currentImage)
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file size (max 5 MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    try {
      setIsUploading(true)

      // Create preview
      const localUrl = URL.createObjectURL(file)
      setPreviewImage(localUrl)

      // Create form data
      const formData = new FormData()
      formData.append("image", file)

      // Send the file to the server
      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to upload image")
      }

      const data = await response.json()

      // Call the onImageUpdate callback with the new image URL
      onImageUpdate(data.url)

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      })
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)

      // Revert to the original image
      setPreviewImage(currentImage)

      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className={`relative ${className} mx-auto`}>
      <div className="rounded-full overflow-hidden w-full h-full border-2 border-border">
        {previewImage ? (
          <Image
            src={previewImage || "/placeholder.svg"}
            alt="Profile"
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>

      <label
        htmlFor="profile-image"
        className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 cursor-pointer shadow-md hover:bg-primary/90 transition-colors"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 text-primary-foreground animate-spin" />
        ) : (
          <Camera className="h-4 w-4 text-primary-foreground" />
        )}
        <input
          type="file"
          id="profile-image"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          disabled={isUploading}
        />
      </label>
    </div>
  )
}
