"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

interface MobileNavWrapperProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileNavWrapper({ isOpen, onClose }: MobileNavWrapperProps) {
  const router = useRouter()

  // Close mobile menu when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      onClose()
    }

    // Listen for route changes
    const handlePopState = () => {
      onClose()
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [onClose])

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const mobileMenu = document.querySelector("[data-mobile-menu]")
      const menuButton = document.querySelector('[aria-label="Toggle mobile menu"]')

      if (mobileMenu && !mobileMenu.contains(target) && menuButton && !menuButton.contains(target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscapeKey)
    return () => {
      document.removeEventListener("keydown", handleEscapeKey)
    }
  }, [isOpen, onClose])

  return null // This component doesn't render anything visible
}

export default MobileNavWrapper
