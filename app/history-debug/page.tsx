"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import HistoryDebugTool from "@/components/history-debug-tool"

export default function HistoryDebugPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")

  useEffect(() => {
    // Try to get the current email from localStorage
    try {
      const storedEmail = localStorage.getItem("currentUserEmail") || localStorage.getItem("heart_current_email") || ""
      setEmail(storedEmail)
    } catch (e) {
      console.error("Error getting email from localStorage:", e)
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/history")} className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl">History Troubleshooter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="bg-gray-800 border-gray-700"
              />
              <p className="text-xs text-gray-400">Enter the email address you used for your assessment</p>
            </div>

            {email && <HistoryDebugTool email={email} />}

            {!email && (
              <div className="bg-blue-900/30 p-4 rounded-md text-sm">Please enter your email address to continue</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
