"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface ProfileErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export default function ProfileErrorFallback({ error, resetErrorBoundary }: ProfileErrorFallbackProps) {
  const router = useRouter()

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || "An unexpected error occurred while loading your profile."}
            </AlertDescription>
          </Alert>
          <p className="mt-4 text-muted-foreground">
            We apologize for the inconvenience. Please try again or contact support if the problem persists.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
          <Button onClick={resetErrorBoundary}>Try Again</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
