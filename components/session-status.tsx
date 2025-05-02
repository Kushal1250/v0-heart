"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { RefreshCw, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SessionStatus() {
  const { user, isAdmin, refreshSession } = useAuth()
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null)
  const router = useRouter()

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshSession()
    setLastRefreshed(new Date())
    setRefreshing(false)
  }

  useEffect(() => {
    if (!user) {
      setLastRefreshed(null)
    }
  }, [user])

  return (
    <div className="flex items-center space-x-4">
      {user ? (
        <>
          <span>
            Hello, {user.name}! {isAdmin ? "(Admin)" : ""}
          </span>
          {lastRefreshed && <span>Last Refreshed: {lastRefreshed.toLocaleTimeString()}</span>}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Session
              </>
            )}
          </Button>
        </>
      ) : (
        <Link href="/login">
          <Button variant="outline" size="sm">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Button>
        </Link>
      )}
    </div>
  )
}
