"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PredictionGenerator } from "@/components/prediction-generator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SampleDataPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = () => {
      const cookies = document.cookie.split(";")
      const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
      const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false

      setIsAdmin(isAdmin)
      setLoading(false)

      if (!isAdmin) {
        setTimeout(() => {
          router.push("/admin-login?redirect=/admin/sample-data")
        }, 2000)
      }
    }

    checkAdmin()
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => router.push("/admin-login?redirect=/admin/sample-data")}>Login as Admin</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sample Data Generator</h1>
        <p className="text-muted-foreground">Generate sample data for testing purposes</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <PredictionGenerator />

        <div className="flex flex-col gap-4">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Return to Admin Dashboard
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/predictions")}>
            View All Predictions
          </Button>
        </div>
      </div>
    </div>
  )
}
