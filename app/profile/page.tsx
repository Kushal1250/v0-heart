"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Simple effect to redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <Avatar className="h-24 w-24 mx-auto mb-4">
            <AvatarImage src={user?.profile_picture || "/abstract-profile.png"} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <CardTitle>{user?.name || "User"}</CardTitle>
          <CardDescription>{user?.email || "No email available"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Account Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{user?.email || "Not available"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span>{user?.role || "User"}</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <Button onClick={handleLogout} disabled={isLoggingOut} variant="destructive" className="w-full">
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
