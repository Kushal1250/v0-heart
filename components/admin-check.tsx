"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function AdminCheck({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if admin cookie exists
    const cookies = document.cookie.split(";")
    const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
    const isAdmin = isAdminCookie && isAdminCookie.split("=")[1] === "true"

    if (!isAdmin) {
      // Not an admin, redirect to admin login
      router.replace("/admin-login")
    } else {
      setIsAdmin(true)
    }

    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAdmin) {
    return null
  }

  return <>{children}</>
}
