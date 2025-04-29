"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MobileNav } from "@/components/mobile-nav"
import { Heart, User, LayoutDashboard, Settings, LogOut, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Get the first letter of the user's name or email for the avatar
  const getInitial = () => {
    if (!user) return "U"
    if (user.name) return user.name[0].toUpperCase()
    if (user.email) return user.email[0].toUpperCase()
    return "U"
  }

  // Function to handle logout
  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  // Check if the current path matches the given path
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(path)
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b ${
        isScrolled ? "bg-white/95 backdrop-blur-sm" : "bg-white"
      } transition-all duration-200`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold">HeartPredict</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/admin") ? "text-primary border-b-2 border-primary" : "text-muted-foreground"
              }`}
            >
              Admin Login
            </Link>
          )}
        </nav>

        {/* User Menu or Auth Buttons */}
        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.profile_picture || ""} alt={user.name || "User"} />
                    <AvatarFallback className="bg-blue-500 text-white">{getInitial()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1a1d24] text-white border-gray-700">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{user.name || "User"}</p>
                      {isAdmin && <Badge className="bg-red-500 text-white">Admin</Badge>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700">
                  <Link href="/dashboard" className="flex items-center w-full">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700">
                    <Link href="/admin" className="flex items-center w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700">
                  {isAdmin ? (
                    <Link href="/admin/profile" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  ) : (
                    <Link href="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem
                  className="flex items-center cursor-pointer text-red-500 hover:bg-gray-700 hover:text-red-400"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="rounded-md bg-gray-100 hover:bg-gray-200">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="rounded-md bg-blue-500 text-white hover:bg-blue-600">Sign Up</Button>
              </Link>
            </>
          )}

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />}
    </header>
  )
}
