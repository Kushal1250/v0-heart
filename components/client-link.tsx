"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface ClientLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export default function ClientLink({ href, children, className }: ClientLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push(href)
  }

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
