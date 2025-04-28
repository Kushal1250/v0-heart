"use client"

import { useAuth } from "@/lib/auth-context"
import Footer from "@/components/footer"
import { usePathname } from "next/navigation"

export default function ConditionalFooter() {
  const { user } = useAuth()
  const pathname = usePathname()

  // Don't show footer on login, signup, or admin-login pages regardless of auth status
  const isAuthPage = ["/login", "/signup", "/admin-login"].includes(pathname)

  // Only show footer if user is authenticated and not on an auth page
  if (user && !isAuthPage) {
    return <Footer />
  }

  return null
}
