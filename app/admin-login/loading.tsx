import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="space-y-1">
          <div className="h-16 w-16 rounded-full bg-gray-800 animate-pulse mx-auto mb-2"></div>
          <div className="h-8 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 w-1/4 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-1/4 bg-gray-800 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-800 rounded animate-pulse mt-4"></div>
        </CardContent>
      </Card>
    </div>
  )
}
