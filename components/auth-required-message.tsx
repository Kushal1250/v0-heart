import { Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthRequiredMessageProps {
  title?: string
  message?: string
  redirectPath?: string
}

export default function AuthRequiredMessage({
  title = "Authentication Required",
  message = "This feature requires authentication.",
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
        </div>
      </CardContent>
    </Card>
  )
}
