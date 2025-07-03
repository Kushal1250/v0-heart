"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, Menu, X, LogOut, Settings, History, Activity } from "lucide-react"
import { MobileNavWrapper } from "./mobile-nav-wrapper"

interface UserInterface {
  id: string
  email: string
  name: string
  role: string
}

export default function Navbar() {
  const [user, setUser] = useState<UserInterface | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setUser(null)
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const navigationLinks = [
    { href: "/", label: "Home", icon: Heart },
    { href: "/predict", label: "Predict", icon: Activity },
    { href: "/history", label: "History", icon: History },
    { href: "/about", label: "About", icon: Activity },
  ]

  if (isLoading) {
    return (
      <nav className="bg-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Heart className="h-8 w-8 text-red-500" />
                <span className="text-xl font-bold text-white">HeartPredict</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-8 bg-gray-800 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <Heart className="h-8 w-8 text-red-500" />
                <span className="text-xl font-bold text-white">HeartPredict</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-red-400 bg-gray-900"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-300">Welcome, {user.name || user.email}</span>
                  <Link href="/settings">
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="text-gray-300 hover:text-white"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-red-400 bg-gray-800"
                        : "text-gray-300 hover:text-white hover:bg-gray-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              {/* Mobile Auth Section */}
              <div className="border-t border-gray-700 pt-4 mt-4">
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-sm text-gray-400">Signed in as {user.name || user.email}</div>
                    <Link
                      href="/settings"
                      onClick={closeMobileMenu}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        closeMobileMenu()
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 w-full text-left"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link
                      href="/login"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={closeMobileMenu}
                      className="block px-3 py-2 rounded-md text-base font-medium bg-red-600 text-white hover:bg-red-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Navigation Wrapper for additional mobile-specific functionality */}
      <MobileNavWrapper isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </>
  )
}
