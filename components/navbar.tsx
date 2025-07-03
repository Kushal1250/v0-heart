"use client"

import Link from "next/link"
import { User, UserPlus, LogOut, Menu, X, Bell, LayoutDashboard, Heart, Settings, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const { toast } = useToast()

  // Check if user is admin based on cookies or user data
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check admin status from cookies
    const checkAdminStatus = () => {
      const adminCookie = document.cookie.includes("is_admin=true")
      setIsAdmin(adminCookie)
    }

    checkAdminStatus()

    // Listen for cookie changes
    const interval = setInterval(checkAdminStatus, 1000)
    return () => clearInterval(interval)
  }, [])

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

  const handleLogout = async () => {
    await logout()
    setIsAdmin(false)
    window.location.href = "/"
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
                  // Authenticated user navigation
                  <>
                    <div className="hidden md:flex items-center gap-4">
                      <button className="p-1 rounded-full text-gray-400 hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors btn-hover-effect">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6" />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 transition-transform hover:scale-110 bg-blue-100">
                              {user.profile_picture ? (
                                <AvatarImage
                                  src={user.profile_picture || "/placeholder.svg"}
                                  alt={user.name || "User"}
                                />
                              ) : (
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "A"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-56 bg-[#1a1f2e] text-white border-[#2a2f3e]"
                          align="end"
                          forceMount
                        >
                          <DropdownMenuLabel className="font-normal px-4 py-3 border-b border-[#2a2f3e]">
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center">
                                <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                                {isAdmin && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-md">
                                    Admin
                                  </span>
                                )}
                              </div>
                              <p className="text-xs leading-none text-gray-400">{user.email}</p>
                            </div>
                          </DropdownMenuLabel>
                          <div className="px-2 py-2">
                            <DropdownMenuItem
                              asChild
                              className="px-2 py-2 hover:bg-[#2a2f3e] rounded-md cursor-pointer"
                            >
                              <Link href="/dashboard" className="flex items-center">
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                              </Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                asChild
                                className="px-2 py-2 hover:bg-[#2a2f3e] rounded-md cursor-pointer"
                              >
                                <Link href="/admin" className="flex items-center">
                                  <Shield className="mr-2 h-4 w-4" />
                                  <span>Admin</span>
                                </Link>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              asChild
                              className="px-2 py-2 hover:bg-[#2a2f3e] rounded-md cursor-pointer"
                            >
                              <Link href="/settings" className="flex items-center">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                              </Link>
                            </DropdownMenuItem>
                          </div>
                          <DropdownMenuSeparator className="bg-[#2a2f3e]" />
                          <div className="px-2 py-2">
                            <DropdownMenuItem
                              onClick={handleLogout}
                              className="px-2 py-2 text-red-500 hover:bg-[#2a2f3e] rounded-md cursor-pointer"
                            >
                              <LogOut className="mr-2 h-4 w-4" />
                              <span>Log out</span>
                            </DropdownMenuItem>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mobile menu button */}
                    <button
                      type="button"
                      className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary custom-button"
                      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                      <span className="sr-only">Open main menu</span>
                      {mobileMenuOpen ? (
                        <X className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Menu className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </button>
                  </>
                ) : (
                  // Non-authenticated user navigation - ALWAYS show Admin button
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
                    {/* Admin button - always visible, redirects to admin-login */}
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
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block pl-3 pr-4 py-2 border-l-4 ${
                    pathname === item.href
                      ? "border-primary text-primary bg-primary/5"
                      : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  } text-base font-medium custom-link`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 text-base font-medium custom-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="inline h-4 w-4 mr-2" /> Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 text-base font-medium custom-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="inline h-4 w-4 mr-2" /> Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 text-base font-medium custom-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="inline h-4 w-4 mr-2" /> Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left block pl-3 pr-4 py-2 border-l-4 border-transparent text-red-600 hover:bg-gray-50 hover:border-red-300 hover:text-red-800 text-base font-medium custom-button"
                  >
                    <LogOut className="inline h-4 w-4 mr-2" /> Log out
                  </button>
                </>
              )}

              {/* Mobile Admin button for non-authenticated users */}
              {!user && (
                <Link
                  href="/admin-login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 text-base font-medium custom-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Shield className="inline h-4 w-4 mr-2" /> Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
