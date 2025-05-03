"use client"

import type React from "react"

import { ErrorBoundary } from "react-error-boundary"
import ProfileErrorFallback from "@/components/profile-error-fallback"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ErrorBoundary FallbackComponent={ProfileErrorFallback}>{children}</ErrorBoundary>
}
