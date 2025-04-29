"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
  ) => Promise<{ success: boolean; message: string; redirectTo?: string }>
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

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // Check for admin cookie first
        const cookies = document.cookie.split(";")
        const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
        const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false

        if (isAdmin) {
          setUser({
            id: "admin",
            name: "Admin",
            email: "admin@example.com",
            role: "admin",
          })
          setIsAdmin(true)
          setIsLoading(false)
          return
        }

        const response = await fetch("/api/auth/user")
        if (response.ok) {
          try {
            const data = await response.json()

            // Load saved user details from localStorage if available
            if (data.user) {
              try {
                const savedDetails = localStorage.getItem("userDetails")
                if (savedDetails) {
                  const details = JSON.parse(savedDetails)
                  if (details.name) data.user.name = details.name
                  if (details.email) data.user.email = details.email
                }
              } catch (error) {
                console.error("Error loading saved user details:", error)
              }
            }

            setUser(data.user)
            setIsAdmin(data.user?.role === "admin")
          } catch (jsonError) {
            console.error("Error parsing user data:", jsonError)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, phone: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, phone }),
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
      sessionStorage.setItem("justLoggedIn", "true")

      // Check if there's a redirect path in the URL
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get("redirect") || "/history"

      return { success: true, message: "Login successful", redirectTo }
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

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      setIsAdmin(false)

      // Clear admin cookie
      document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
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
