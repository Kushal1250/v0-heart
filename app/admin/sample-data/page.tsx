"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import AddSamplePrediction from "@/scripts/add-sample-prediction"

export default function SampleDataPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      const cookies = document.cookie.split(";")
      const isAdminCookie = cookies.find((cookie) => cookie.trim().startsWith("is_admin="))
      const isAdmin = isAdminCookie ? isAdminCookie.split("=")[1] === "true" : false

      setIsAdmin(isAdmin)

      if (!isAdmin) {
        setTimeout(() => {
          router.push("/admin-login?redirect=/admin/sample-data")
        }, 2000)
      }

      setLoading(false)
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
      <h1 className="text-3xl font-bold mb-6">Sample Data Management</h1>
      <p className="text-muted-foreground mb-8">
        Use this page to add sample data to your database for testing purposes.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <AddSamplePrediction />

        {/* You can add more sample data generators here */}
      </div>

      <div className="mt-8 flex justify-end">
        <Button variant="outline" onClick={() => router.push("/admin")}>
          Back to Admin Dashboard
        </Button>
      </div>
    </div>
  )
}
