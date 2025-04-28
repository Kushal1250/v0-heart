import { Heart, BookOpen, Lightbulb } from "lucide-react"
import Image from "next/image"

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">About HeartCare</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our mission is to make heart health monitoring accessible to everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-gray-400 mb-4">
              HeartCare was founded in 2022 by a team of cardiologists, data scientists, and software engineers with a
              shared vision: to make heart disease risk assessment accessible to everyone, everywhere.
            </p>
            <p className="text-gray-400 mb-4">
              Cardiovascular disease remains the leading cause of death globally, yet many cases are preventable with
              early detection and lifestyle modifications. We recognized that traditional risk assessment methods were
              often inaccessible, expensive, or inconvenient for many people.
            </p>
            <p className="text-gray-400">
              By leveraging advanced machine learning and making it available through an intuitive web platform, we've
              created a tool that empowers individuals to understand and manage their heart health proactively.
            </p>
          </div>
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
            <Image src="/heart-health-team.png" alt="HeartCare founding team" fill className="object-cover" />
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <div className="bg-red-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Accessibility</h3>
              <p className="text-gray-400">
                We believe that everyone deserves access to tools that can help them understand and improve their heart
                health, regardless of location or resources.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <div className="bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Education</h3>
              <p className="text-gray-400">
                We're committed to not just providing risk assessments, but also educating users about heart health
                factors and empowering them with knowledge.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <div className="bg-green-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Lightbulb className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Innovation</h3>
              <p className="text-gray-400">
                We continuously improve our prediction models and user experience by incorporating the latest research
                and technology advancements.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 relative">
                <Image src="/confident-cardiologist.png" alt="Dr. Sarah Chen" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold">Dr. Sarah Chen</h3>
              <p className="text-gray-400 mb-2">Chief Medical Officer</p>
              <p className="text-sm text-gray-500">
                Cardiologist with 15+ years of experience in preventive cardiology and risk assessment
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 relative">
                <Image src="/focused-data-scientist.png" alt="Dr. Michael Rodriguez" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold">Dr. Michael Rodriguez</h3>
              <p className="text-gray-400 mb-2">Chief Data Scientist</p>
              <p className="text-sm text-gray-500">
                PhD in Machine Learning with expertise in healthcare predictive modeling
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 relative">
                <Image src="/focused-engineer.png" alt="Aisha Patel" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold">Aisha Patel</h3>
              <p className="text-gray-400 mb-2">Chief Technology Officer</p>
              <p className="text-sm text-gray-500">
                Software engineer with a background in healthcare technology and secure systems
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">500K+</div>
              <p className="text-gray-400">Risk Assessments</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">50+</div>
              <p className="text-gray-400">Countries Reached</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">95%</div>
              <p className="text-gray-400">Model Accuracy</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-red-500 mb-2">20+</div>
              <p className="text-gray-400">Research Partners</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Us in Our Mission</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Whether you're a healthcare professional, researcher, or someone passionate about heart health, we'd love to
            connect with you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/contact"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/careers"
              className="bg-transparent border border-gray-600 hover:border-gray-500 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Careers
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
