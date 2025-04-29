"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  profile_picture?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  isLoading: boolean
  login: (email: string, password: string, phone: string) => Promise<{ success: boolean; message: string }>
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (
    name: string,
    email: string,
    password: string,
    phone: string,
  ) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => void
  updateUserDetails: (details: { name?: string; email?: string }) => void
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUserData = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAdmin(data.user.role === "admin")

        // Cache the user data with a 30-minute expiry
        localStorage.setItem("cachedUser", JSON.stringify(data.user))
        localStorage.setItem("userCacheExpiry", (new Date().getTime() + 30 * 60 * 1000).toString())

        return data.user
      } else {
        setUser(null)
        setIsAdmin(false)
        localStorage.removeItem("cachedUser")
        localStorage.removeItem("userCacheExpiry")
        return null
      }
    } catch (error) {
      console.error("Error refreshing user data:", error)
      return null
    }
  }, [])

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      // First check localStorage for cached user data
      const cachedUserStr = localStorage.getItem("cachedUser")
      const expiryTime = localStorage.getItem("userCacheExpiry")

      if (cachedUserStr && expiryTime && new Date().getTime() < Number.parseInt(expiryTime)) {
        try {
          const cachedUser = JSON.parse(cachedUserStr)
          setUser(cachedUser)
          setIsAdmin(cachedUser.role === "admin")
          setIsLoading(false)

          // Refresh in background
          refreshUserData().catch(console.error)
          return
        } catch (e) {
          console.error("Error parsing cached user:", e)
        }
      }

      // If no valid cached data or parsing failed, check with the server
      await refreshUserData()
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }, [refreshUserData])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = async (email: string, password: string, phone: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, phone }),
        credentials: "include",
      })

      if (!response.ok) {
        let errorMessage = "Login failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (jsonError) {
          errorMessage = `Login failed: ${response.statusText || "Unknown error"}`
        }
        return { success: false, message: errorMessage }
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        return { success: false, message: "Invalid response from server" }
      }

      setUser(data.user)
      setIsAdmin(data.user.role === "admin")

      // Cache the user data
      localStorage.setItem("cachedUser", JSON.stringify(data.user))
      localStorage.setItem("userCacheExpiry", (new Date().getTime() + 30 * 60 * 1000).toString())

      return { success: true, message: "Login successful" }
    } catch (error: any) {
      return { success: false, message: error.message || "An unexpected error occurred" }
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      if (!response.ok) {
        let errorMessage = "Admin login failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (jsonError) {
          errorMessage = `Admin login failed: ${response.statusText || "Unknown error"}`
        }
        return { success: false, message: errorMessage }
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        return { success: false, message: "Invalid response from server" }
      }

      // Set admin user
      const adminUser = {
        id: "admin",
        name: "Admin",
        email: email,
        role: "admin",
      }

      setUser(adminUser)
      setIsAdmin(true)

      // Cache the admin user data
      localStorage.setItem("cachedUser", JSON.stringify(adminUser))
      localStorage.setItem("userCacheExpiry", (new Date().getTime() + 30 * 60 * 1000).toString())

      return { success: true, message: "Admin login successful" }
    } catch (error: any) {
      return { success: false, message: error.message || "An unexpected error occurred" }
    }
  }

  const signup = async (name: string, email: string, password: string, phone: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone }),
        credentials: "include",
      })

      if (!response.ok) {
        let errorMessage = "Signup failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (jsonError) {
          errorMessage = `Signup failed: ${response.statusText || "Unknown error"}`
        }
        return { success: false, message: errorMessage }
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        return { success: false, message: "Invalid response from server" }
      }

      setUser(data.user)
      setIsAdmin(data.user.role === "admin")

      // Cache the user data
      localStorage.setItem("cachedUser", JSON.stringify(data.user))
      localStorage.setItem("userCacheExpiry", (new Date().getTime() + 30 * 60 * 1000).toString())

      return { success: true, message: "Signup successful" }
    } catch (error: any) {
      return { success: false, message: error.message || "An unexpected error occurred" }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      setIsAdmin(false)

      // Clear cached user data
      localStorage.removeItem("cachedUser")
      localStorage.removeItem("userCacheExpiry")

      // Clear admin cookie
      document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Function to update user profile data in context
  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)

      // Update cached user data
      localStorage.setItem("cachedUser", JSON.stringify(updatedUser))
      localStorage.setItem("userCacheExpiry", (new Date().getTime() + 30 * 60 * 1000).toString())
    }
  }

  const updateUserDetails = (details: { name?: string; email?: string }) => {
    if (user) {
      const updatedUser = { ...user }
      if (details.name) updatedUser.name = details.name
      if (details.email) updatedUser.email = details.email
      setUser(updatedUser)

      // Update cached user data
      localStorage.setItem("cachedUser", JSON.stringify(updatedUser))
      localStorage.setItem("userCacheExpiry", (new Date().getTime() + 30 * 60 * 1000).toString())
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        login,
        adminLogin,
        signup,
        logout,
        updateUserProfile,
        updateUserDetails,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
