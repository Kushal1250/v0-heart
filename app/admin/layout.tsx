import type React from "react"
import { SessionRefresh } from "@/components/session-refresh"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      <SessionRefresh />
      {children}
    </div>
  )
}
