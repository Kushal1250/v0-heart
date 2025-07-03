"use client"

import type { ReactNode } from "react"

interface MobileNavWrapperProps {
  children: ReactNode
}

export function MobileNavWrapper({ children }: MobileNavWrapperProps) {
  return <div className="md:hidden">{children}</div>
}

export default MobileNavWrapper
