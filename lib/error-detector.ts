"use client"

import { useEffect } from "react"

export function useErrorDetector(pageName: string) {
  useEffect(() => {
    console.log(`Page ${pageName} mounted successfully`)

    // Check for common problematic browser APIs
    const features = {
      localStorage: typeof window !== "undefined" && window.localStorage !== undefined,
      sessionStorage: typeof window !== "undefined" && window.sessionStorage !== undefined,
      indexedDB: typeof window !== "undefined" && window.indexedDB !== undefined,
    }

    console.log(`Browser API availability:`, features)

    // Report any missing critical features
    const missingFeatures = Object.entries(features)
      .filter(([_, available]) => !available)
      .map(([name]) => name)

    if (missingFeatures.length > 0) {
      console.warn(`Missing browser features: ${missingFeatures.join(", ")}`)
    }

    return () => {
      console.log(`Page ${pageName} unmounted successfully`)
    }
  }, [pageName])
}
