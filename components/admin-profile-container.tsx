"use client"

import type React from "react"
import { useState, useEffect } from "react"

interface Profile {
  name: string
  email: string
  role: string
}

const AdminProfileContainer: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // First check session status
      const sessionResponse = await fetch(`/api/auth/session-status?t=${Date.now()}`, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!sessionResponse.ok) {
        // If session check fails, don't even try to fetch profile
        throw new Error("Your session has expired. Please log in again.")
      }

      // Now fetch the profile
      const response = await fetch(`/api/user/profile?t=${Date.now()}`, {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }

      const data = await response.json()
      setProfile(data)
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError(err.message || "Failed to load profile data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading profile...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!profile) {
    return <div>No profile data available.</div>
  }

  return (
    <div>
      <h2>Admin Profile</h2>
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <p>Role: {profile.role}</p>
    </div>
  )
}

export default AdminProfileContainer
