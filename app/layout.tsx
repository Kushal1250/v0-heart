import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Navbar from "@/components/navbar"
import ConditionalFooter from "@/components/conditional-footer"
import GlobalFooter from "@/components/global-footer"
import { AuthProvider } from "@/lib/auth-context"
import SessionRefresh from "@/components/session-refresh"
import SessionKeeper from "@/components/session-keeper"
import NavigationTracker from "@/components/navigation-tracker"

export const metadata = {
  title: "HeartPredict - AI-Powered Heart Disease Risk Assessment",
  description:
    "HeartPredict uses advanced AI to assess your risk of heart disease based on your health data. Get personalized insights and recommendations to improve your heart health.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthProvider>
            <SessionRefresh />
            <SessionKeeper />
            <NavigationTracker />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <GlobalFooter />
              <ConditionalFooter />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
