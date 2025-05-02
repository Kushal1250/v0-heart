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
  refreshSession: () => Promise<boolean>
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
  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const router = useRouter()

  // Update the checkAuthStatus function to be more resilient
  const checkAuthStatus = useCallback(
    async (force = false) => {
      // Don't check too frequently unless forced
      const now = Date.now()
      if (!force && lastRefresh > 0 && now - lastRefresh < 60000) {
        // 1 minute cooldown
        return
      }

      setIsLoading(true)
      try {
        // First check localStorage for cached user data
        const cachedUser = localStorage.getItem("user")
        if (cachedUser && !force) {
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

        // If no valid cached data or forced refresh, check with the server
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
          setLastRefresh(now)

          // Cache the user data with a 4-hour expiry (increased from 2 hours)
          localStorage.setItem("user", JSON.stringify(userData))
          localStorage.setItem("userExpiry", (new Date().getTime() + 4 * 60 * 60 * 1000).toString())
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
    },
    [lastRefresh],
  )

  // Add a session refresh function
  const refreshSession = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/refresh-session", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Force a refresh of auth status
        await checkAuthStatus(true)
        return true
      }
      return false
    } catch (error) {
      console.error("Error refreshing session:", error)
      return false
    }
  }

  useEffect(() => {
    checkAuthStatus()

    // Set up a timer to refresh the session every 25 minutes
    const intervalId = setInterval(
      () => {
        refreshSession()
      },
      25 * 60 * 1000,
    ) // 25 minutes

    return () => clearInterval(intervalId)
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
      setLastRefresh(Date.now())

      // Set flag for successful login
      sessionStorage.setItem("loginSuccess", "true")

      // Set user data in localStorage with appropriate expiry based on rememberMe
      localStorage.setItem("user", JSON.stringify(data.user))

      // Set a longer expiry time if rememberMe is true (30 days vs 4 hours)
      const expiryTime = rememberMe
        ? new Date().getTime() + 30 * 24 * 60 * 60 * 1000 // 30 days
        : new Date().getTime() + 4 * 60 * 60 * 1000 // 4 hours

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
        id: data.user.id || "admin",
        name: data.user.name || "Admin",
        email: email,
        role: "admin",
      })
      setIsAdmin(true)
      setLastRefresh(Date.now())

      // Set flag for successful login
      sessionStorage.setItem("loginSuccess", "true")

      // Store admin user in localStorage with 8-hour expiry
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id || "admin",
          name: data.user.name || "Admin",
          email: email,
          role: "admin",
        }),
      )
      localStorage.setItem("userExpiry", (new Date().getTime() + 8 * 60 * 60 * 1000).toString()) // 8 hours

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
      setLastRefresh(Date.now())
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
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // Redirect to home page after logout
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Function to update user profile data in context
  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data }
      setUser(updatedUser)

      // Update in localStorage too
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  const updateUserDetails = (details: { name?: string; email?: string }) => {
    if (user) {
      const updatedUser = { ...user }
      if (details.name) updatedUser.name = details.name
      if (details.email) updatedUser.email = details.email
      setUser(updatedUser)

      // Save to localStorage for persistence
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        refreshSession,
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
