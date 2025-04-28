import { Heart, Activity, BarChart3, Clock, Shield, Share2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">HeartCare Features</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Our comprehensive suite of tools helps you monitor and improve your cardiovascular health
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-900/30 p-3 rounded-full">
                  <Heart className="h-6 w-6 text-red-500" />
                </div>
                <CardTitle>Heart Disease Prediction</CardTitle>
              </div>
              <CardDescription>Advanced risk assessment using machine learning</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Our AI-powered prediction model analyzes your health metrics to provide a personalized risk assessment
                for heart disease. The model is trained on extensive medical data and provides accurate risk
                stratification into low, moderate, and high-risk categories.
              </p>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Analyzes 13+ health parameters</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Provides risk percentage and category</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Identifies key risk factors</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-900/30 p-3 rounded-full">
                  <Activity className="h-6 w-6 text-blue-500" />
                </div>
                <CardTitle>Health Monitoring</CardTitle>
              </div>
              <CardDescription>Track your health stats over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Monitor changes in your cardiovascular health with our comprehensive tracking tools. Record and
                visualize trends in your blood pressure, cholesterol, and other key metrics to better understand your
                heart health journey.
              </p>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Track blood pressure and cholesterol</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Monitor lifestyle factors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Visualize health trends over time</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-900/30 p-3 rounded-full">
                  <BarChart3 className="h-6 w-6 text-green-500" />
                </div>
                <CardTitle>Personalized Insights</CardTitle>
              </div>
              <CardDescription>Customized recommendations for your health profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Receive tailored recommendations based on your unique health profile. Our system analyzes your
                assessment results and provides actionable insights to help you improve your cardiovascular health and
                reduce risk factors.
              </p>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Customized health recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Lifestyle modification suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Risk factor mitigation strategies</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-900/30 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
                <CardTitle>Assessment History</CardTitle>
              </div>
              <CardDescription>Track your progress over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Keep a comprehensive record of all your heart health assessments. Compare results over time to track
                your progress and see how lifestyle changes impact your cardiovascular health metrics.
              </p>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Store unlimited assessment history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Compare results across time periods</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Track risk trend improvements</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-900/30 p-3 rounded-full">
                  <Shield className="h-6 w-6 text-yellow-500" />
                </div>
                <CardTitle>Data Privacy & Security</CardTitle>
              </div>
              <CardDescription>Your health data is protected</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                We take your privacy seriously. All health data submitted to HeartCare is encrypted and never shared
                with third parties. We use industry-standard security measures to protect your sensitive information.
              </p>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>End-to-end encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>HIPAA-compliant data handling</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>User-controlled data sharing</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-900/30 p-3 rounded-full">
                  <Share2 className="h-6 w-6 text-orange-500" />
                </div>
                <CardTitle>Sharing & Export Options</CardTitle>
              </div>
              <CardDescription>Share results with healthcare providers</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Easily share your assessment results with healthcare providers or export them for your personal records.
                Multiple formats available including PDF reports and secure email sharing.
              </p>
              <ul className="mt-4 space-y-2 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>PDF report generation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Secure email sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 text-lg">✓</span>
                  <span>Direct sharing options</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to monitor your heart health?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Start your heart health journey today with our comprehensive assessment tools and personalized insights.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/predict"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Get Started
            </a>
            <a
              href="/about"
              className="bg-transparent border border-gray-600 hover:border-gray-500 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
