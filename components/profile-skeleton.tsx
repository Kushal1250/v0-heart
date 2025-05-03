import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileSkeleton() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal">
          <TabsList className="mb-4">
            <TabsTrigger value="personal" disabled>
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="activity" disabled>
              Activity
            </TabsTrigger>
            <TabsTrigger value="security" disabled>
              Security
            </TabsTrigger>
          </TabsList>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>

              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </CardFooter>
    </Card>
  )
}
