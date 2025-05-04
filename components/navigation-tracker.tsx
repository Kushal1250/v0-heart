"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function NavigationTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Log navigation events
    console.log(`Navigated to: ${pathname}`)

    // You could also send analytics data here
  }, [pathname])

  return null // This component doesn't render anything
}

// Add default export
export default NavigationTracker
