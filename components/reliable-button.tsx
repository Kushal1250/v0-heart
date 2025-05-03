"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ReliableButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  children: ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function ReliableButton({
  href,
  children,
  variant = "default",
  size = "default",
  ...props
}: ReliableButtonProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.onClick) {
      props.onClick(e)
    }

    if (href && !e.defaultPrevented) {
      e.preventDefault()
      try {
        router.push(href)
      } catch (error) {
        console.error("Navigation error:", error)
        // Fallback to window.location if router fails
        window.location.href = href
      }
    }
  }

  return (
    <Button variant={variant} size={size} {...props} onClick={handleClick}>
      {children}
    </Button>
  )
}
