"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { useRouter } from "next/router"
import { toast } from "react-hot-toast"
import { ProfileImageUploader } from "@/components/profile-image-uploader"

interface UserProfileData {
  name: string
  email: string
  profile_picture: string | null
  bio: string | null
}

const EnhancedUserProfile: React.FC = () => {
  const { user, isLoading } = useUser()
  const [profileData, setProfileData] = useState<UserProfileData>({
    name: "",
    email: "",
    profile_picture: null,
    bio: null,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [tempProfileData, setTempProfileData] = useState<UserProfileData>({
    name: "",
    email: "",
    profile_picture: null,
    bio: null,
  })
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchUserProfile()
    }
  }, [user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        setTempProfileData(data)
      } else {
        console.error("Failed to fetch profile data")
        toast.error("Failed to fetch profile data")
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
      toast.error("Error fetching profile data")
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTempProfileData({
      ...tempProfileData,
      [e.target.name]: e.target.value,
    })
  }

  const handleProfileImageUpdate = async (newImageUrl: string) => {
    setProfileData((prev) => ({ ...prev, profile_picture: newImageUrl }))
    setTempProfileData((prev) => ({ ...prev, profile_picture: newImageUrl }))
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profile_picture: newImageUrl }),
      })

      if (response.ok) {
        toast.success("Profile picture updated successfully!")
        fetchUserProfile()
      } else {
        console.error("Failed to update profile picture")
        toast.error("Failed to update profile picture")
      }
    } catch (error) {
      console.error("Error updating profile picture:", error)
      toast.error("Error updating profile picture")
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tempProfileData),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        setProfileData(tempProfileData)
        setIsEditing(false)
        fetchUserProfile()
      } else {
        console.error("Failed to update profile")
        toast.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Error updating profile")
    }
  }

  const handleCancel = () => {
    setTempProfileData(profileData)
    setIsEditing(false)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    router.push("/api/auth/login")
    return null
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

      <div className="flex justify-center mb-6">
        <ProfileImageUploader
          currentImage={profileData.profile_picture || null}
          onImageUpdate={handleProfileImageUpdate}
          className="w-24 h-24"
        />
      </div>

      {isEditing ? (
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              name="name"
              value={tempProfileData.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              name="email"
              value={tempProfileData.email}
              onChange={handleInputChange}
              disabled
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
              Bio:
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="bio"
              name="bio"
              value={tempProfileData.bio || ""}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <p>
              <strong>Name:</strong> {profileData.name}
            </p>
          </div>
          <div className="mb-4">
            <p>
              <strong>Email:</strong> {profileData.email}
            </p>
          </div>
          <div className="mb-4">
            <p>
              <strong>Bio:</strong> {profileData.bio || "No bio provided."}
            </p>
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  )
}

export default EnhancedUserProfile
