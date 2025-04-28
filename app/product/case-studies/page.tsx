import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      title: "Reducing Heart Disease Risk in Corporate Wellness Program",
      organization: "Global Tech Corporation",
      description:
        "How a tech company with 5,000+ employees implemented HeartCare as part of their wellness program, resulting in a 24% reduction in cardiovascular risk factors among high-risk employees.",
      results: [
        "24% reduction in cardiovascular risk factors",
        "18% decrease in health insurance claims",
        "92% employee satisfaction rate",
      ],
      category: "Corporate Wellness",
    },
    {
      title: "Preventive Cardiology in Rural Communities",
      organization: "Heartland Health Network",
      description:
        "A network of rural clinics used HeartCare to extend their reach and provide preventive cardiology services to underserved communities, improving early detection rates.",
      results: [
        "35% increase in early detection of heart conditions",
        "28% reduction in emergency cardiac events",
        "Reached 12,000+ patients in remote areas",
      ],
      category: "Healthcare Provider",
    },
    {
      title: "Personalized Heart Health Management for Seniors",
      organization: "Golden Years Retirement Communities",
      description:
        "Implementation of HeartCare across 15 retirement communities to help seniors monitor their heart health and reduce cardiovascular incidents.",
      results: [
        "22% reduction in heart-related hospitalizations",
        "Improved medication adherence by 31%",
        "89% of residents actively engaged with the platform",
      ],
      category: "Senior Care",
    },
    {
      title: "Integrating Heart Health Data with Electronic Health Records",
      organization: "Metropolitan Medical Center",
      description:
        "How a major hospital integrated HeartCare's API with their electronic health record system to provide physicians with comprehensive heart health data.",
      results: [
        "Reduced assessment time by 15 minutes per patient",
        "Improved risk stratification accuracy by 28%",
        "Seamless data flow between systems",
      ],
      category: "Healthcare Integration",
    },
    {
      title: "Heart Health Education and Monitoring in University Setting",
      organization: "State University Health Services",
      description:
        "A university implemented HeartCare as part of their student health services, focusing on education and early monitoring for young adults.",
      results: [
        "Identified previously unknown risk factors in 8% of students",
        "Increased heart health awareness by 45%",
        "Created personalized health plans for 3,000+ students",
      ],
      category: "Education",
    },
    {
      title: "Insurance Premium Incentives for Heart Health Monitoring",
      organization: "Secure Life Insurance",
      description:
        "An insurance company offered premium discounts for policyholders who maintained regular heart health monitoring through HeartCare.",
      results: [
        "15% average premium reduction for participating members",
        "32% increase in preventive care visits",
        "Positive ROI within first year of implementation",
      ],
      category: "Insurance",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Case Studies</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Real-world examples of how organizations are using HeartCare to improve heart health outcomes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {caseStudies.map((study, index) => (
            <Card key={index} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="bg-red-900/20 text-red-400 text-xs font-medium px-2.5 py-0.5 rounded w-fit mb-2">
                  {study.category}
                </div>
                <CardTitle className="text-xl">{study.title}</CardTitle>
                <CardDescription>{study.organization}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-4">{study.description}</p>
                <div className="bg-gray-800 p-4 rounded-md">
                  <h4 className="font-semibold mb-2">Key Results:</h4>
                  <ul className="space-y-1">
                    {study.results.map((result, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 text-lg">✓</span>
                        <span className="text-gray-300">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Read Full Case Study <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-4">Interested in implementing HeartCare in your organization?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Our team can help you develop a customized solution that meets your specific needs and goals.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Contact Our Team
            </a>
            <a
              href="/product/enterprise"
              className="bg-transparent border border-gray-600 hover:border-gray-500 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Enterprise Solutions
            </a>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Implementation Process</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-red-400">1</span>
              </div>
              <h3 className="font-bold mb-2">Consultation</h3>
              <p className="text-gray-400 text-sm">We assess your needs and develop a tailored implementation plan.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-red-400">2</span>
              </div>
              <h3 className="font-bold mb-2">Integration</h3>
              <p className="text-gray-400 text-sm">Our technical team handles all aspects of system integration.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-red-400">3</span>
              </div>
              <h3 className="font-bold mb-2">Training</h3>
              <p className="text-gray-400 text-sm">We provide comprehensive training for your team and users.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-red-400">4</span>
              </div>
              <h3 className="font-bold mb-2">Ongoing Support</h3>
              <p className="text-gray-400 text-sm">Dedicated support and regular updates to ensure success.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Download Case Studies</h2>
          <p className="text-gray-400 mb-6">Get detailed information about our case studies in PDF format.</p>
          <Button className="bg-transparent border border-gray-600 hover:border-gray-500">
            Download Case Studies Pack
          </Button>
        </div>
      </div>
    </div>
  )
}
