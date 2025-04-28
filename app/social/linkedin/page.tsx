import Link from "next/link"
import { ArrowLeft, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LinkedinPage() {
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
            <Linkedin className="h-10 w-10 text-blue-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Connect With Us on LinkedIn</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Follow our company page for professional updates, industry insights, and career opportunities
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-12">
          <div className="flex flex-col items-center">
            <Linkedin className="h-12 w-12 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">HeartCare</h2>
            <p className="text-gray-400 mb-2">Health Technology • 51-200 employees</p>
            <p className="text-gray-400 mb-6 text-center">
              Revolutionizing heart health monitoring with AI-powered risk assessment and personalized recommendations.
            </p>
            <Button className="bg-blue-700 hover:bg-blue-800">
              <Linkedin className="h-5 w-5 mr-2" />
              Follow on LinkedIn
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Recent Updates</h3>
            <div className="space-y-6">
              <div className="border-b border-gray-800 pb-4">
                <p className="text-gray-300 mb-2">
                  We're excited to announce our Series A funding of $10 million led by Health Ventures Capital. This
                  investment will help us expand our heart health platform and reach more users worldwide.
                </p>
                <p className="text-sm text-gray-500">Posted 1 week ago • 245 reactions</p>
              </div>
              <div className="border-b border-gray-800 pb-4">
                <p className="text-gray-300 mb-2">
                  HeartCare is proud to be recognized as one of the "Top 10 Health Tech Startups to Watch" by HealthTech
                  Magazine. Thank you to our amazing team and users for making this possible!
                </p>
                <p className="text-sm text-gray-500">Posted 2 weeks ago • 189 reactions</p>
              </div>
              <div>
                <p className="text-gray-300 mb-2">
                  We're thrilled to welcome Dr. Sarah Chen as our new Chief Medical Officer. With her extensive
                  experience in cardiology, Dr. Chen will help guide our clinical strategy and ensure the highest
                  standards of medical accuracy.
                </p>
                <p className="text-sm text-gray-500">Posted 3 weeks ago • 312 reactions</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Join Our Team</h3>
            <p className="text-gray-400 mb-6">
              We're growing rapidly and looking for talented individuals who are passionate about improving heart health
              through technology.
            </p>
            <div className="space-y-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-1">Senior Machine Learning Engineer</h4>
                <p className="text-sm text-gray-400 mb-2">San Francisco, CA (Hybrid) • Full-time</p>
                <Button variant="outline" size="sm">
                  View Job
                </Button>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-1">Product Manager</h4>
                <p className="text-sm text-gray-400 mb-2">Boston, MA (Hybrid) • Full-time</p>
                <Button variant="outline" size="sm">
                  View Job
                </Button>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-1">Frontend Developer</h4>
                <p className="text-sm text-gray-400 mb-2">Remote (US) • Full-time</p>
                <Button variant="outline" size="sm">
                  View Job
                </Button>
              </div>
            </div>
            <Link href="/company/careers">
              <Button className="w-full">View All Openings</Button>
            </Link>
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
            <Link href="/social/instagram">
              <Button variant="outline" className="flex items-center gap-2">
                Instagram
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
