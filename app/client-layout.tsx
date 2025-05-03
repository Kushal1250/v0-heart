"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import Navbar from "@/components/navbar"
import { NavigationTracker } from "@/components/navigation-tracker"
import { Toaster } from "@/components/ui/toaster"
import GlobalFooter from "@/components/global-footer"
// Import the SessionKeeper component
import { SessionKeeper } from "@/components/session-keeper"
import { ClientErrorBoundary } from "@/components/client-error-boundary"
import { useEffect } from "react"
import { initErrorTracking } from "@/lib/error-tracking"

const inter = Inter({ subsets: ["latin"] })

function ErrorTracker() {
  useEffect(() => {
    initErrorTracking()
  }, [])

  return null
}

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
