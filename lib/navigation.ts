"use client"

import { useRouter } from "next/navigation"

export function useCustomNavigation() {
  const router = useRouter()

  const navigate = (path: string) => {
    try {
      router.push(path)
    } catch (error) {
      console.error("Navigation error:", error)
      // Fallback to window.location if router fails
      window.location.href = path
    }
  }

  return { navigate }
}
