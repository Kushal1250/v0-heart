"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { getCurrentUserEmail, setCurrentUserEmail, clearCurrentUserEmail } from "@/lib/user-specific-storage"

type AuthContextType = {
  userEmail: string | null
  isAuthenticated: boolean
  user: { email: string } | null
  login: (email: string) => void
  logout: () => void
  authLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  userEmail: null,
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  authLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    // Check if user is already authenticated
    const storedEmail = getCurrentUserEmail()
    if (storedEmail) {
      setUserEmail(storedEmail)
    }
    setAuthLoading(false)
  }, [])

  const login = (email: string) => {
    setCurrentUserEmail(email)
    setUserEmail(email)
  }

  const logout = () => {
    clearCurrentUserEmail()
    setUserEmail(null)
  }

  const value = {
    userEmail,
    isAuthenticated: !!userEmail,
    user: userEmail ? { email: userEmail } : null,
    login,
    logout,
    authLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
