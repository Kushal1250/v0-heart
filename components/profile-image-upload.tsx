"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
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

  // Reset preview when dialog opens/closes
  useEffect(() => {
    if (!isDialogOpen) {
      setPreviewImage(null)
      setSelectedFile(null)
      setUploadError(null)
      setUploadProgress(0)
    }
  }, [isDialogOpen])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset any previous errors
    setUploadError(null)

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.")
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image.",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File too large. Please upload an image smaller than 5MB.")
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
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
      // Create small thumbnail version for preview
      const imageToUpload = await compressImage(selectedFile)

      console.log("Image prepared for upload", {
        originalSize: selectedFile.size,
        compressedSize: imageToUpload.size,
        type: imageToUpload.type,
      })

      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("profile_picture", imageToUpload)
      formData.append("timestamp", Date.now().toString()) // Add timestamp to prevent caching

      // Simulate progress (since fetch doesn't provide upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 15
          return newProgress > 90 ? 90 : newProgress
        })
      }, 500)

      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header, let the browser set it with the boundary
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        let errorMessage = "Server error"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || `Server error: ${response.status}`

          // Log detailed error information
          console.error("Upload failed:", errorData)
        } catch (jsonError) {
          console.error("Could not parse error response:", jsonError)
          errorMessage = `Server error: ${response.status}`
        }
        throw new Error(errorMessage)
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
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleProfilePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
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

  // Function to compress image before upload
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement("canvas")

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 800 // Max width or height
          let width = img.width
          let height = img.height

          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width)
            width = maxDimension
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height)
            height = maxDimension
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            console.error("Failed to get canvas context")
            // If compression fails, use the original file
            resolve(file)
            return
          }

          // For better quality
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob with reduced quality
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.error("Canvas to Blob conversion failed")
                // If compression fails, use the original file
                resolve(file)
                return
              }

              // Create a new file from the blob
              const newFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              })

              resolve(newFile)
            },
            "image/jpeg",
            0.85, // Quality (0.85 = 85%)
          )
        }

        img.onerror = () => {
          console.error("Failed to load image")
          // If compression fails, use the original file
          resolve(file)
        }
      }

      reader.onerror = () => {
        console.error("Failed to read file")
        // If compression fails, use the original file
        resolve(file)
      }
    })
  }

  // Create a placeholder for missing images
  const getPlaceholderImage = () => {
    if (currentImage?.startsWith("data:image/")) {
      return currentImage
    }
    return "/diverse-online-profiles.png"
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
                  src={currentImage || "/placeholder.svg?height=100&width=100&query=user%20profile"}
                  alt="Profile"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.log("Image load error, using placeholder")
                    e.currentTarget.src = "/diverse-online-profiles.png"
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
                    console.log("Preview image load error")
                    e.currentTarget.src = "/diverse-online-profiles.png"
                    setUploadError("Failed to preview image. The file may be corrupted.")
                  }}
                />
              ) : currentImage ? (
                <img
                  src={currentImage || "/placeholder.svg"}
                  alt="Current"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    console.log("Current image load error")
                    e.currentTarget.src = "/diverse-online-profiles.png"
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
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
            />
            <Button variant="outline" onClick={handleProfilePictureClick}>
              Select Image
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>Supported formats: JPEG, PNG, GIF, WebP</p>
            <p>Maximum file size: 5MB</p>
            <p className="mt-1 text-amber-600">Tip: For best results, use square images</p>
          </div>

          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-center mt-1">{Math.round(uploadProgress)}% uploaded</p>
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
