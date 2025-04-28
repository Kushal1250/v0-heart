import { Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PressReleasesPage() {
  const pressReleases = [
    {
      title: "HeartCare Launches New AI-Powered Risk Assessment Tool",
      excerpt:
        "HeartCare today announced the launch of its next-generation heart disease risk assessment tool, powered by advanced artificial intelligence and machine learning algorithms.",
      date: "April 15, 2024",
      category: "Product Launch",
      slug: "heartcare-launches-ai-powered-risk-assessment",
    },
    {
      title: "HeartCare Partners with National Heart Association for Awareness Campaign",
      excerpt:
        "HeartCare and the National Heart Association have joined forces to launch a nationwide awareness campaign aimed at educating the public about heart disease prevention.",
      date: "March 28, 2024",
      category: "Partnership",
      slug: "heartcare-partners-with-national-heart-association",
    },
    {
      title: "HeartCare Secures $10 Million in Series A Funding",
      excerpt:
        "HeartCare announced today that it has secured $10 million in Series A funding to expand its heart health monitoring platform and accelerate product development.",
      date: "March 10, 2024",
      category: "Funding",
      slug: "heartcare-secures-series-a-funding",
    },
    {
      title: "HeartCare Expands Enterprise Solutions for Healthcare Providers",
      excerpt:
        "HeartCare today announced the expansion of its enterprise solutions designed specifically for hospitals, clinics, and healthcare systems.",
      date: "February 22, 2024",
      category: "Product Update",
      slug: "heartcare-expands-enterprise-solutions",
    },
    {
      title: "HeartCare Achieves HIPAA Compliance Certification",
      excerpt:
        "HeartCare has successfully completed its HIPAA compliance certification, reinforcing its commitment to protecting sensitive patient health information.",
      date: "February 8, 2024",
      category: "Compliance",
      slug: "heartcare-achieves-hipaa-compliance",
    },
    {
      title: "HeartCare Releases Annual Heart Health Trends Report",
      excerpt:
        "HeartCare has published its annual Heart Health Trends Report, providing insights into cardiovascular health patterns and risk factors across different demographics.",
      date: "January 25, 2024",
      category: "Research",
      slug: "heartcare-releases-annual-trends-report",
    },
    {
      title: "HeartCare Appoints Dr. Sarah Chen as Chief Medical Officer",
      excerpt:
        "HeartCare today announced the appointment of Dr. Sarah Chen, a renowned cardiologist with over 15 years of experience, as its new Chief Medical Officer.",
      date: "January 10, 2024",
      category: "Leadership",
      slug: "heartcare-appoints-sarah-chen-cmo",
    },
    {
      title: "HeartCare Integrates with Major Electronic Health Record Systems",
      excerpt:
        "HeartCare announced today the successful integration of its platform with major electronic health record (EHR) systems, including Epic and Cerner.",
      date: "December 12, 2023",
      category: "Integration",
      slug: "heartcare-integrates-with-ehr-systems",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Press Releases</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">The latest news and announcements from HeartCare</p>
        </div>

        {/* Featured Press Release */}
        <div className="mb-16">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <span className="bg-red-900/30 text-red-400 text-xs font-medium px-2.5 py-0.5 rounded">Featured</span>
                  <CardTitle className="text-2xl mt-2">HeartCare Reaches 1 Million Users Milestone</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> April 22, 2024
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                HeartCare today announced that it has reached a significant milestone of 1 million users on its heart
                health monitoring platform. This achievement marks a major step in the company's mission to make heart
                disease risk assessment accessible to everyone.
              </p>
              <p className="text-gray-300 mt-4">
                "Reaching 1 million users is not just a number for us—it represents 1 million people who are taking
                proactive steps to understand and manage their heart health," said Michael Rodriguez, CEO of HeartCare.
                "We're proud to be making a difference in so many lives and remain committed to expanding our reach even
                further."
              </p>
            </CardContent>
            <CardFooter>
              <Button className="bg-red-600 hover:bg-red-700">Read Full Release</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Press Release List */}
        <div className="space-y-6 mb-16">
          {pressReleases.map((release, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="bg-gray-800 text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded">
                    {release.category}
                  </span>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {release.date}
                  </CardDescription>
                </div>
                <CardTitle className="text-xl mt-2">{release.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">{release.excerpt}</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="flex items-center gap-1">
                  Read Full Release <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Archive Navigation */}
        <div className="flex justify-center mb-16">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" className="rounded-full">
              All
            </Button>
            <Button variant="outline" className="rounded-full">
              2024
            </Button>
            <Button variant="outline" className="rounded-full">
              2023
            </Button>
            <Button variant="outline" className="rounded-full">
              2022
            </Button>
            <Button variant="outline" className="rounded-full">
              2021
            </Button>
            <Button variant="outline" className="rounded-full">
              Archive
            </Button>
          </div>
        </div>

        {/* Media Contact */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Media Contact</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-gray-400 mb-6">
              For press inquiries, interview requests, or additional information about HeartCare, please contact our
              media relations team.
            </p>
            <div className="grid md:grid-cols-2 gap-6 text-center md:text-left">
              <div>
                <h3 className="font-bold mb-2">Media Relations</h3>
                <p className="text-gray-400">Emily Johnson</p>
                <p className="text-gray-400">Director of Communications</p>
                <p className="text-gray-400 mt-2">
                  <a href="mailto:heartguide108@gmail.com" className="text-blue-400 hover:underline">
                    heartguide108@gmail.com
                  </a>
                </p>
                <p className="text-gray-400">
                  <a href="tel:+919016261380" className="text-blue-400 hover:underline">
                    +91 (901) 626-1380
                  </a>
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Press Kit</h3>
                <p className="text-gray-400 mb-4">
                  Download our press kit for company logos, executive headshots, product screenshots, and fact sheets.
                </p>
                <Button className="bg-red-600 hover:bg-red-700">Download Press Kit</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
