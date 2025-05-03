"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ThemeProvider } from "@/lib/theme-context"
import { AuthProvider } from "@/lib/auth-context"
import Navbar from "@/components/navbar"
import { NavigationTracker } from "@/components/navigation-tracker"
import { Toaster } from "@/components/ui/toaster"
import GlobalFooter from "@/components/global-footer"
import { SessionKeeper } from "@/components/session-keeper"
import { ClientErrorBoundary } from "@/components/client-error-boundary"
import { initErrorTracking } from "@/lib/error-tracking"
import { DebugHelper } from "@/components/debug-helper"

// Error tracking component
function ErrorTracker() {
  useEffect(() => {
    initErrorTracking()
  }, [])

  return null
}

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const [showDebugTools, setShowDebugTools] = useState(false)

  useEffect(() => {
    // Only show debug tools in development or when ?debug=true is in URL
    const isDebugMode = process.env.NODE_ENV === "development" || window.location.search.includes("debug=true")

    setShowDebugTools(isDebugMode)
  }, [])

  return (
    <>
      <ErrorTracker />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <SessionKeeper />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <ClientErrorBoundary>{children}</ClientErrorBoundary>
            </main>
            <GlobalFooter />
          </div>
          <NavigationTracker />
          <Toaster />
          {showDebugTools && <DebugHelper />}
        </AuthProvider>
      </ThemeProvider>
    </>
  )
}
