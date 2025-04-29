"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X } from "lucide-react"

interface ProfileImageUploadProps {
  currentImageUrl?: string
  username?: string
  onImageUploaded?: (imageUrl: string) => void
}

export function ProfileImageUpload({ currentImageUrl, username = "User", onImageUploaded }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      // Reset states
      setError(null)
      setIsUploading(true)

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)")
        setIsUploading(false)
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB")
        setIsUploading(false)
        return
      }

      try {
        // Create a preview
        const reader = new FileReader()
        reader.onload = (event) => {
          if (event.target?.result) {
            setImagePreview(event.target.result as string)
          }
        }
        reader.readAsDataURL(file)

        // Create form data for upload
        const formData = new FormData()
        formData.append("file", file)

        // Upload the image
        const response = await fetch("/api/user/profile/upload-photo", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || "Failed to upload image")
        }

        const data = await response.json()

        // Call the callback with the new image URL
        if (onImageUploaded && data.imageUrl) {
          onImageUploaded(data.imageUrl)
        }

        setImagePreview(data.imageUrl)
      } catch (err: any) {
        console.error("Error uploading image:", err)
        setError(err.message || "Failed to upload image. Please try again.")
      } finally {
        setIsUploading(false)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    },
    [onImageUploaded],
  )

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleRemoveImage = async () => {
    setIsUploading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/profile/upload-photo", {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to remove image")
      }

      setImagePreview(null)

      // Call the callback with empty string to indicate removal
      if (onImageUploaded) {
        onImageUploaded("")
      }
    } catch (err: any) {
      console.error("Error removing image:", err)
      setError(err.message || "Failed to remove image. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-gray-200">
              <AvatarImage
                src={imagePreview || ""}
                alt={username}
                onError={(e) => {
                  // If image fails to load, clear the src to show fallback
                  ;(e.target as HTMLImageElement).src = ""
                }}
              />
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {getInitials(username)}
              </AvatarFallback>
            </Avatar>

            {imagePreview && !isUploading && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 rounded-full w-6 h-6"
                onClick={handleRemoveImage}
                type="button"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove image</span>
              </Button>
            )}
          </div>

          <div className="space-y-2 w-full">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              disabled={isUploading}
            />

            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {imagePreview ? "Change Profile Picture" : "Upload Profile Picture"}
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground text-center mt-2">
              Recommended: Square image, at least 400x400 pixels (max 5MB)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
