"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, LogIn } from "lucide-react"

export default function SessionRefresh() {
  const { user, isAdmin, refreshUser } = useAuth()
  const [sessionExpired, setSessionExpired] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on an admin page
  const isAdminPage = pathname?.startsWith("/admin")

  // If we're on an admin page but user is not admin, show session expired
  useEffect(() => {
    if (isAdminPage && user && !isAdmin) {
      setSessionExpired(true)
    } else {
      setSessionExpired(false)
    }
  }, [isAdminPage, user, isAdmin])

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshUser()
      setSessionExpired(false)
      router.refresh()
    } catch (error) {
      console.error("Error refreshing user:", error)
      setSessionExpired(true)
    }
    setRefreshing(false)
  }

  // Handle login redirect
  const handleLogin = () => {
    router.push(`/admin-login?redirect=${encodeURIComponent(pathname || "/admin")}`)
  }

  if (!sessionExpired) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-red-50 border-b border-red-200">
      <Alert variant="destructive" className="max-w-3xl mx-auto">
        <AlertDescription className="flex items-center justify-between">
          <span>Your admin session has expired or you don't have the required permissions.</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh Session"}
            </Button>
            <Button variant="default" size="sm" onClick={handleLogin}>
              <LogIn className="h-4 w-4 mr-2" />
              Log In Again
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
