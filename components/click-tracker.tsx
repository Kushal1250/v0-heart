"use client"

import { useEffect } from "react"

export function ClickTracker() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Get the element that was clicked
      const target = e.target as HTMLElement

      // Log information about the click
      console.log("Click detected:", {
        element: target.tagName,
        id: target.id,
        className: target.className,
        text: target.textContent,
        coordinates: { x: e.clientX, y: e.clientY },
      })

      // Check if the element is a button or link
      const isButton =
        target.tagName === "BUTTON" || target.closest("button") || target.getAttribute("role") === "button"

      const isLink = target.tagName === "A" || target.closest("a")

      if (isButton || isLink) {
        console.log("Interactive element clicked:", isButton ? "Button" : "Link")
      }
    }

    // Add the event listener
    document.addEventListener("click", handleClick)

    // Clean up
    return () => {
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return null // This component doesn't render anything
}
