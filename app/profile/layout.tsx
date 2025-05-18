import type React from "react"
import "../globals.css"
import "./profile.css"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-background">{children}</div>
}
