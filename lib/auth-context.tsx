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
  const [authInitialized, setAuthInitialized] = useState(false)
  const router = useRouter()

  // Check if auth token exists in cookies or localStorage
  const hasAuthToken = useCallback(() => {
    // Check for common auth tokens in cookies
    const hasCookie =
      document.cookie.includes("token=") ||
      document.cookie.includes("session=") ||
      document.cookie.includes("is_admin=")

    // Check localStorage for cached user that hasn't expired
    const cachedUser = localStorage.getItem("user")
    const expiryTime = localStorage.getItem("userExpiry")
    const hasValidCache = cachedUser && expiryTime && new Date().getTime() < Number.parseInt(expiryTime)

    return hasCookie || hasValidCache
  }, [])

  // Update the checkAuthStatus function to avoid unnecessary API calls
  const checkAuthStatus = useCallback(
    async (force = false) => {
      // Don't check too frequently unless forced
      const now = Date.now()
      if (!force && lastRefresh > 0 && now - lastRefresh < 60000) {
        // 1 minute cooldown
        setIsLoading(false)
        return
      }

      setIsLoading(true)

      try {
        // Add a timeout to prevent the auth check from hanging indefinitely
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Auth check timed out")), 5000)
        })

        const authCheckPromise = (async () => {
          // Check for admin cookie first
          const isAdminCookie = document.cookie.includes("is_admin=true")

          if (isAdminCookie) {
            setIsAdmin(true)

            // If we don't have user data yet, set default admin user
            if (!user || user.role !== "admin") {
              const adminUser = {
                id: "admin",
                name: "Admin",
                email: "admin@example.com",
                role: "admin",
              }
              setUser(adminUser)
              localStorage.setItem("user", JSON.stringify(adminUser))
              localStorage.setItem("userExpiry", (new Date().getTime() + 8 * 60 * 60 * 1000).toString())
            }
            return
          }

          // First check localStorage for cached user data
          const cachedUser = localStorage.getItem("user")
          if (cachedUser && !force) {
            try {
              const userData = JSON.parse(cachedUser)
              const expiryTime = localStorage.getItem("userExpiry")

              // If we have valid cached data that hasn't expired
              if (expiryTime && new Date().getTime() < Number.parseInt(expiryTime)) {
                setUser(userData)
                setIsAdmin(userData.role === "admin")
                return
              }
            } catch (e) {
              // Invalid JSON in localStorage, clear it
              localStorage.removeItem("user")
              localStorage.removeItem("userExpiry")
            }
          }

          // Only make the API call if we have reason to believe the user might be authenticated
          // This prevents unnecessary 401 errors in the console
          if (force || hasAuthToken()) {
            // If no valid cached data or forced refresh, check with the server
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

            try {
              const response = await fetch("/api/auth/check-session", {
                credentials: "include",
                headers: {
                  "Cache-Control": "no-cache, no-store, must-revalidate",
                  Pragma: "no-cache",
                  Expires: "0",
                },
                signal: controller.signal,
              })

              clearTimeout(timeoutId)

              if (response.ok) {
                const userData = await response.json()
                if (userData.authenticated && userData.user) {
                  setUser(userData.user)
                  setIsAdmin(userData.user.role === "admin" || false)
                  setLastRefresh(now)

                  // Cache the user data with a 4-hour expiry
                  localStorage.setItem("user", JSON.stringify(userData.user))
                  localStorage.setItem("userExpiry", (new Date().getTime() + 4 * 60 * 60 * 1000).toString())
                } else {
                  // User is not authenticated according to the server
                  setUser(null)
                  setIsAdmin(false)
                  localStorage.removeItem("user")
                  localStorage.removeItem("userExpiry")
                }
              } else {
                // Error with the request - clear user state
                setUser(null)
                setIsAdmin(false)
                localStorage.removeItem("user")
                localStorage.removeItem("userExpiry")
              }
            } catch (fetchError) {
              clearTimeout(timeoutId)
              // Handle fetch errors (timeout, network error, etc.)
              console.warn("Auth check fetch error:", fetchError)

              // If we have cached user data, use it as fallback
              if (cachedUser) {
                try {
                  const userData = JSON.parse(cachedUser)
                  setUser(userData)
                  setIsAdmin(userData.role === "admin")
                } catch (e) {
                  setUser(null)
                  setIsAdmin(false)
                }
              } else {
                setUser(null)
                setIsAdmin(false)
              }
            }
          } else {
            // No auth token found, user is definitely not authenticated
            setUser(null)
            setIsAdmin(false)
            localStorage.removeItem("user")
            localStorage.removeItem("userExpiry")
          }
        })()

        // Race between the auth check and the timeout
        await Promise.race([authCheckPromise, timeoutPromise])
      } catch (error) {
        // Handle errors silently - don't log to console
        console.warn("Auth check error or timeout:", error)

        // Use cached data if available
        const cachedUser = localStorage.getItem("user")
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser)
            setUser(userData)
            setIsAdmin(userData.role === "admin")
          } catch (e) {
            setUser(null)
            setIsAdmin(false)
          }
        } else {
          setUser(null)
          setIsAdmin(false)
        }
      } finally {
        setIsLoading(false)
        setAuthInitialized(true)
      }
    },
    [lastRefresh, user, hasAuthToken],
  )

  // Add a session refresh function
  const refreshSession = async (): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      const response = await fetch("/api/auth/refresh-session", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        // Force a refresh of auth status
        await checkAuthStatus(true)
        return true
      }
      return false
    } catch (error) {
      return false
    }
  }

  // Initialize auth state once on mount
  useEffect(() => {
    // Use a more reliable way to load initial auth state
    const loadInitialAuthState = async () => {
      try {
        // First try to load from localStorage to prevent flicker
        const cachedUser = localStorage.getItem("user")
        const expiryTime = localStorage.getItem("userExpiry")

        if (cachedUser && expiryTime && new Date().getTime() < Number.parseInt(expiryTime)) {
          try {
            const userData = JSON.parse(cachedUser)
            setUser(userData)
            setIsAdmin(userData.role === "admin")
            setIsLoading(false) // Stop loading immediately with cached data
          } catch (e) {
            // Invalid JSON, clear it
            localStorage.removeItem("user")
            localStorage.removeItem("userExpiry")
          }
        }

        // Then check with the server (this will update the state if needed)
        await checkAuthStatus()
      } catch (error) {
        console.warn("Error loading initial auth state:", error)
        setIsLoading(false)
        setAuthInitialized(true)
      }
    }

    loadInitialAuthState()

    // Set up a timer to refresh the session every 25 minutes
    const intervalId = setInterval(
      () => {
        // Only try to refresh if we have a user
        if (user) {
          refreshSession().catch(() => {
            // Silently handle refresh errors
          })
        }
      },
      25 * 60 * 1000,
    ) // 25 minutes

    return () => clearInterval(intervalId)
  }, []) // Empty dependency array - only run once on mount

  // Update auth state when user changes
  useEffect(() => {
    if (authInitialized && user) {
      // Update last refresh time when user changes
      setLastRefresh(Date.now())
    }
  }, [authInitialized, user])

  const login = async (email: string, password: string, phone: string, rememberMe = false) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for login

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, phone, rememberMe }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

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
      if (error.name === "AbortError") {
        return { success: false, message: "Login request timed out. Please try again." }
      }
      return { success: false, message: error.message || "An unexpected error occurred" }
    }
  }

  const adminLogin = async (email: string, password: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for login

      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important to include credentials
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

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
        id: data.user.id || "admin",
        name: data.user.name || "Admin",
        email: email,
        role: "admin",
      }

      setUser(adminUser)
      setIsAdmin(true)
      setLastRefresh(Date.now())

      // Set flag for successful login
      sessionStorage.setItem("loginSuccess", "true")

      // Store admin user in localStorage with 8-hour expiry
      localStorage.setItem("user", JSON.stringify(adminUser))
      localStorage.setItem("userExpiry", (new Date().getTime() + 8 * 60 * 60 * 1000).toString()) // 8 hours

      return { success: true, message: "Admin login successful" }
    } catch (error: any) {
      if (error.name === "AbortError") {
        return { success: false, message: "Login request timed out. Please try again." }
      }
      return { success: false, message: error.message || "An unexpected error occurred" }
    }
  }

  const signup = async (name: string, email: string, password: string, phone: string) => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout for signup

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

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
      if (error.name === "AbortError") {
        return { success: false, message: "Signup request timed out. Please try again." }
      }
      return { success: false, message: error.message || "An unexpected error occurred" }
    }
  }

  // Update the logout function to handle redirection properly
  const logout = async () => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout for logout

      await fetch("/api/auth/logout", {
        method: "POST",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      setUser(null)
      setIsAdmin(false)

      // Clear cached user data
      localStorage.removeItem("user")
      localStorage.removeItem("userExpiry")

      // Clear admin cookie
      document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

      // Redirect to home page after logout
      window.location.href = "/"
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null)
      setIsAdmin(false)
      localStorage.removeItem("user")
      localStorage.removeItem("userExpiry")

      // Redirect anyway
      window.location.href = "/"
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
