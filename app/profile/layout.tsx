import type React from "react"
import { AuthCheck } from "@/components/auth-check"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <main className="min-h-screen bg-gray-50">{children}</main>
    </AuthCheck>
  )
}
