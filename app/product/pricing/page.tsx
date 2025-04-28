import { Check, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the plan that's right for you and start monitoring your heart health today
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Free Plan */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <div className="text-4xl font-bold">Free</div>
              <CardDescription>For individuals getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Basic heart disease risk assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Store up to 5 assessment results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>PDF export of results</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Basic health recommendations</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gray-800 hover:bg-gray-700">Get Started</Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="bg-gray-900 border-red-600 relative">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <div className="text-4xl font-bold">
                $9.99<span className="text-base font-normal">/month</span>
              </div>
              <CardDescription>For health-conscious individuals</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Advanced heart disease risk assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Unlimited assessment history</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Detailed PDF reports with insights</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Personalized health recommendations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Email and WhatsApp support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Progress tracking and insights</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-red-600 hover:bg-red-700">Subscribe Now</Button>
            </CardFooter>
          </Card>

          {/* Professional Plan */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <div className="text-4xl font-bold">
                $29.99<span className="text-base font-normal">/month</span>
              </div>
              <CardDescription>For healthcare providers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>All Premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Patient management dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Bulk assessment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Advanced analytics and reporting</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>API access for integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  <span>Priority 24/7 support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-gray-800 hover:bg-gray-700">Contact Sales</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-red-500" />
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-400">
                Yes, you can cancel your subscription at any time. If you cancel, you'll continue to have access to your
                premium features until the end of your current billing period.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-red-500" />
                Is my health data secure?
              </h3>
              <p className="text-gray-400">
                Absolutely. We use industry-standard encryption and security practices to protect your data. We never
                share your personal health information with third parties without your explicit consent.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-red-500" />
                Do you offer discounts for healthcare organizations?
              </h3>
              <p className="text-gray-400">
                Yes, we offer special pricing for healthcare organizations, clinics, and hospitals. Please contact our
                sales team for more information on enterprise pricing and volume discounts.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-red-500" />
                How accurate is the risk assessment?
              </h3>
              <p className="text-gray-400">
                Our risk assessment model has been trained on extensive medical data and has a 95% accuracy rate.
                However, it should not replace professional medical advice. Always consult with a healthcare provider
                for a comprehensive evaluation.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to take control of your heart health?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join thousands of users who are monitoring their heart health with HeartCare. Start your journey today with
            our risk-free trial.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-red-600 hover:bg-red-700">Start Free Trial</Button>
            <Button variant="outline">Contact Sales</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
