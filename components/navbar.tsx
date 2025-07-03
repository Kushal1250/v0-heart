import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cookies } from "next/headers"
import { getUserById, getSessionByToken } from "@/lib/db" // Assuming these are available
import { clearSessionCookie } from "@/lib/auth-utils" // Assuming this is available

export default async function Navbar() {
  const sessionToken = cookies().get("session")?.value
  let user = null
  let isAdmin = false

  if (sessionToken) {
    try {
      const session = await getSessionByToken(sessionToken)
      if (session && new Date(session.expires_at) > new Date()) {
        const fetchedUser = await getUserById(session.user_id)
        if (fetchedUser) {
          user = fetchedUser
          isAdmin = fetchedUser.role === "admin"
        }
      } else {
        // Session expired or invalid, clear cookie
        clearSessionCookie()
      }
    } catch (error) {
      console.error("Error fetching user session in Navbar:", error)
      clearSessionCookie()
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <span className="text-lg font-bold">HeartPredict</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/predict" className="text-sm font-medium hover:underline">
            Predict
          </Link>
          <Link href="/history" className="text-sm font-medium hover:underline">
            History
          </Link>
          <Link href="/about" className="text-sm font-medium hover:underline">
            About
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium hover:underline">
            How It Works
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm font-medium hover:underline">
              Admin
            </Link>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_picture || "/abstract-profile.png"} alt={user.name || user.email} />
                    <AvatarFallback>
                      {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <form action="/api/auth/logout" method="POST" className="w-full">
                    <button type="submit" className="w-full text-left">
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  )
}
