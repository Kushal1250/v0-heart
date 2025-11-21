import { Activity, BarChart2, Shield, Users, ArrowRight, Brain, Clock, FileText, Smartphone, Globe } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { StructuredData } from "@/lib/structured-data"
import { generateMetadata } from "@/lib/seo-config"
import Link from "next/link"

export const metadata = generateMetadata({
  title: "Features - Advanced Heart Disease Risk Prediction Tools",
  description:
    "Discover HeartGuard AI's comprehensive features: AI-powered risk assessment, health monitoring, data visualization, expert guidance, and personalized recommendations for heart health.",
  url: "/features",
})

export default function FeaturesPage() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Risk Assessment",
      description:
        "Advanced machine learning algorithms analyze 13+ cardiovascular risk factors including age, cholesterol levels, blood pressure, and lifestyle factors to provide accurate heart disease risk predictions.",
      benefits: ["Clinical-grade accuracy", "Real-time analysis", "Continuous learning", "Evidence-based results"],
    },
    {
      icon: Activity,
      title: "Continuous Health Monitoring",
      description:
        "Track vital cardiovascular metrics over time with personalized dashboards that monitor blood pressure trends, cholesterol changes, and other key health indicators.",
      benefits: ["Trend analysis", "Automated alerts", "Progress tracking", "Historical data"],
    },
    {
      icon: BarChart2,
      title: "Interactive Data Visualization",
      description:
        "Comprehensive charts and graphs help you understand your health data, visualize risk factors, and track improvements in your cardiovascular health over time.",
      benefits: ["Visual insights", "Trend identification", "Risk factor analysis", "Progress reports"],
    },
    {
      icon: Shield,
      title: "HIPAA-Compliant Security",
      description:
        "Enterprise-grade encryption and healthcare data protection standards ensure your sensitive health information remains private, secure, and compliant with medical privacy regulations.",
      benefits: ["End-to-end encryption", "Secure data storage", "Privacy compliance", "Access controls"],
    },
    {
      icon: Users,
      title: "Expert Medical Guidance",
      description:
        "Connect with board-certified cardiologists and healthcare professionals who provide personalized recommendations and guidance based on your risk assessment results.",
      benefits: ["Professional consultation", "Personalized advice", "Treatment planning", "Follow-up care"],
    },
    {
      icon: FileText,
      title: "Personalized Action Plans",
      description:
        "Receive customized lifestyle recommendations, dietary suggestions, exercise plans, and medication reminders tailored to your specific cardiovascular risk profile.",
      benefits: ["Custom recommendations", "Lifestyle guidance", "Diet planning", "Exercise routines"],
    },
    {
      icon: Clock,
      title: "Real-Time Risk Updates",
      description:
        "Get instant updates on your cardiovascular risk as you input new health data, allowing you to see immediate impacts of lifestyle changes on your heart health.",
      benefits: ["Instant feedback", "Dynamic updates", "Motivation tracking", "Goal monitoring"],
    },
    {
      icon: Smartphone,
      title: "Mobile-Optimized Platform",
      description:
        "Access your heart health dashboard from any device with our responsive, mobile-first design that ensures seamless experience across smartphones, tablets, and desktops.",
      benefits: ["Cross-platform access", "Offline capabilities", "Push notifications", "Sync across devices"],
    },
    {
      icon: Globe,
      title: "Multi-Language Support",
      description:
        "Available in multiple languages to serve diverse global communities, making heart health assessment accessible to users worldwide regardless of their primary language.",
      benefits: ["Global accessibility", "Cultural adaptation", "Localized content", "Regional guidelines"],
    },
  ]

  return (
    <>
      <StructuredData
        type="medicalWebPage"
        data={{
          title: "Heart Disease Risk Prediction Features",
          description: metadata.description,
          url: "/features",
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <Breadcrumb items={[{ name: "Features", url: "/features" }]} />

            <header className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
                Advanced Heart Health Features
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Comprehensive cardiovascular risk assessment tools powered by artificial intelligence, medical
                expertise, and cutting-edge healthcare technology.
              </p>
            </header>

            {/* Features Grid */}
            <section className="mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center gap-2 text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* How It Works Section */}
            <section className="mb-16">
              <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-8 rounded-xl">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">1</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Input Health Data</h3>
                    <p className="text-gray-600">
                      Provide your health information including age, blood pressure, cholesterol levels, and lifestyle
                      factors through our secure, user-friendly interface.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">2</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">AI Analysis</h3>
                    <p className="text-gray-600">
                      Our advanced machine learning algorithms analyze your data against validated medical datasets to
                      calculate your personalized cardiovascular risk score.
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-primary">3</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-foreground">Get Recommendations</h3>
                    <p className="text-gray-600">
                      Receive personalized action plans, lifestyle recommendations, and guidance from healthcare
                      professionals to improve your heart health.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
              <div className="bg-primary/10 p-8 rounded-xl border border-primary/20">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  Ready to Take Control of Your Heart Health?
                </h2>
                <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">
                  Join over 50,000 users who have already discovered their cardiovascular risk and taken proactive steps
                  toward better heart health with our comprehensive feature set.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Start Free Assessment <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/about"
                    className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Learn More About Us
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
