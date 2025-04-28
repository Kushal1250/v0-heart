"use client"
import { useEffect, useState } from "react"

export default function BackgroundAnimation() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    setMounted(true)
    // Get initial theme from localStorage or default to dark
    const savedTheme = localStorage.getItem("theme") || "dark"
    setTheme(savedTheme)

    // Listen for theme changes
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem("theme") || "dark"
      setTheme(currentTheme)
    }

    window.addEventListener("storage", handleStorageChange)

    // Custom event for theme changes within the app
    const handleThemeChange = (e: CustomEvent) => {
      setTheme(e.detail.theme)
    }

    window.addEventListener("themeChange" as any, handleThemeChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("themeChange" as any, handleThemeChange)
    }
  }, [])

  if (!mounted) return null

  return (
    <>
      <div className="fixed inset-0 z-[-1] overflow-hidden">
        {/* Original blob animations */}
        <div
          className={`absolute top-0 -left-4 w-72 h-72 ${theme === "dark" ? "bg-red-500" : "bg-red-400"} rounded-full mix-blend-multiply filter blur-[128px] opacity-5 animate-blob`}
        ></div>
        <div
          className={`absolute top-0 -right-4 w-72 h-72 ${theme === "dark" ? "bg-red-500" : "bg-red-400"} rounded-full mix-blend-multiply filter blur-[128px] opacity-5 animate-blob animation-delay-2000`}
        ></div>
        <div
          className={`absolute -bottom-8 left-20 w-72 h-72 ${theme === "dark" ? "bg-red-500" : "bg-red-400"} rounded-full mix-blend-multiply filter blur-[128px] opacity-5 animate-blob animation-delay-4000`}
        ></div>
        <div
          className={`absolute -bottom-8 right-20 w-72 h-72 ${theme === "dark" ? "bg-red-500" : "bg-red-400"} rounded-full mix-blend-multiply filter blur-[128px] opacity-5 animate-blob animation-delay-6000`}
        ></div>

        {/* DNA animation */}
        <div className="dna-animation"></div>

        {/* Heart vessels animation */}
        <div className="heart-vessels">
          <div className="vessel vessel-1"></div>
          <div className="vessel vessel-2"></div>
          <div className="vessel vessel-3"></div>
          <div className="vessel vessel-4"></div>
          <div className="vessel vessel-5"></div>
          <div className="vessel vessel-6"></div>
          <div className="pulse-circle"></div>
        </div>

        {/* Code rain animation */}
        <div className="code-rain"></div>
      </div>
    </>
  )
}
