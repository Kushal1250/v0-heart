import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import ServerFooter from "@/components/server-footer"

const inter = Inter({ subsets: ["latin"] })

export default function NotFoundLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen flex flex-col`}>
        {children}
        <ServerFooter />
      </body>
    </html>
  )
}
