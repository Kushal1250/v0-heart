"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  userId: string | null
}

export function useAuthState(): AuthState {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    userId: null,
  })
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/user")

        if (response.ok) {
          const data = await response.json()
          setState({
            isAuthenticated: true,
            isLoading: false,
            userId: data.id,
          })
        } else {
          setState({
            isAuthenticated: false,
            isLoading: false,
            userId: null,
          })
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setState({
          isAuthenticated: false,
          isLoading: false,
          userId: null,
        })
      }
    }

    checkAuth()
  }, [router])

  return state
}
