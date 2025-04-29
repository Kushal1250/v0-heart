import Link from "next/link"
import { Shield, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthRequiredMessageProps {
  title?: string
  message?: string
  redirectPath?: string
}

export default function AuthRequiredMessage({
  title = "Authentication Required",
  message = "Please log in to view your personal assessment history.",
  redirectPath = "/history",
}: AuthRequiredMessageProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center py-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-gray-400 mb-4">{message}</p>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={`/login?redirect=${redirectPath}`} className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Log In to Continue
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
