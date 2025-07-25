"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface DirectImageUploadProps {
  currentImage: string | null
  onImageUpdate: (imageUrl: string) => void
}

export function DirectImageUpload({ currentImage, onImageUpdate }: DirectImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or GIF image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024 // 2MB
    if (file.size > MAX_SIZE) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreviewImage(result)

      // Process the image directly
      processAndUploadImage(result)
    }
    reader.readAsDataURL(file)
  }

  const processAndUploadImage = async (dataUrl: string) => {
    setIsUploading(true)

    try {
      // Send the data URL directly to the server
      const response = await fetch("/api/user/profile/direct-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageData: dataUrl }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to upload profile picture")
      }

      const data = await response.json()

      if (!data.profile_picture) {
        throw new Error("No profile picture URL returned from server")
      }

      // Update the parent component with the new image URL
      onImageUpdate(data.profile_picture)

      toast({
        title: "Success",
        description: "Profile picture updated successfully!",
      })

      // Clear preview
      setPreviewImage(null)
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {previewImage ? (
            <img src={previewImage || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
          ) : currentImage ? (
            <img src={currentImage || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/gif"
          onChange={handleFileSelect}
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" /> Change Profile Picture
            </>
          )}
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        <p>Supported formats: JPEG, PNG, GIF</p>
        <p>Maximum file size: 2MB</p>
      </div>
    </div>
  )
}
