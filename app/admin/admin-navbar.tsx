"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  User,
  Shield,
  LogOut,
  Database,
  Settings,
  Users,
  Home,
  BarChart2,
  Heart,
  Mail,
  Activity,
  Info,
  HelpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AdminNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        // Clear admin cookies
        document.cookie = "is_admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"

        router.push("/admin-login")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: BarChart2 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Database", href: "/admin/database-diagnostics", icon: Database },
    { name: "Email Settings", href: "/admin/email-settings", icon: Mail },
    { name: "System Health", href: "/admin/system-health", icon: Activity },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ]

  const appNavItems = [
    { name: "Home", href: "/home", icon: Home },
    { name: "Predict", href: "/predict", icon: Heart },
    { name: "History", href: "/history", icon: Info },
    { name: "About", href: "/about", icon: Info },
    { name: "How It Works", href: "/how-it-works", icon: HelpCircle },
  ]

  return (
    <header className="bg-gray-900 text-white border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center">
              <Shield className="h-8 w-8 text-red-500 mr-2" />
              <span className="font-bold text-xl">Admin Dashboard</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === item.href ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-1" />
                  {item.name}
                </div>
              </Link>
            ))}

            <div className="border-l border-gray-700 h-6 mx-2"></div>

            <Link
              href="/home"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                App View
              </div>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </nav>

          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  pathname === item.href ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </div>
              </Link>
            ))}

            <div className="border-t border-gray-700 my-2 pt-2">
              <Link
                href="/home"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  App View
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <div className="flex items-center">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
