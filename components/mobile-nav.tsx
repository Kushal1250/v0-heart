"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} aria-label="Open menu">
        <Menu className="h-6 w-6" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex justify-end">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close menu">
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="container mx-auto px-4 py-8 flex flex-col items-center gap-8 text-xl">
            <Link href="/" onClick={() => setIsOpen(false)} className="hover:text-red-400 transition-colors">
              Home
            </Link>
            <Link href="/predict" onClick={() => setIsOpen(false)} className="hover:text-red-400 transition-colors">
              Predict
            </Link>
            <Link href="/history" onClick={() => setIsOpen(false)} className="hover:text-red-400 transition-colors">
              History
            </Link>
            <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-red-400 transition-colors">
              About
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)} className="hover:text-red-400 transition-colors">
              Settings
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
