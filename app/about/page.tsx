import { Heart, Shield, Database, Award } from "lucide-react"
import ServerModelExplanation from "@/components/server-model-explanation"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold mb-4 md:mb-6 text-center">About HeartPredict</h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 md:mb-12 text-center">
          Our mission is to provide accessible heart disease risk assessment using advanced machine learning technology.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-8 mb-10 md:mb-16">
          <div className="bg-gray-900/50 p-4 md:p-6 rounded-lg">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="bg-red-900/30 p-2 md:p-3 rounded-full">
                <Heart className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Our Mission</h2>
            </div>
            <p className="text-gray-400 text-sm md:text-base">
              HeartPredict aims to make heart disease risk assessment accessible to everyone. By leveraging machine
              learning, we provide personalized insights that can help individuals make informed decisions about their
              heart health.
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 md:p-6 rounded-lg">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="bg-red-900/30 p-2 md:p-3 rounded-full">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Privacy & Security</h2>
            </div>
            <p className="text-gray-400 text-sm md:text-base">
              We take your privacy seriously. All health data submitted to HeartPredict is encrypted and never shared
              with third parties. We use industry-standard security measures to protect your information.
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 md:p-6 rounded-lg">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="bg-red-900/30 p-2 md:p-3 rounded-full">
                <Database className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Our Data</h2>
            </div>
            <p className="text-gray-400 text-sm md:text-base">
              Our predictive model is trained on anonymized medical data from thousands of patients. This allows us to
              identify patterns and risk factors associated with heart disease with high accuracy.
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 md:p-6 rounded-lg">
            <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
              <div className="bg-red-900/30 p-2 md:p-3 rounded-full">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-red-500" />
              </div>
              <h2 className="text-lg md:text-xl font-bold">Our Team</h2>
            </div>
            <p className="text-gray-400 text-sm md:text-base">
              HeartPredict was developed by a team of healthcare professionals, data scientists, and software engineers
              dedicated to improving heart health outcomes through technology and innovation.
            </p>
          </div>
        </div>

        <div className="mb-10 md:mb-16">
          <ServerModelExplanation />
        </div>

        <div className="bg-gray-900/50 p-5 md:p-8 rounded-lg">
          <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-center">Disclaimer</h2>
          <p className="text-gray-400 text-center text-sm md:text-base">
            HeartPredict is designed to provide a risk assessment based on the information you provide. It is not a
            diagnostic tool and should not replace professional medical advice, diagnosis, or treatment. Always consult
            with a qualified healthcare provider regarding any medical conditions.
          </p>
        </div>
      </div>
    </div>
  )
}
