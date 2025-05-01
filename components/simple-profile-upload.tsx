"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SimpleProfileUploadProps {
  currentImage: string | null
  onImageUpdate: (imageUrl: string) => void
}

export function SimpleProfileUpload({ currentImage, onImageUpdate }: SimpleProfileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64data = reader.result as string

        try {
          // Send the base64 data directly
          const response = await fetch("/api/user/profile/direct-upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              profile_picture: base64data,
              filename: file.name,
              type: file.type,
            }),
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
        } catch (error: any) {
          console.error("Error in direct upload:", error)
          toast({
            title: "Error",
            description: error.message || "Failed to upload profile picture",
            variant: "destructive",
          })
        } finally {
          setIsUploading(false)
        }
      }
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <img src={currentImage || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <User className="h-12 w-12 text-gray-400" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif"
        onChange={handleFileSelect}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-1"
      >
        <Camera className="h-4 w-4" />
        {isUploading ? "Uploading..." : "Change Profile Picture"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Supported formats: JPEG, PNG, GIF
        <br />
        Maximum file size: 5MB
      </p>
    </div>
  )
}
