"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AddSamplePrediction() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const addSamplePrediction = async () => {
    try {
      setLoading(true)
      setResult(null)

      // First, check if we have any users
      const usersResponse = await fetch("/api/admin/users", {
        credentials: "include",
      })

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users")
      }

      const usersData = await usersResponse.json()

      if (!usersData.users || usersData.users.length === 0) {
        setResult({
          success: false,
          message: "No users found. Please create a user first.",
        })
        return
      }

      // Use the first user as the sample user
      const sampleUser = usersData.users[0]

      // Create a sample prediction
      const samplePredictionData = {
        age: 45,
        sex: 1, // Male
        cp: 2, // Chest pain type
        trestbps: 130, // Resting blood pressure
        chol: 220, // Cholesterol
        fbs: 0, // Fasting blood sugar
        restecg: 1, // Resting ECG
        thalach: 160, // Max heart rate
        exang: 0, // Exercise induced angina
        oldpeak: 1.2, // ST depression
        slope: 2, // Slope of peak exercise ST segment
        ca: 0, // Number of major vessels
        thal: 2, // Thalassemia
      }

      // Insert the sample prediction directly using the API
      const response = await fetch("/api/admin/add-sample-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: sampleUser.id,
          result: 0.65, // 65% risk
          predictionData: samplePredictionData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add sample prediction")
      }

      const data = await response.json()
      setResult({
        success: true,
        message: data.message || "Sample prediction added successfully",
      })
    } catch (error) {
      console.error("Error adding sample prediction:", error)
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Sample Prediction</CardTitle>
        <CardDescription>Add a sample prediction to the database for testing purposes.</CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
            <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{result.message}</AlertDescription>
          </Alert>
        )}
        <p className="text-sm text-muted-foreground mb-4">
          This will add a sample prediction with a 65% risk level for the first user in the database. Use this to test
          the predictions functionality if you don't have any real predictions yet.
        </p>
      </CardContent>
      <CardFooter>
        <Button onClick={addSamplePrediction} disabled={loading}>
          {loading ? "Adding..." : "Add Sample Prediction"}
        </Button>
      </CardFooter>
    </Card>
  )
}
