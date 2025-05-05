"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Settings, LogOut, History, Heart, HelpCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const { toast } = useToast()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = "/"
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      })
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U"
    const names = user.name.split(" ")
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar className="h-8 w-8 cursor-pointer border border-gray-200 hover:border-gray-300 transition-colors">
          <AvatarImage src={user?.profilePicture || ""} alt={user?.name || "User"} />
          <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline-block text-sm font-medium text-gray-700">
          {user?.name?.split(" ")[0] || "User"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1 border-b border-gray-100">
            <div className="px-4 py-2">
              <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <User className="mr-3 h-4 w-4 text-gray-500" />
              My Profile
            </Link>
            <Link
              href="/history"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <History className="mr-3 h-4 w-4 text-gray-500" />
              Assessment History
            </Link>
            <Link
              href="/predict"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="mr-3 h-4 w-4 text-gray-500" />
              New Assessment
            </Link>
          </div>

          <div className="py-1 border-t border-gray-100">
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-3 h-4 w-4 text-gray-500" />
              Settings
            </Link>
            <Link
              href="/how-it-works"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <HelpCircle className="mr-3 h-4 w-4 text-gray-500" />
              Help & Support
            </Link>
          </div>

          <div className="py-1 border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="mr-3 h-4 w-4 text-red-500" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
