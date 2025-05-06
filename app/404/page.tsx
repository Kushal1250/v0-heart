import Link from "next/link"
import { Heart } from "lucide-react"

// Server component that doesn't use any client hooks
export default function Custom404Page() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="border-b border-gray-800 py-4 px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <span>HeartPredict</span>
        </Link>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center">
        <div className="space-y-6 max-w-md">
          <Heart className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-4xl font-bold">Page Not Found</h1>
          <p className="text-gray-400">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>

          {/* Use a simple server-side link instead of a client component */}
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
