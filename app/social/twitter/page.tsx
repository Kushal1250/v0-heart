import Link from "next/link"
import { ArrowLeft, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TwitterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-900/30 rounded-full mb-6">
            <Twitter className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Follow Us on Twitter</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Stay updated with the latest heart health tips, research findings, and company news
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-12">
          <div className="flex flex-col items-center">
            <Twitter className="h-12 w-12 text-blue-400 mb-4" />
            <h2 className="text-2xl font-bold mb-2">@HeartCareApp</h2>
            <p className="text-gray-400 mb-6 text-center">
              Follow us for heart health tips, updates on our platform, and the latest cardiovascular research.
            </p>
            <Button className="bg-blue-500 hover:bg-blue-600">
              <Twitter className="h-5 w-5 mr-2" />
              Follow on Twitter
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Recent Tweets</h3>
            <div className="space-y-6">
              <div className="border-b border-gray-800 pb-4">
                <p className="text-gray-300 mb-2">
                  New research shows that regular moderate exercise can reduce heart disease risk by up to 30%. Start
                  with just 30 minutes of walking each day! #HeartHealth #Prevention
                </p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
              <div className="border-b border-gray-800 pb-4">
                <p className="text-gray-300 mb-2">
                  We're excited to announce our new partnership with @NationalHeartAssociation to promote heart disease
                  awareness and prevention! #Partnership #HeartDiseasePrevention
                </p>
                <p className="text-sm text-gray-500">1 day ago</p>
              </div>
              <div>
                <p className="text-gray-300 mb-2">
                  Did you know? Managing stress is crucial for heart health. Try meditation, deep breathing, or yoga to
                  reduce stress levels. Your heart will thank you! #StressManagement #HeartHealth
                </p>
                <p className="text-sm text-gray-500">2 days ago</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Join the Conversation</h3>
            <p className="text-gray-400 mb-6">
              Engage with our content and join the conversation about heart health. Use these hashtags to connect with
              our community:
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-blue-900/30 text-blue-400 text-sm px-3 py-1 rounded-full">#HeartCare</span>
              <span className="bg-blue-900/30 text-blue-400 text-sm px-3 py-1 rounded-full">#HeartHealth</span>
              <span className="bg-blue-900/30 text-blue-400 text-sm px-3 py-1 rounded-full">#CardioWellness</span>
              <span className="bg-blue-900/30 text-blue-400 text-sm px-3 py-1 rounded-full">
                #HeartDiseasePrevention
              </span>
              <span className="bg-blue-900/30 text-blue-400 text-sm px-3 py-1 rounded-full">#HealthyHeart</span>
            </div>
            <Button className="w-full">
              <Twitter className="h-5 w-5 mr-2" />
              Tweet to @HeartCareApp
            </Button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Connect With Us on All Platforms</h2>
          <p className="text-gray-400 mb-6">
            Follow HeartCare on all our social media channels to stay connected and informed about heart health.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/social/facebook">
              <Button variant="outline" className="flex items-center gap-2">
                Facebook
              </Button>
            </Link>
            <Link href="/social/instagram">
              <Button variant="outline" className="flex items-center gap-2">
                Instagram
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
