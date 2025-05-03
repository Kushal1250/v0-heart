"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function PredictionGenerator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const generatePredictions = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // First, get users
      const usersResponse = await fetch("/api/admin/users", {
        credentials: "include",
      })

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users")
      }

      const usersData = await usersResponse.json()

      if (!usersData.users || usersData.users.length === 0) {
        throw new Error("No users found. Please create at least one user first.")
      }

      // Generate predictions for each user
      let createdCount = 0
      for (const user of usersData.users.slice(0, 5)) {
        // Limit to first 5 users
        const numPredictions = Math.floor(Math.random() * 3) + 1 // 1-3 predictions per user

        for (let i = 0; i < numPredictions; i++) {
          const predictionData = {
            age: Math.floor(Math.random() * 50) + 30,
            sex: Math.random() > 0.5 ? 1 : 0,
            cp: Math.floor(Math.random() * 4),
            trestbps: Math.floor(Math.random() * 60) + 120,
            chol: Math.floor(Math.random() * 200) + 150,
            fbs: Math.random() > 0.7 ? 1 : 0,
            restecg: Math.floor(Math.random() * 3),
            thalach: Math.floor(Math.random() * 100) + 100,
            exang: Math.random() > 0.7 ? 1 : 0,
            oldpeak: Math.random() * 4,
            slope: Math.floor(Math.random() * 3),
            ca: Math.floor(Math.random() * 4),
            thal: Math.floor(Math.random() * 3) + 1,
          }

          const result = Math.random() * 0.7 + 0.1 // Random value between 0.1 and 0.8

          const response = await fetch("/api/admin/predictions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              userId: user.id,
              result,
              predictionData,
            }),
          })

          if (response.ok) {
            createdCount++
          }
        }
      }

      setSuccess(`Successfully generated ${createdCount} predictions`)
    } catch (err) {
      console.error("Error generating predictions:", err)
      setError(err instanceof Error ? err.message : "Failed to generate predictions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Sample Predictions</CardTitle>
        <CardDescription>Create sample heart disease risk predictions for testing purposes</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <p className="text-sm text-muted-foreground mb-4">
          This will generate random heart disease risk predictions for users in your database. These predictions are for
          testing purposes only and do not reflect real medical data.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={generatePredictions} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Sample Predictions"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
