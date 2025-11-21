import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Activity, BarChart2, Shield, Users, ArrowRight, CheckCircle } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Optimized for conversion */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Text & CTA */}
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-4">
                <p className="text-primary font-semibold text-lg">Heart Health Intelligence</p>
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground leading-tight">
                  Know Your Heart's Future Today
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Our AI-powered platform analyzes your health data to predict heart disease risk with clinical
                  accuracy, empowering you to take preventive action.
                </p>
              </div>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white btn-hover-effect w-full sm:w-auto"
                  >
                    Get Your Risk Assessment <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="btn-hover-effect w-full sm:w-auto bg-transparent">
                    Learn How It Works
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="pt-8 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>HIPAA compliant & medically validated</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Used by 50,000+ health-conscious individuals</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative hidden lg:block animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-2xl blur-2xl"></div>
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-primary/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-foreground">Your Risk Score</div>
                    <div className="text-2xl font-bold text-primary">24%</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: "24%" }}></div>
                  </div>
                  <p className="text-xs text-muted-foreground">Lower than average for your age group</p>
                </div>
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Heart Rate</span>
                    <span className="font-semibold">72 bpm</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Blood Pressure</span>
                    <span className="font-semibold">118/76 mmHg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cholesterol</span>
                    <span className="font-semibold">180 mg/dL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-foreground text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="text-4xl font-bold text-primary mb-2">98%</div>
              <p className="text-white/80">Prediction Accuracy</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-white/80">Active Users Worldwide</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="text-4xl font-bold text-primary mb-2">10s</div>
              <p className="text-white/80">Results in Seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Redesigned */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-slide-up">
            <h2 className="text-4xl font-bold text-foreground mb-4">Everything You Need for Heart Health</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools designed with medical professionals and patients in mind
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Feature 1 */}
            <div
              className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-xl border border-blue-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">AI Risk Prediction</h3>
              <p className="text-muted-foreground mb-4">
                Machine learning algorithms trained on millions of medical records provide personalized risk
                assessments.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" /> Instant analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" /> Multi-factor assessment
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div
              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-xl border border-emerald-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Health Monitoring</h3>
              <p className="text-muted-foreground mb-4">
                Track vital statistics and trends over time with intuitive dashboards and real-time insights.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" /> Real-time tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" /> Trend analysis
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div
              className="bg-gradient-to-br from-violet-50 to-purple-50 p-8 rounded-xl border border-violet-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="h-6 w-6 text-violet-600" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Data Visualization</h3>
              <p className="text-muted-foreground mb-4">
                Beautiful charts and graphs make your health data easy to understand and actionable.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-violet-600" /> Interactive charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-violet-600" /> Progress tracking
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div
              className="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-xl border border-rose-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Privacy & Security</h3>
              <p className="text-muted-foreground mb-4">
                Bank-level encryption and HIPAA compliance ensure your health data is always protected.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-rose-600" /> End-to-end encryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-rose-600" /> HIPAA compliant
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div
              className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-xl border border-amber-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Expert Support</h3>
              <p className="text-muted-foreground mb-4">
                Connect with cardiologists and healthcare professionals who provide personalized guidance.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600" /> 24/7 support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-amber-600" /> Medical experts
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div
              className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-xl border border-cyan-100 card-hover animate-slide-up"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <ArrowRight className="h-6 w-6 text-cyan-600" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3">Personalized Insights</h3>
              <p className="text-muted-foreground mb-4">
                Receive tailored recommendations based on your unique health profile and risk factors.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-600" /> AI recommendations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-600" /> Personalized plans
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl font-bold mb-6">Start Your Heart Health Journey Today</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
              Join thousands of individuals taking control of their heart health with data-driven insights and
              professional guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 btn-hover-effect w-full sm:w-auto">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 btn-hover-effect w-full sm:w-auto bg-transparent"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
