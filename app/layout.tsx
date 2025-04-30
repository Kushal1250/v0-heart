import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import Navbar from "@/components/navbar"
import { NavigationTracker } from "@/components/navigation-tracker"
import { Toaster } from "@/components/ui/toaster"
// Import the SessionKeeper component
import { SessionKeeper } from "@/components/session-keeper"
// Add import for the CommonFooter component
import CommonFooter from "@/components/common-footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Heart Disease Predictor",
  description: "Predict your risk of heart disease using machine learning",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SessionKeeper />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <CommonFooter />
            </div>
            <NavigationTracker />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
