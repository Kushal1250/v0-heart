"use client"

import type React from "react"

import { Suspense } from "react"

interface SuspenseWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SuspenseWrapper({ children, fallback = <div>Loading...</div> }: SuspenseWrapperProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}
