import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/lib/theme-context"
import Navbar from "@/components/navbar"
import { NavigationTracker } from "@/components/navigation-tracker"
import { Toaster } from "@/components/ui/toaster"
import GlobalFooter from "@/components/global-footer"
import { SessionKeeper } from "@/components/session-keeper"
import { generateMetadata as generateSEOMetadata, siteConfig } from "@/lib/seo-config"
import { GoogleAnalytics } from "@/components/analytics"
import { PerformanceMonitor } from "@/components/performance-monitor"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
  preload: true,
})

export const metadata: Metadata = {
  ...generateSEOMetadata(),
  metadataBase: new URL(siteConfig.url),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  other: {
    "msapplication-TileColor": "#007BFF",
    "theme-color": "#007BFF",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#007BFF" },
    { media: "(prefers-color-scheme: dark)", color: "#007BFF" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preload" href="/heart-health-dashboard.png" as="image" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: siteConfig.name,
              description: siteConfig.description,
              url: siteConfig.url,
              applicationCategory: "HealthApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Organization",
                name: siteConfig.creator,
                url: siteConfig.url,
              },
              publisher: {
                "@type": "Organization",
                name: siteConfig.publisher,
                url: siteConfig.url,
              },
              potentialAction: {
                "@type": "UseAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${siteConfig.url}/predict`,
                  actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"],
                },
              },
            }),
          }}
        />

        {process.env.NODE_ENV === "production" && <GoogleAnalytics GA_MEASUREMENT_ID="G-XXXXXXXXXX" />}
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SessionKeeper />
            <PerformanceMonitor />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
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
