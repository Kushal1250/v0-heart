"use client"

import { useState, useEffect, useCallback } from "react"

// Simple authentication hook that manages user email
export function useAuth() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load email from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail")
    if (storedEmail) {
      setUserEmail(storedEmail)
    }
    setIsLoading(false)
  }, [])

  // Save email to localStorage
  const login = useCallback((email: string) => {
    localStorage.setItem("userEmail", email)
    setUserEmail(email)
    return true
  }, [])

  // Remove email from localStorage
  const logout = useCallback(() => {
    localStorage.removeItem("userEmail")
    setUserEmail(null)
  }, [])

  // Check if user is authenticated (has an email)
  const isAuthenticated = !!userEmail

  return {
    userEmail,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}
