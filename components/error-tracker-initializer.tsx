"use client"

import { useEffect } from "react"
import ErrorTracker from "@/lib/error-tracking"

export function ErrorTrackerInitializer() {
  useEffect(() => {
    ErrorTracker.init()
  }, [])

  return null
}
