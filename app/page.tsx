import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Heart, Activity, BarChart2, Shield, Users, ArrowRight, CheckCircle, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Trust Section - Above Hero */}
      <section className="bg-slate-900/60 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 justify-start items-start sm:items-center">
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">HIPAA compliant & medically validated</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <span className="text-sm sm:text-base">Used by 50,000+ health-conscious individuals</span>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-slate-950 to-slate-950 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text & CTA */}
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
                  Heart Health Intelligence
                </p>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
                  Know Your Heart's Future Today
                </h1>
                <p className="text-lg sm:text-xl text-slate-300 max-w-xl leading-relaxed">
                  Our AI-powered platform analyzes your health data to predict heart disease risk with clinical
                  accuracy, empowering you to take preventive action.
                </p>
              </div>

              {/* Primary CTA */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-base w-full sm:w-auto"
                  >
                    Get Your Risk Assessment <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-600 text-white hover:bg-slate-900/50 font-semibold px-8 py-6 text-base w-full sm:w-auto bg-transparent"
                  >
                    Learn How It Works
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column - Risk Score Card */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-blue-400/10 rounded-2xl blur-3xl"></div>
              <div className="relative bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl">
                <div className="space-y-6">
                  <div>
                    <p className="text-slate-400 text-sm font-semibold mb-2">Your Risk Score</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-bold text-white">24%</span>
                      <span className="text-sm text-slate-400">Lower than average for your age group</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full"
                      style={{ width: "24%" }}
                    ></div>
                  </div>

                  {/* Stats */}
                  <div className="border-t border-slate-800 pt-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Heart Rate</span>
                      <span className="text-white font-semibold">72 bpm</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Blood Pressure</span>
                      <span className="text-white font-semibold">118/76 mmHg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">Cholesterol</span>
                      <span className="text-white font-semibold">180 mg/dL</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-slate-800 bg-slate-900/50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <p className="text-slate-400">Prediction Accuracy</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <p className="text-slate-400">Active Users Worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">10s</div>
              <p className="text-slate-400">Results in Seconds</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">Everything You Need for Heart Health</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Comprehensive tools designed with medical professionals and patients in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Feature 1 */}
            <div className="bg-slate-900/50 border border-slate-800 hover:border-blue-600/50 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-blue-500/10">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-5">
                <Heart className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">AI Risk Prediction</h3>
              <p className="text-slate-300 mb-5">
                Machine learning algorithms trained on millions of medical records provide personalized risk
                assessments.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" /> Instant analysis
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" /> Multi-factor assessment
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/50 border border-slate-800 hover:border-emerald-600/50 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-emerald-500/10">
              <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mb-5">
                <Activity className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Health Monitoring</h3>
              <p className="text-slate-300 mb-5">
                Track vital statistics and trends over time with intuitive dashboards and real-time insights.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" /> Real-time tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" /> Trend analysis
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/50 border border-slate-800 hover:border-violet-600/50 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-violet-500/10">
              <div className="w-12 h-12 bg-violet-600/20 rounded-lg flex items-center justify-center mb-5">
                <BarChart2 className="h-6 w-6 text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Data Visualization</h3>
              <p className="text-slate-300 mb-5">
                Beautiful charts and graphs make your health data easy to understand and actionable.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-violet-400" /> Interactive charts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-violet-400" /> Progress tracking
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/50 border border-slate-800 hover:border-rose-600/50 rounded-xl p-8 transition-all hover:shadow-lg hover:shadow-rose-500/10">
              <div className="w-12 h-12 bg-rose-600/20 rounded-lg flex items-center justify-center mb-5">
                <Shield className="h-6 w-6 text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Privacy & Security</h3>
              <p className="text-slate-300 mb-5">
                Bank-level encryption and HIPAA compliance ensure your health data is always protected.
              </p>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-rose-400" /> End-to-end encryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-rose-400" /> HIPAA compliant
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">Start Your Heart Health Journey Today</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Join thousands of individuals taking control of their heart health with data-driven insights and
            professional guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-6 text-base w-full sm:w-auto"
              >
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-blue-700/50 font-semibold px-8 py-6 text-base w-full sm:w-auto bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
