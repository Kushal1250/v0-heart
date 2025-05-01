"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import FixHistory from "@/components/fix-history"

export default function FixHistoryPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/history")} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
      </div>

      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">History Repair Tool</h1>
        <FixHistory />
      </div>
    </div>
  )
}
