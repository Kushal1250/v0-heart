"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { Heart } from "lucide-react"

// Dynamically import MobileNav with no SSR
const MobileNav = dynamic(() => import("@/components/mobile-nav"), { ssr: false })

export default function MobileNavWrapper() {
  return (
    <div className="md:hidden">
      <div className="border-b border-gray-800 py-4 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <span>HeartPredict</span>
        </Link>
        <MobileNav />
      </div>
    </div>
  )
}
