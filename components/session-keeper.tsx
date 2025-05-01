"use client"

import { useEffect } from "react"
import { persistAuthState, setupAuthPersistence } from "@/lib/auth-persistence"

export function SessionKeeper() {
  useEffect(() => {
    // Set up auth persistence mechanisms
    const cleanupPersistence = persistAuthState()
    const cleanupVisibility = setupAuthPersistence()

    // Clean up when component unmounts
    return () => {
      if (typeof cleanupPersistence === "function") cleanupPersistence()
      if (typeof cleanupVisibility === "function") cleanupVisibility()
    }
  }, [])

  // This component doesn't render anything
  return null
}
