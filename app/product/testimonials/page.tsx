import { Star, Quote } from "lucide-react"
import Image from "next/image"

export default function TestimonialsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">What Our Users Say</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover how HeartCare is helping people take control of their heart health
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Featured Testimonial */}
          <div className="md:col-span-2 bg-gray-900 border border-gray-800 p-8 rounded-lg relative">
            <Quote className="absolute top-6 left-6 h-12 w-12 text-red-500/20" />
            <div className="ml-8">
              <p className="text-xl italic mb-6">
                "HeartCare has completely changed how I approach my heart health. After my father's heart attack last
                year, I knew I needed to be more proactive. The regular assessments and personalized recommendations
                have helped me lower my blood pressure and cholesterol levels significantly in just six months."
              </p>
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mr-4 relative">
                  <Image src="/diverse-group-city.png" alt="Michael Johnson" fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-bold">Michael Johnson</h3>
                  <p className="text-gray-400">Premium User • 1 year</p>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regular Testimonials */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="italic mb-6">
              "As someone with a family history of heart disease, I was looking for a way to monitor my risk factors.
              HeartCare provides exactly what I needed - a clear assessment of my risk and actionable steps to improve."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3 relative">
                <Image src="/contemplative-artist.png" alt="Sarah Thompson" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold">Sarah Thompson</h3>
                <p className="text-sm text-gray-400">Basic User • 8 months</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="italic mb-6">
              "I'm a cardiologist and I recommend HeartCare to many of my patients. It helps them stay engaged with
              their heart health between appointments and gives me valuable data to review during consultations."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3 relative">
                <Image
                  src="/compassionate-doctor-consultation.png"
                  alt="Dr. Robert Chen"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold">Dr. Robert Chen</h3>
                <p className="text-sm text-gray-400">Professional User • 2 years</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
            <div className="flex mb-4">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ))}
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="italic mb-6">
              "The assessment was eye-opening. I had no idea my lifestyle choices were putting me at such high risk. The
              recommendations were practical and helped me make meaningful changes to my diet and exercise routine."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3 relative">
                <Image src="/contemplative-man.png" alt="James Wilson" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold">James Wilson</h3>
                <p className="text-sm text-gray-400">Premium User • 6 months</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
            <div className="flex mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="italic mb-6">
              "I love how easy it is to track my progress over time. Seeing my risk score decrease as I made healthier
              choices was incredibly motivating. The PDF reports are also great for sharing with my doctor."
            </p>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3 relative">
                <Image src="/contemplative-artist.png" alt="Emily Rodriguez" fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-bold">Emily Rodriguez</h3>
                <p className="text-sm text-gray-400">Premium User • 1 year</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Testimonial */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Video Testimonials</h2>
          <div className="aspect-w-16 aspect-h-9 bg-gray-900 border border-gray-800 rounded-lg overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-4">
                  <div className="w-16 h-16 rounded-full bg-red-600/40 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400">
                  Watch Dr. Lisa Martinez discuss how HeartCare has transformed her practice
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="h-48 relative">
                <Image src="/flourishing-health.png" alt="Success Story" fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">From High Risk to Heart Healthy</h3>
                <p className="text-gray-400 mb-4">
                  John's journey from a high-risk assessment to achieving optimal heart health metrics in just 8 months.
                </p>
                <a href="#" className="text-red-500 hover:text-red-400">
                  Read the full story →
                </a>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="h-48 relative">
                <Image
                  src="/placeholder.svg?height=192&width=384&query=family health"
                  alt="Success Story"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">A Family's Health Transformation</h3>
                <p className="text-gray-400 mb-4">
                  How the Martinez family used HeartCare to improve their collective heart health and create lasting
                  habits.
                </p>
                <a href="#" className="text-red-500 hover:text-red-400">
                  Read the full story →
                </a>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
              <div className="h-48 relative">
                <Image
                  src="/placeholder.svg?height=192&width=384&query=doctor patient"
                  alt="Success Story"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Preventive Care Success</h3>
                <p className="text-gray-400 mb-4">
                  How Dr. Williams used HeartCare to help identify and prevent potential heart issues in his patients.
                </p>
                <a href="#" className="text-red-500 hover:text-red-400">
                  Read the full story →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to start your heart health journey?</h2>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their heart health with HeartCare's advanced risk
            assessment tools.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/predict"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Get Your Assessment
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
