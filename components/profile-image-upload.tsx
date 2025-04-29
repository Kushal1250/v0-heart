"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Upload, User, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ProfileImageUploadProps {
  currentImage: string | null
  onImageUpdate: (imageUrl: string) => void
}

export function ProfileImageUpload({ currentImage, onImageUpdate }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset any previous errors
    setUploadError(null)

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif"]
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload a JPEG, PNG, or GIF image.")
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or GIF image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setUploadError("File too large. Please upload an image smaller than 50MB.")
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 50MB.",
        variant: "destructive",
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string)
    }
    reader.onerror = () => {
      setUploadError("Failed to read the selected file. Please try again.")
      toast({
        title: "Error",
        description: "Failed to read the selected file. Please try again.",
        variant: "destructive",
      })
    }
    reader.readAsDataURL(file)
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("profile_picture", selectedFile)

      // Use fetch with a timeout to prevent hanging requests
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout

      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Server error: ${response.status}`)
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

      // Close the dialog
      setIsDialogOpen(false)
      // Reset state
      setPreviewImage(null)
      setSelectedFile(null)
    } catch (error: any) {
      console.error("Error uploading profile picture:", error)

      let errorMessage = "Failed to upload profile picture"

      if (error.name === "AbortError") {
        errorMessage = "Upload timed out. Please try with a smaller image or check your connection."
      } else if (error.message) {
        errorMessage = error.message
      }

      setUploadError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      // Reset state when dialog is closed
      setPreviewImage(null)
      setSelectedFile(null)
      setUploadError(null)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Function to compress image before upload (optional)
  const compressImage = async (file: File, maxSizeMB: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")
          let width = img.width
          let height = img.height

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 1200 // Max width or height
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width
            width = maxDimension
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height
            height = maxDimension
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")
          ctx?.drawImage(img, 0, 0, width, height)

          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas to Blob conversion failed"))
                return
              }
              resolve(new File([blob], file.name, { type: "image/jpeg" }))
            },
            "image/jpeg",
            0.7, // Quality (0.7 = 70%)
          )
        }
        img.onerror = () => {
          reject(new Error("Failed to load image"))
        }
      }
      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }
    })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
      <div className="relative">
        <div
          className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer group relative"
          onClick={() => setIsDialogOpen(true)}
        >
          {currentImage ? (
            <>
              <div className="h-full w-full">
                <img
                  src={currentImage || "/placeholder.svg"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/vibrant-street-market.png"
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </>
          ) : (
            <>
              <User className="h-12 w-12 text-gray-400" />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </>
          )}
        </div>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 text-xs"
          >
            <Upload className="h-3 w-3" />
            Change
          </Button>
        </DialogTrigger>
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {uploadError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center justify-center gap-4">
            <div
              className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative"
              onClick={handleProfilePictureClick}
            >
              {previewImage ? (
                <img
                  src={previewImage || "/placeholder.svg"}
                  alt="Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/vibrant-street-market.png"
                    setUploadError("Failed to preview image. The file may be corrupted.")
                  }}
                />
              ) : currentImage ? (
                <img
                  src={currentImage || "/placeholder.svg"}
                  alt="Current"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/vibrant-street-market.png"
                  }}
                />
              ) : (
                <User className="h-16 w-16 text-gray-400" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="h-10 w-10 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleFileSelect}
            />
            <Button variant="outline" onClick={handleProfilePictureClick}>
              Select Image
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Supported formats: JPEG, PNG, GIF</p>
            <p>Maximum file size: 50MB</p>
            <p className="mt-1 text-amber-600">Tip: For best results, use images smaller than 5MB</p>
          </div>

          {isUploading && uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
              <p className="text-xs text-center mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="min-w-[100px]">
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" /> Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
