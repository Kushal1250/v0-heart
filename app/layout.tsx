import type React from "react"
import type { Metadata } from "next"
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
import { GlobalErrorBoundary } from "@/components/global-error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Heart Disease Predictor",
  description: "Predict your risk of heart disease using machine learning",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <GlobalErrorBoundary>
              <SessionKeeper />
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">{children}</main>
                <GlobalFooter />
              </div>
              <NavigationTracker />
              <Toaster />
            </GlobalErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
      // Detect hydration errors
      window.addEventListener('error', function(event) {
        if (event.message && event.message.includes('Hydration')) {
          console.error('Hydration error detected:', event);
          // You could send this to your analytics or error tracking service
          
          // Optional: Force a hard reload if it's a hydration error
          // if (sessionStorage.getItem('hydrationErrorReload') !== 'true') {
          //   sessionStorage.setItem('hydrationErrorReload', 'true');
          //   window.location.reload(true);
          // }
        }
      });
    `,
          }}
        />
      </body>
    </html>
  )
}
