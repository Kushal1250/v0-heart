"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export function ReturnHomeButton() {
  // Now useSearchParams is safely used in a client component
  const searchParams = useSearchParams()
  const returnPath = searchParams.get("returnTo") || "/"

  return (
    <Button asChild className="bg-red-600 hover:bg-red-700">
      <Link href={returnPath}>Return to Home</Link>
    </Button>
  )
}
