import Link from "next/link"
import { ArrowLeft, Github, Star, GitFork, Code } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GithubPage() {
  const repositories = [
    {
      name: "heart-disease-prediction",
      description: "Machine learning models for heart disease risk prediction using various algorithms and datasets.",
      language: "Python",
      stars: 245,
      forks: 87,
      updated: "Updated 2 days ago",
    },
    {
      name: "heartcare-web",
      description: "Frontend code for the HeartCare web application built with React and Next.js.",
      language: "TypeScript",
      stars: 189,
      forks: 42,
      updated: "Updated 1 week ago",
    },
    {
      name: "heart-health-api",
      description: "RESTful API for heart health data processing and risk assessment.",
      language: "JavaScript",
      stars: 156,
      forks: 38,
      updated: "Updated 3 weeks ago",
    },
    {
      name: "medical-data-processing",
      description: "Tools for processing and analyzing medical data related to cardiovascular health.",
      language: "Python",
      stars: 132,
      forks: 29,
      updated: "Updated 1 month ago",
    },
  ]

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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-800 rounded-full mb-6">
            <Github className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Follow Us on GitHub</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Explore our open-source projects and contribute to heart health technology
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 mb-12">
          <div className="flex flex-col items-center">
            <Github className="h-12 w-12 text-white mb-4" />
            <h2 className="text-2xl font-bold mb-2">HeartCare</h2>
            <p className="text-gray-400 mb-6 text-center">
              Check out our open-source projects and contribute to improving heart health technology.
            </p>
            <Button className="bg-gray-800 hover:bg-gray-700">
              <Github className="h-5 w-5 mr-2" />
              Follow on GitHub
            </Button>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-6">Featured Repositories</h3>
        <div className="space-y-4 mb-12">
          {repositories.map((repo, index) => (
            <div key={index} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h4 className="text-xl font-bold text-blue-400 mb-2">{repo.name}</h4>
              <p className="text-gray-300 mb-4">{repo.description}</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1 text-sm">
                  <span
                    className={`h-3 w-3 rounded-full ${repo.language === "Python" ? "bg-blue-500" : repo.language === "TypeScript" ? "bg-blue-400" : "bg-yellow-500"}`}
                  ></span>
                  <span>{repo.language}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4" />
                  <span>{repo.stars}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <GitFork className="h-4 w-4" />
                  <span>{repo.forks}</span>
                </div>
                <div className="text-sm text-gray-400">{repo.updated}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">How to Contribute</h3>
            <p className="text-gray-400 mb-4">
              We welcome contributions from developers of all skill levels. Here's how you can get involved:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Fork the repository you're interested in</li>
              <li>Create a feature branch</li>
              <li>Make your changes</li>
              <li>Submit a pull request</li>
            </ol>
            <Button className="mt-6">
              <Code className="h-5 w-5 mr-2" />
              Contribution Guidelines
            </Button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Open Source at HeartCare</h3>
            <p className="text-gray-400 mb-4">
              We believe in the power of open source to accelerate innovation in healthcare technology. Our open source
              projects include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300">
              <li>Machine learning models for heart disease prediction</li>
              <li>Data processing utilities for medical datasets</li>
              <li>UI components for health monitoring applications</li>
              <li>API libraries for health data integration</li>
            </ul>
            <Button variant="outline" className="mt-6">
              Learn More
            </Button>
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
            <Link href="/social/linkedin">
              <Button variant="outline" className="flex items-center gap-2">
                LinkedIn
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
