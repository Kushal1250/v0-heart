import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Machine Learning Engineer",
      department: "Engineering",
      location: "San Francisco, CA (Hybrid)",
      type: "Full-time",
      description:
        "Join our ML team to improve and expand our heart disease prediction models. You'll work with healthcare data and implement cutting-edge algorithms.",
      requirements: [
        "5+ years of ML experience",
        "Experience with healthcare data",
        "Strong Python skills",
        "Background in statistical modeling",
      ],
    },
    {
      title: "Frontend Developer",
      department: "Engineering",
      location: "Remote (US)",
      type: "Full-time",
      description:
        "Help build intuitive interfaces for our heart health platform. You'll work with React, Next.js, and modern frontend technologies.",
      requirements: [
        "3+ years of React experience",
        "Experience with Next.js",
        "Strong TypeScript skills",
        "Eye for design and user experience",
      ],
    },
    {
      title: "Medical Content Writer",
      department: "Content",
      location: "Remote (Global)",
      type: "Contract",
      description: "Create accurate, engaging content about heart health for our blog, app, and educational materials.",
      requirements: [
        "Medical or healthcare background",
        "Excellent writing skills",
        "Experience in health communication",
        "Understanding of cardiology topics",
      ],
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Boston, MA (Hybrid)",
      type: "Full-time",
      description:
        "Lead product development for our enterprise healthcare solutions. You'll work with customers, engineers, and medical experts.",
      requirements: [
        "3+ years in healthcare product management",
        "Experience with B2B products",
        "Strong communication skills",
        "Data-driven approach",
      ],
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote (US)",
      type: "Full-time",
      description: "Ensure our enterprise customers successfully implement and adopt HeartCare in their organizations.",
      requirements: [
        "3+ years in customer success",
        "Healthcare industry experience",
        "Strong problem-solving skills",
        "Excellent communication",
      ],
    },
    {
      title: "Data Scientist",
      department: "Data Science",
      location: "San Francisco, CA (Hybrid)",
      type: "Full-time",
      description:
        "Analyze health data to derive insights and improve our prediction models. You'll work with large datasets and implement statistical methods.",
      requirements: [
        "MS/PhD in Statistics, Computer Science, or related field",
        "Experience with healthcare data",
        "Strong Python and R skills",
        "Background in statistical modeling",
      ],
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Help us build the future of heart health monitoring and make a difference in people's lives
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Why Work With Us</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Meaningful Impact</h3>
              <p className="text-gray-400">
                Your work will directly contribute to improving heart health outcomes for thousands of people worldwide.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Innovation-Driven</h3>
              <p className="text-gray-400">
                We're constantly pushing the boundaries of what's possible in health technology and predictive
                analytics.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Growth & Development</h3>
              <p className="text-gray-400">
                We invest in our team members' growth with continuous learning opportunities and career advancement.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Benefits & Perks</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">Health Insurance</h3>
              <p className="text-gray-400 text-sm">Comprehensive medical, dental, and vision coverage</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">Flexible Work</h3>
              <p className="text-gray-400 text-sm">Remote-friendly with flexible hours</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">Equity</h3>
              <p className="text-gray-400 text-sm">Competitive equity packages for all employees</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">Unlimited PTO</h3>
              <p className="text-gray-400 text-sm">Take time off when you need it</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">Learning Budget</h3>
              <p className="text-gray-400 text-sm">Annual budget for courses and conferences</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">Wellness Program</h3>
              <p className="text-gray-400 text-sm">Monthly wellness stipend and activities</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">401(k) Match</h3>
              <p className="text-gray-400 text-sm">Generous company match for retirement</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-4 rounded-lg text-center">
              <h3 className="font-bold mb-2">Parental Leave</h3>
              <p className="text-gray-400 text-sm">Generous paid leave for new parents</p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <Card key={index} className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{position.title}</CardTitle>
                      <CardDescription>{position.department}</CardDescription>
                    </div>
                    <div className="bg-red-900/20 text-red-400 text-xs font-medium px-2.5 py-0.5 rounded">New</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{position.location}</span>
                      <span className="font-medium">{position.type}</span>
                    </div>
                    <p className="text-gray-300">{position.description}</p>
                    <div>
                      <h4 className="font-medium mb-2">Requirements:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {position.requirements.map((req, i) => (
                          <li key={i} className="text-gray-400 text-sm">
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button className="self-start mt-2">Apply Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Don't see a position that fits?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals who are passionate about improving heart health through
            technology. Send us your resume and tell us how you can contribute.
          </p>
          <a
            href="mailto:heartguide108@gmail.com"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors inline-block"
          >
            Send Your Resume
          </a>
        </div>
      </div>
    </div>
  )
}
