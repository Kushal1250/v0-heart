"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

export function BrowserCompatibilityCheck() {
  const [incompatibleFeatures, setIncompatibleFeatures] = useState<string[]>([])

  useEffect(() => {
    const requiredFeatures = [
      { name: "Fetch API", check: () => typeof fetch === "function" },
      { name: "Promises", check: () => typeof Promise === "function" },
      {
        name: "localStorage",
        check: () => {
          try {
            return typeof localStorage !== "undefined"
          } catch (e) {
            return false
          }
        },
      },
      {
        name: "sessionStorage",
        check: () => {
          try {
            return typeof sessionStorage !== "undefined"
          } catch (e) {
            return false
          }
        },
      },
    ]

    const missing = requiredFeatures.filter((feature) => !feature.check()).map((feature) => feature.name)

    setIncompatibleFeatures(missing)
  }, [])

  if (incompatibleFeatures.length === 0) {
    return null
  }

  return (
    <Alert variant="warning" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Browser Compatibility Issue</AlertTitle>
      <AlertDescription>
        Your browser is missing features required by this application:
        {incompatibleFeatures.join(", ")}. Please use a modern browser like Chrome, Firefox, Safari, or Edge.
      </AlertDescription>
    </Alert>
  )
}
