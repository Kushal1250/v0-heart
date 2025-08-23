import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Activity, BarChart2, Shield, Users, ArrowRight } from "lucide-react"
import { StructuredData } from "@/lib/structured-data"
import { siteConfig } from "@/lib/seo-config"

export default function HomePage() {
  const faqData = {
    questions: [
      {
        question: "How accurate is the heart disease prediction?",
        answer:
          "Our AI model uses advanced machine learning algorithms trained on extensive medical datasets, achieving high accuracy rates. However, this tool is for informational purposes and should not replace professional medical advice.",
      },
      {
        question: "Is my health data secure and private?",
        answer:
          "Yes, we use enterprise-grade encryption and follow strict privacy protocols. Your health data is never shared with third parties and is stored securely in compliance with healthcare data protection standards.",
      },
      {
        question: "Do I need to create an account to use the prediction tool?",
        answer:
          "Yes, creating a free account allows you to save your results, track your health over time, and receive personalized recommendations based on your health profile.",
      },
      {
        question: "Can this tool replace a doctor's consultation?",
        answer:
          "No, our tool is designed to provide insights and help you understand potential risk factors. Always consult with healthcare professionals for proper medical diagnosis and treatment.",
      },
    ],
  }

  return (
    <>
      <StructuredData type="website" />
      <StructuredData type="organization" />
      <StructuredData
        type="medicalWebPage"
        data={{
          title: "Heart Disease Risk Prediction | AI-Powered Health Assessment",
          description: siteConfig.description,
          url: siteConfig.url,
        }}
      />
      <StructuredData type="faq" data={faqData} />
      <StructuredData type="product" />

      <div className="min-h-screen bg-background relative">
        <div className="home-bg-animation">
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
        </div>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-slide-up">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                  AI-Powered <span className="text-primary">Heart Disease</span> Risk Assessment
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Get personalized cardiovascular risk insights using advanced machine learning. Monitor your heart
                  health, track vital statistics, and receive expert recommendations to prevent heart disease before it
                  develops.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white btn-hover-effect nav-link">
                      Start Free Assessment <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="btn-hover-effect nav-link bg-transparent">
                      How It Works
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-blue-600 rounded-lg blur opacity-30 animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-xl">
                  <div className="aspect-video rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src="/heart-health-dashboard.png"
                      alt="Heart Disease Risk Assessment Dashboard showing personalized health metrics, risk factors analysis, and AI-powered predictions"
                      className="w-full h-full object-cover"
                      loading="eager"
                      width={600}
                      height={400}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 animate-slide-up">
              <h2 className="text-3xl font-bold text-foreground">Advanced Heart Health Features</h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive cardiovascular risk assessment tools powered by artificial intelligence and medical
                expertise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">AI Risk Prediction</h3>
                <p className="text-gray-600">
                  Machine learning algorithms analyze 13+ cardiovascular risk factors to predict potential heart disease
                  with clinical-grade accuracy.
                </p>
              </div>

              {/* Feature 2 */}
              <div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Continuous Health Monitoring</h3>
                <p className="text-gray-600">
                  Track blood pressure, cholesterol levels, and other vital cardiovascular metrics with personalized
                  health insights and trend analysis.
                </p>
              </div>

              {/* Feature 3 */}
              <div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Interactive Health Analytics</h3>
                <p className="text-gray-600">
                  Visual dashboards and charts help you understand your cardiovascular health trends and risk factor
                  progression over time.
                </p>
              </div>

              {/* Feature 4 */}
              <div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">HIPAA-Compliant Security</h3>
                <p className="text-gray-600">
                  Enterprise-grade encryption and healthcare data protection standards ensure your sensitive health
                  information remains private and secure.
                </p>
              </div>

              {/* Feature 5 */}
              <div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
                style={{ animationDelay: "0.5s" }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Medical Expert Guidance</h3>
                <p className="text-gray-600">
                  Access to cardiology specialists and healthcare professionals who provide personalized recommendations
                  based on your risk assessment results.
                </p>
              </div>

              {/* Feature 6 */}
              <div
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover animate-slide-up"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Personalized Action Plans</h3>
                <p className="text-gray-600">
                  Receive customized lifestyle recommendations, dietary suggestions, and exercise plans tailored to your
                  specific cardiovascular risk profile.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-gray-600">
                Get answers to common questions about our heart disease prediction platform.
              </p>
            </div>
            <div className="space-y-6">
              {faqData.questions.map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-slide-up">
              <h2 className="text-3xl font-bold text-foreground mb-6">Take Control of Your Heart Health Today</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Join over 50,000 users who have already discovered their cardiovascular risk and taken proactive steps
                toward better heart health.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white btn-hover-effect">
                    Start Free Risk Assessment
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="btn-hover-effect bg-transparent">
                    Sign In to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
