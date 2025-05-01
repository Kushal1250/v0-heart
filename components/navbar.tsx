"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/router"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      const isTop = window.scrollY < 100
      if (isTop !== scrolled) {
        setScrolled(!isTop)
      }
    }

    document.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      document.removeEventListener("scroll", handleScroll)
    }
  }, [scrolled])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav
      className={`bg-gradient-to-r from-red-50 to-red-100 shadow-sm sticky top-0 z-50 transition-all duration-300 ${scrolled ? "shadow-md" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="font-bold text-xl text-gray-800">
                Logo
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className={`text-gray-600 hover:bg-red-50 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium custom-link ${
                    router.pathname === "/" ? "bg-red-100 text-gray-800" : ""
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className={`text-gray-600 hover:bg-red-50 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium custom-link ${
                    router.pathname === "/about" ? "bg-red-100 text-gray-800" : ""
                  }`}
                >
                  About
                </Link>
                <Link
                  href="/projects"
                  className={`text-gray-600 hover:bg-red-50 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium custom-link ${
                    router.pathname === "/projects" ? "bg-red-100 text-gray-800" : ""
                  }`}
                >
                  Projects
                </Link>
                <Link
                  href="/contact"
                  className={`text-gray-600 hover:bg-red-50 hover:text-gray-800 px-3 py-2 rounded-md text-sm font-medium custom-link ${
                    router.pathname === "/contact" ? "bg-red-100 text-gray-800" : ""
                  }`}
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              type="button"
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${mobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${mobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`${mobileMenuOpen ? "block" : "hidden"} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-gray-800 text-base font-medium custom-link"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-gray-800 text-base font-medium custom-link"
          >
            About
          </Link>
          <Link
            href="/projects"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-gray-800 text-base font-medium custom-link"
          >
            Projects
          </Link>
          <Link
            href="/contact"
            className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-gray-800 text-base font-medium custom-link"
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  )
}
