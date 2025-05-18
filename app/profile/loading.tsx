import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfileLoading() {
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground mt-4">Loading profile data...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
