import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">System Maintenance</CardTitle>
          <CardDescription>We're currently performing scheduled maintenance</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Our system is temporarily unavailable while we make improvements. We apologize for any inconvenience this
            may cause.
          </p>
          <p className="text-sm text-muted-foreground">
            The system will be back online shortly. Thank you for your patience.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/admin-login">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
