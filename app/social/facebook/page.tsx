import Link from "next/link"
import { ArrowLeft, Facebook } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FacebookPage() {
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
            <Facebook className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Connect With Us on Facebook</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join our community for heart health resources, support, and the latest updates
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-12">
          <div className="flex flex-col items-center">
            <Facebook className="h-12 w-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">HeartCare</h2>
            <p className="text-gray-400 mb-6 text-center">
              Like and follow our page for daily heart health tips, success stories, and community support.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Facebook className="h-5 w-5 mr-2" />
              Follow on Facebook
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Recent Posts</h3>
            <div className="space-y-6">
              <div className="border-b border-gray-800 pb-4">
                <p className="text-gray-300 mb-2">
                  Join our upcoming live Q&A session with cardiologist Dr. Sarah Chen this Friday at 3 PM EST. She'll be
                  answering all your questions about heart health and prevention strategies!
                </p>
                <p className="text-sm text-gray-500">Posted yesterday • 45 comments</p>
              </div>
              <div className="border-b border-gray-800 pb-4">
                <p className="text-gray-300 mb-2">
                  Congratulations to John D. who has lowered his heart disease risk from high to moderate in just 6
                  months using HeartCare's recommendations! Read his full story on our blog.
                </p>
                <p className="text-sm text-gray-500">Posted 3 days ago • 28 comments</p>
              </div>
              <div>
                <p className="text-gray-300 mb-2">
                  Heart-healthy recipe of the week: Mediterranean Quinoa Bowl with olive oil, chickpeas, and fresh
                  vegetables. Packed with heart-protective nutrients and delicious flavor!
                </p>
                <p className="text-sm text-gray-500">Posted 5 days ago • 17 comments</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Facebook Community</h3>
            <p className="text-gray-400 mb-6">
              Join our private Facebook group where members share their heart health journeys, ask questions, and
              support each other.
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-2">HeartCare Community Group</h4>
              <p className="text-sm text-gray-400 mb-4">Private group • 5.2K members</p>
              <Button className="w-full">Request to Join</Button>
            </div>
            <p className="text-sm text-gray-400">
              Our community guidelines promote respectful, supportive conversation. All members are expected to be kind
              and considerate of others' journeys.
            </p>
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
