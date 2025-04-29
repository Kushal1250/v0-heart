"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Loader2, Upload, User } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface ProfileImageUploadProps {
  currentImage: string | null
  onImageUpdate: (imageUrl: string) => void
}

export function ProfileImageUpload({ currentImage, onImageUpdate }: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
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
    reader.readAsDataURL(file)
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      console.log("Starting profile picture upload:", selectedFile.name, selectedFile.size, selectedFile.type)

      const formData = new FormData()
      formData.append("profile_picture", selectedFile)

      console.log("Sending request to upload endpoint")
      const response = await fetch("/api/user/profile/upload-photo", {
        method: "POST",
        body: formData,
        // Ensure we don't set Content-Type header as the browser will set it with the boundary
        // Add credentials to ensure cookies are sent
        credentials: "same-origin",
      })

      console.log("Upload response status:", response.status)
      const data = await response.json()
      console.log("Upload response data:", data)

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload profile picture")
      }

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

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      // Reset state when dialog is closed
      setPreviewImage(null)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
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
                <img src={currentImage || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
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
          <div className="flex flex-col items-center justify-center gap-4">
            <div
              className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative"
              onClick={handleProfilePictureClick}
            >
              {previewImage ? (
                <img src={previewImage || "/placeholder.svg"} alt="Preview" className="h-full w-full object-cover" />
              ) : currentImage ? (
                <img src={currentImage || "/placeholder.svg"} alt="Current" className="h-full w-full object-cover" />
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
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || isUploading}>
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
