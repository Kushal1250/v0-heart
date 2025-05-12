import type React from "react"
import { SessionRefresh } from "@/components/session-refresh"
import { SessionExpiration } from "@/components/session-expiration"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionRefresh />
        <SessionExpiration />
        {children}
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
