"use client"

import Link from "next/link"
import { User, UserPlus, LogOut, Menu, X, Shield, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import UserProfileDropdown from "./user-profile-dropdown"

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const { toast } = useToast()
  const isAdmin = user?.email === "admin@example.com" // Example admin check

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Check for login success
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("justLoggedIn")
    if (justLoggedIn === "true" && user) {
      setShowLoginSuccess(true)
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${user.name || "User"}! Your dashboard is ready.`,
        duration: 5000,
      })
      sessionStorage.removeItem("justLoggedIn")

      // After 5 seconds, hide the success message
      setTimeout(() => {
        setShowLoginSuccess(false)
      }, 5000)
    }
  }, [user, toast])

  const handleLogout = async (e) => {
    e.preventDefault()
    try {
      await logout()
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  // Navigation items based on current page and authentication status
  let navigationItems = []

  // For homepage (/) - show only Home if not logged in
  if (pathname === "/" && !user) {
    navigationItems = [{ name: "Home", href: "/" }]
  }
  // Default navigation for other pages when not logged in
  else if (!user) {
    navigationItems = [{ name: "Home", href: "/" }]
  }
  // For logged-in users - keep the existing items
  else {
    navigationItems = [
      { name: "Home", href: "/home" },
      { name: "Predict", href: "/predict" },
      { name: "History", href: "/history" },
      { name: "About", href: "/about" },
      { name: "How It Works", href: "/how-it-works" },
      ...(isAdmin ? [{ name: "Admin", href: "/admin" }] : []),
    ]
  }

  return (
    <>
      {showLoginSuccess && (
        <div className="bg-green-50 text-green-800 px-4 py-2 text-center">
          <p className="font-medium">Login Successful! Welcome to HeartPredict.</p>
        </div>
      )}
      <nav
        className={`bg-blue-50 shadow-sm sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href={user ? "/home" : "/"} className="flex items-center">
                <Heart className="h-6 w-6 text-red-500 fill-red-500 mr-2" />
                <span className="font-bold text-xl text-gray-900">HeartPredict</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium ${
                      pathname === item.href ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {!isLoading && (
              <div className="flex items-center gap-4">
                {user ? (
                  // User profile dropdown for authenticated users
                  <UserProfileDropdown />
                ) : (
                  // Non-authenticated user navigation
                  <div className="flex items-center gap-3">
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                      >
                        <User className="h-4 w-4 mr-2" /> Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button
                        variant="default"
                        size="sm"
                        className="rounded-md bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <UserPlus className="h-4 w-4 mr-2" /> Sign Up
                      </Button>
                    </Link>
                    <Link href="/admin-login">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100"
                      >
                        <Shield className="h-4 w-4 mr-2" /> Admin
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    pathname === item.href
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  } text-base font-medium`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/profile"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={(e) => {
                      setMobileMenuOpen(false)
                      handleLogout(e)
                    }}
                    className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-red-600 hover:bg-gray-50 hover:border-red-300 hover:text-red-800 text-base font-medium"
                  >
                    <LogOut className="inline h-4 w-4 mr-2" /> Log out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
