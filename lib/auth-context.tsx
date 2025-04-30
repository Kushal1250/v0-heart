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
  login: (
    email: string,
    password: string,
    phone: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; message: string }>
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Update the checkAuthStatus function to be more resilient
  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true)
    try {
      // First check localStorage for cached user data
      const cachedUser = localStorage.getItem("user")
      if (cachedUser) {
        const userData = JSON.parse(cachedUser)
        const expiryTime = localStorage.getItem("userExpiry")

        // If we have valid cached data that hasn't expired
        if (expiryTime && new Date().getTime() < Number.parseInt(expiryTime)) {
          setUser(userData)
          setIsAdmin(userData.role === "admin")
          setIsLoading(false)
          return
        }
      }

      // If no valid cached data, check with the server
      const response = await fetch("/api/auth/user", {
        credentials: "include",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsAdmin(userData.role === "admin")

        // Cache the user data with a 2-hour expiry (increased from 30 minutes)
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("userExpiry", (new Date().getTime() + 2 * 60 * 60 * 1000).toString())
      } else {
        setUser(null)
        setIsAdmin(false)
        // Clear any stale data
        localStorage.removeItem("user")
        localStorage.removeItem("userExpiry")
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      setUser(null)
      setIsAdmin(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const login = async (email: string, password: string, phone: string, rememberMe = false) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, phone, rememberMe }),
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

      // Set flag for successful login
      sessionStorage.setItem("loginSuccess", "true")

      // Set user data in localStorage with appropriate expiry based on rememberMe
      localStorage.setItem("user", JSON.stringify(data.user))

      // Set a longer expiry time if rememberMe is true (30 days vs 2 hours)
      const expiryTime = rememberMe
        ? new Date().getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
        : new Date().getTime() + 2 * 60 * 60 * 1000 // 2 hours

      localStorage.setItem("userExpiry", expiryTime.toString())

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
        credentials: "include", // Important to include credentials
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
      setUser({
        id: "admin",
        name: "Admin",
        email: email,
        role: "admin",
      })
      setIsAdmin(true)

      // Set flag for successful login
      sessionStorage.setItem("loginSuccess", "true")

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
      return { success: true, message: "Signup successful" }
    } catch (error: any) {
      return { success: false, message: error.message || "An unexpected error occurred" }
    }
  }

  // Update the logout function to handle redirection properly
  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setIsAdmin(false)

      // Clear cached user data
      localStorage.removeItem("user")
      localStorage.removeItem("userExpiry")

      // Don't clear remembered credentials - we want to keep those for next login
      // localStorage.removeItem("rememberedCredentials")

      // Clear admin cookie
      document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // Redirect to home page after logout
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Function to update user profile data in context
  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data })
    }
  }

  const updateUserDetails = (details: { name?: string; email?: string }) => {
    if (user) {
      const updatedUser = { ...user }
      if (details.name) updatedUser.name = details.name
      if (details.email) updatedUser.email = details.email
      setUser(updatedUser)

      // Save to localStorage for persistence
      localStorage.setItem(
        "userDetails",
        JSON.stringify({
          name: updatedUser.name,
          email: updatedUser.email,
        }),
      )
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
