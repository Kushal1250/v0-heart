import { Heart, Shield, Database, Award, Users, Target, Stethoscope } from "lucide-react"
import ServerModelExplanation from "@/components/server-model-explanation"
import { Breadcrumb } from "@/components/breadcrumb"
import { StructuredData } from "@/lib/structured-data"
import { generateMetadata } from "@/lib/seo-config"
import Link from "next/link"

export const metadata = generateMetadata({
  title: "About HeartGuard AI - Advanced Heart Disease Risk Prediction",
  description:
    "Learn about HeartGuard AI's mission to make heart disease risk assessment accessible through advanced machine learning. Discover our team, technology, and commitment to cardiovascular health.",
  url: "/about",
})

export default function AboutPage() {
  return (
    <>
      <StructuredData
        type="medicalWebPage"
        data={{
          title: "About HeartGuard AI - Advanced Heart Disease Risk Prediction",
          description: metadata.description,
          url: "/about",
        }}
      />
      <StructuredData
        type="organization"
        data={{
          name: "HeartGuard AI",
          description: "Advanced AI-powered heart disease risk prediction platform",
          url: "/about",
        }}
      />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[{ name: "About", url: "/about" }]} />

          <header className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">About HeartGuard AI</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing cardiovascular health through advanced artificial intelligence and personalized risk
              assessment technology.
            </p>
          </header>

          {/* Mission Statement */}
          <section className="mb-16">
            <div className="bg-primary/5 p-8 rounded-xl border border-primary/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                HeartGuard AI is dedicated to democratizing cardiovascular health assessment by making advanced heart
                disease risk prediction accessible to everyone. We believe that early detection and prevention are the
                keys to reducing the global burden of heart disease, which remains the leading cause of death worldwide.
              </p>
            </div>
          </section>

          {/* Key Features Grid */}
          <section className="mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
              What Makes Us Different
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-red-100 p-3 rounded-full">
                    <Heart className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">AI-Powered Accuracy</h3>
                </div>
                <p className="text-gray-600">
                  Our machine learning models are trained on extensive cardiovascular datasets, achieving clinical-grade
                  accuracy in risk prediction and assessment.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Privacy First</h3>
                </div>
                <p className="text-gray-600">
                  HIPAA-compliant security measures ensure your health data is encrypted, protected, and never shared
                  with third parties without your explicit consent.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Evidence-Based</h3>
                </div>
                <p className="text-gray-600">
                  Our algorithms are built on peer-reviewed research and validated against real-world clinical outcomes
                  from leading medical institutions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Expert Team</h3>
                </div>
                <p className="text-gray-600">
                  Developed by cardiologists, data scientists, and healthcare technology experts with decades of
                  combined experience.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Award className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Clinically Validated</h3>
                </div>
                <p className="text-gray-600">
                  Our risk assessment tools have been validated in clinical settings and are continuously improved based
                  on real-world outcomes.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-teal-100 p-3 rounded-full">
                    <Stethoscope className="h-6 w-6 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">Medical Integration</h3>
                </div>
                <p className="text-gray-600">
                  Seamlessly integrates with existing healthcare workflows and supports healthcare providers in making
                  informed decisions.
                </p>
              </div>
            </div>
          </section>

          {/* Technology Section */}
          <section className="mb-16">
            <ServerModelExplanation />
          </section>

          {/* Call to Action */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-primary/10 to-blue-50 p-8 rounded-xl text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                Ready to Assess Your Heart Health?
              </h2>
              <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                Join thousands of users who have taken control of their cardiovascular health with our AI-powered risk
                assessment.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Free Assessment
                </Link>
                <Link
                  href="/product/features"
                  className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Explore Features
                </Link>
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section>
            <div className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-200">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-foreground">Medical Disclaimer</h2>
              <p className="text-gray-600 text-center leading-relaxed">
                HeartGuard AI provides risk assessment tools for educational and informational purposes only. Our
                platform is not intended to diagnose, treat, cure, or prevent any disease. Always consult with qualified
                healthcare professionals for medical advice, diagnosis, and treatment. Never disregard professional
                medical advice or delay seeking treatment based on information from our platform.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
