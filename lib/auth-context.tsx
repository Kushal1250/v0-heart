"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Define the User type
type User = {
  id?: string
  name?: string
  email?: string
  phone?: string
  profile_picture?: string
  role?: string
}

// Define the AuthContext type
type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (
    email: string,
    password: string,
    phone: string,
    rememberMe: boolean,
  ) => Promise<{ success: boolean; message: string }>
  logout: () => void
  updateUserProfile: (data: Partial<User>) => void
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null)

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try to get the current user from the API
        const response = await fetch("/api/auth/user")

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
        } else {
          // If no user is found, clear any stale data
          setUser(null)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string, phone: string, rememberMe: boolean) => {
    setIsLoading(true)

    try {
      // Call the login API
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone, rememberMe }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true, message: "Login successful" }
      } else {
        return { success: false, message: data.message || "Login failed" }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "An unexpected error occurred" }
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)

    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update user profile
  const updateUserProfile = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data })
    }
  }

  // Create the context value
  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    updateUserProfile,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  return context
}
