import { Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Find answers to common questions about HeartCare and heart health
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search for questions..." className="pl-10 bg-gray-900 border-gray-800 h-12" />
          </div>
        </div>

        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" className="rounded-full">
              All Questions
            </Button>
            <Button variant="outline" className="rounded-full">
              Getting Started
            </Button>
            <Button variant="outline" className="rounded-full">
              Account & Billing
            </Button>
            <Button variant="outline" className="rounded-full">
              Features
            </Button>
            <Button variant="outline" className="rounded-full">
              Technical
            </Button>
            <Button variant="outline" className="rounded-full">
              Privacy & Security
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-4 flex justify-between items-center cursor-pointer">
              <h3 className="text-lg font-medium">What is HeartCare and how does it work?</h3>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-800/50">
              <p className="text-gray-300">
                HeartCare is a web-based platform that uses advanced machine learning algorithms to assess your risk of
                heart disease based on your health metrics. You input your health information through our secure form,
                and our model analyzes this data to provide a personalized risk assessment. The assessment includes a
                risk level (low, moderate, or high), a numerical risk score, and personalized recommendations based on
                your specific risk factors.
              </p>
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-4 flex justify-between items-center cursor-pointer">
              <h3 className="text-lg font-medium">How accurate is the heart disease risk assessment?</h3>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-800/50">
              <p className="text-gray-300">
                Our risk assessment model has been trained on extensive medical data and has a 95% accuracy rate when
                compared to clinical diagnoses. However, it's important to note that this is a predictive tool and not a
                diagnostic one. The assessment should be used as one component of your heart health management,
                alongside regular check-ups with healthcare professionals. Always consult with a healthcare provider for
                a comprehensive evaluation and diagnosis.
              </p>
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-4 flex justify-between items-center cursor-pointer">
              <h3 className="text-lg font-medium">Is my health data secure and private?</h3>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-800/50">
              <p className="text-gray-300">
                Yes, we take data security and privacy very seriously. All health data submitted to HeartCare is
                encrypted both in transit and at rest. We comply with HIPAA regulations and GDPR requirements. Your
                personal health information is never shared with third parties without your explicit consent. You can
                read more about our data practices in our Privacy Policy.
              </p>
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-4 flex justify-between items-center cursor-pointer">
              <h3 className="text-lg font-medium">Can I use HeartCare if I already have heart disease?</h3>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-800/50">
              <p className="text-gray-300">
                Yes, HeartCare can still be valuable if you have existing heart disease. The platform can help you
                monitor changes in your risk factors over time and track how lifestyle modifications or treatments are
                affecting your overall risk profile. However, it's especially important for individuals with diagnosed
                heart conditions to use HeartCare in conjunction with, not as a replacement for, their regular medical
                care.
              </p>
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-4 flex justify-between items-center cursor-pointer">
              <h3 className="text-lg font-medium">How often should I complete a heart risk assessment?</h3>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-800/50">
              <p className="text-gray-300">
                For most individuals, we recommend completing a heart risk assessment every 3-6 months, or whenever
                there are significant changes in your health metrics (such as blood pressure or cholesterol levels). If
                you're actively working on improving your heart health through lifestyle changes or medication, you
                might want to assess more frequently to track your progress. Users with high-risk assessments may
                benefit from more frequent monitoring, in consultation with their healthcare provider.
              </p>
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-4 flex justify-between items-center cursor-pointer">
              <h3 className="text-lg font-medium">What payment methods do you accept?</h3>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-800/50">
              <p className="text-gray-300">
                We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple Pay.
                For enterprise plans, we also offer invoice-based payment options. All payments are processed securely
                through our payment processor, and we never store your full credit card information on our servers.
              </p>
            </div>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <div className="bg-gray-900 p-4 flex justify-between items-center cursor-pointer">
              <h3 className="text-lg font-medium">Can I cancel my subscription at any time?</h3>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </div>
            <div className="p-4 bg-gray-800/50">
              <p className="text-gray-300">
                Yes, you can cancel your subscription at any time through your account settings. If you cancel, you'll
                continue to have access to your premium features until the end of your current billing period. We don't
                offer prorated refunds for partial months, but you won't be charged for the next billing cycle after
                cancellation.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-400 mb-6">
            Our support team is here to help. Contact us and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-red-600 hover:bg-red-700">Contact Support</Button>
            <Button variant="outline">View Documentation</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
