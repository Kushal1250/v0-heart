"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

interface HealthMetrics {
  height?: string
  weight?: string
  bloodType?: string
  allergies?: string
  medicalConditions?: string
}

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone?: string
  profile_picture?: string
  role?: string
  created_at?: string
  health_metrics?: HealthMetrics
}

export function useProfile() {
  const { user, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProfile = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch profile")
      }

      const data = await response.json()
      setProfile(data)
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile data")
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, toast])

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) return null

      try {
        const response = await fetch("/api/user/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Failed to update profile")
        }

        const updatedProfile = await response.json()
        setProfile(updatedProfile)

        toast({
          title: "Success",
          description: "Profile updated successfully",
        })

        return updatedProfile
      } catch (err) {
        console.error("Error updating profile:", err)
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        })
        return null
      }
    },
    [user, toast],
  )

  const updateHealthMetrics = useCallback(
    async (data: Partial<HealthMetrics>) => {
      if (!user) return null

      try {
        const response = await fetch("/api/user/health-metrics", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          throw new Error("Failed to update health metrics")
        }

        const updatedMetrics = await response.json()

        // Update the profile state with new health metrics
        setProfile((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            health_metrics: updatedMetrics,
          }
        })

        toast({
          title: "Success",
          description: "Health metrics updated successfully",
        })

        return updatedMetrics
      } catch (err) {
        console.error("Error updating health metrics:", err)
        toast({
          title: "Error",
          description: "Failed to update health metrics",
          variant: "destructive",
        })
        return null
      }
    },
    [user, toast],
  )

  // Fetch profile when auth state changes
  useEffect(() => {
    if (!authLoading && user) {
      fetchProfile()
    } else if (!authLoading && !user) {
      setProfile(null)
      setIsLoading(false)
    }
  }, [authLoading, user, fetchProfile])

  return {
    profile,
    isLoading: authLoading || isLoading,
    error,
    fetchProfile,
    updateProfile,
    updateHealthMetrics,
  }
}
