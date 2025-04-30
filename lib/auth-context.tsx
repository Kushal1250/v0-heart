"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type User = {
  id: string
  email: string
  name: string | null
  role: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (
    email: string,
    password: string,
    phone: string,
    rememberMe?: boolean,
  ) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user")
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string, phone: string, rememberMe = false) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, phone, rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.message || "Login failed",
        }
      }

      setUser(data.user)

      // Set success flag in session storage for home page to display welcome message
      sessionStorage.setItem("loginSuccess", "true")

      // Add a console log to debug
      console.log("Login successful in auth context, redirecting to /home")

      // Force a hard navigation instead of client-side navigation
      window.location.href = "/home"

      return {
        success: true,
        message: "Login successful",
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred",
      }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
