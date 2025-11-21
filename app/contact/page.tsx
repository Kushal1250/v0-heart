import { Mail, Phone, MapPin, MessageCircle, Send, ArrowRight } from "lucide-react"
import { Breadcrumb } from "@/components/breadcrumb"
import { StructuredData } from "@/lib/structured-data"
import { generateMetadata } from "@/lib/seo-config"
import Link from "next/link"

export const metadata = generateMetadata({
  title: "Contact Us - HeartGuard AI Support & Information",
  description:
    "Get in touch with HeartGuard AI for support, questions, or feedback. Multiple contact options including email, phone, and live chat for heart disease risk assessment help.",
  url: "/contact",
})

export default function ContactPage() {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get detailed help with your account or technical questions",
      contact: "support@heartguard-ai.com",
      availability: "24/7 - Response within 24 hours",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+1 (555) 123-4567",
      availability: "Mon-Fri, 9 AM - 6 PM EST",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant help for quick questions and guidance",
      contact: "Available on website",
      availability: "Mon-Fri, 9 AM - 6 PM EST",
    },
    {
      icon: MapPin,
      title: "Office Location",
      description: "Visit our headquarters for in-person meetings",
      contact: "123 Health Tech Blvd, San Francisco, CA 94105",
      availability: "By appointment only",
    },
  ]

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer: "Click on 'Forgot Password' on the login page and follow the instructions sent to your email address.",
    },
    {
      question: "Is my health data secure?",
      answer: "Yes, we use HIPAA-compliant security measures and enterprise-grade encryption to protect your data.",
    },
    {
      question: "Can I export my health data?",
      answer: "Yes, you can export your data from your dashboard settings. We support PDF and CSV formats.",
    },
    {
      question: "How accurate are the risk predictions?",
      answer:
        "Our AI models achieve clinical-grade accuracy, but results should be discussed with healthcare professionals.",
    },
  ]

  return (
    <>
      <StructuredData
        type="organization"
        data={{
          name: "HeartGuard AI",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+1-555-123-4567",
            contactType: "customer service",
            email: "support@heartguard-ai.com",
            availableLanguage: ["English"],
            areaServed: "Worldwide",
          },
        }}
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <Breadcrumb items={[{ name: "Contact", url: "/contact" }]} />

            <header className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">Contact HeartGuard AI</h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                We're here to help you with your heart health journey. Reach out to our support team for assistance,
                questions, or feedback.
              </p>
            </header>

            {/* Contact Methods */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">Get In Touch</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <method.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">{method.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{method.description}</p>
                    <p className="font-semibold text-foreground mb-2">{method.contact}</p>
                    <p className="text-sm text-gray-500">{method.availability}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Form */}
            <section className="mb-16">
              <div className="bg-gradient-to-r from-primary/5 to-blue-50 p-8 rounded-xl">
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-foreground">Send Us a Message</h2>
                <form className="max-w-2xl mx-auto space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a subject</option>
                      <option value="technical-support">Technical Support</option>
                      <option value="account-help">Account Help</option>
                      <option value="billing">Billing Questions</option>
                      <option value="feedback">Feedback</option>
                      <option value="partnership">Partnership Inquiry</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Please describe your question or concern in detail..."
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center gap-2"
                  >
                    Send Message <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-foreground">
                Frequently Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqItems.map((faq, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-foreground mb-3">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/help"
                  className="text-primary hover:text-primary/80 font-semibold inline-flex items-center gap-2"
                >
                  View All FAQs <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            {/* Additional Support */}
            <section>
              <div className="bg-gray-50 p-8 rounded-xl text-center">
                <h2 className="text-2xl font-bold mb-4 text-foreground">Need Immediate Help?</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  For urgent technical issues or account problems, our WhatsApp support team is available for immediate
                  assistance.
                </p>
                <Link
                  href="/contact/whatsapp-support"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Support
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
