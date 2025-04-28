import Link from "next/link"
import { ArrowLeft, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function InstagramPage() {
  const instagramPosts = [
    {
      id: 1,
      image: "/vibrant-heart-healthy-spread.png",
      caption: "Start your day with heart-healthy breakfast options! #HeartHealth #HealthyEating",
      likes: 245,
      comments: 18,
    },
    {
      id: 2,
      image: "/diverse-group-exercising.png",
      caption:
        "Regular exercise is key to maintaining a healthy heart. Even 30 minutes of walking makes a difference! #CardioHealth #Exercise",
      likes: 312,
      comments: 24,
    },
    {
      id: 3,
      image: "/serene-heart-meditation.png",
      caption:
        "Stress management is crucial for heart health. Try meditation to reduce stress levels. #StressManagement #HeartCare",
      likes: 189,
      comments: 15,
    },
    {
      id: 4,
      image: "/vibrant-heart-healthy-vegetable-medley.png",
      caption:
        "Fill half your plate with colorful vegetables for a heart-healthy meal! #NutritionTips #HeartHealthyDiet",
      likes: 276,
      comments: 22,
    },
    {
      id: 5,
      image: "/blood-pressure-check-at-home.png",
      caption:
        "Regular blood pressure monitoring is essential for heart health. Know your numbers! #BloodPressure #Prevention",
      likes: 203,
      comments: 17,
    },
    {
      id: 6,
      image: "/placeholder.svg?height=300&width=300&query=heart health technology",
      caption:
        "Technology can help you track and improve your heart health. Our app makes it easy! #HealthTech #HeartCare",
      likes: 298,
      comments: 26,
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-900/30 rounded-full mb-6">
            <Instagram className="h-10 w-10 text-purple-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Follow Us on Instagram</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Visual inspiration and education for your heart health journey
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-12">
          <div className="flex flex-col items-center">
            <Instagram className="h-12 w-12 text-purple-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">@HeartCareApp</h2>
            <p className="text-gray-400 mb-6 text-center">
              Follow us for visual heart health tips, infographics, and inspiration for your heart health journey.
            </p>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Instagram className="h-5 w-5 mr-2" />
              Follow on Instagram
            </Button>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6 text-center">Recent Posts</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
          {instagramPosts.map((post) => (
            <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="aspect-square relative">
                <Image src={post.image || "/placeholder.svg"} alt="Instagram post" fill className="object-cover" />
              </div>
              <div className="p-4">
                <p className="text-gray-300 text-sm mb-2">{post.caption}</p>
                <div className="flex justify-between text-gray-400 text-xs">
                  <span>{post.likes} likes</span>
                  <span>{post.comments} comments</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-12">
          <h3 className="text-xl font-bold mb-4 text-center">Instagram Stories Highlights</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5 mb-2">
                <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">❤️</span>
                </div>
              </div>
              <span className="text-sm">Tips</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5 mb-2">
                <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">🥗</span>
                </div>
              </div>
              <span className="text-sm">Recipes</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5 mb-2">
                <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">🏃</span>
                </div>
              </div>
              <span className="text-sm">Exercise</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5 mb-2">
                <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
              </div>
              <span className="text-sm">Stats</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Connect With Us on All Platforms</h2>
          <p className="text-gray-400 mb-6">
            Follow HeartCare on all our social media channels to stay connected and informed about heart health.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/social/twitter">
              <Button variant="outline" className="flex items-center gap-2">
                Twitter
              </Button>
            </Link>
            <Link href="/social/facebook">
              <Button variant="outline" className="flex items-center gap-2">
                Facebook
              </Button>
            </Link>
            <Link href="/social/linkedin">
              <Button variant="outline" className="flex items-center gap-2">
                LinkedIn
              </Button>
            </Link>
            <Link href="/social/github">
              <Button variant="outline" className="flex items-center gap-2">
                GitHub
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
