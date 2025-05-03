import { Phone, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { LiveChatWidget } from "@/components/live-chat-widget"

export default function WhatsAppSupportPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">WhatsApp Support</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Get instant help and support through our WhatsApp channel
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-green-900/30 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Send a Message</h3>
                  <p className="text-gray-400">
                    Add our support number to your contacts and send us a message through WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-green-900/30 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Quick Response</h3>
                  <p className="text-gray-400">
                    Our support team will respond to your query within 15 minutes during business hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-green-900/30 p-3 rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">Get Solutions</h3>
                  <p className="text-gray-400">
                    Receive personalized assistance for your questions about HeartCare features and services.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                Support Hours
              </h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 8:00 PM IST</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 6:00 PM IST</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Contact via WhatsApp</CardTitle>
                <CardDescription>Send us a message for quick support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-center gap-3 p-4 bg-green-900/20 rounded-lg border border-green-900/30">
                    <Phone className="h-6 w-6 text-green-500" />
                    <span className="text-xl font-semibold">+91 (901) 626-1380</span>
                  </div>

                  <div className="flex justify-center">
                    <Button className="bg-green-600 hover:bg-green-700 w-full py-6 text-lg">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Open WhatsApp
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-400">
                    <p>Or scan the QR code with your phone camera</p>
                    <div className="mt-4 mx-auto">
                      <Image
                        src="/whatsapp-qr-code.png"
                        alt="WhatsApp QR Code"
                        width={180}
                        height={180}
                        className="mx-auto bg-white p-2 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 bg-yellow-900/20 border border-yellow-900/30 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-500 mb-1">Important Note</h4>
                  <p className="text-sm text-gray-400">
                    Our WhatsApp support is for general inquiries and technical assistance only. For medical
                    emergencies, please contact your healthcare provider or emergency services immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">What types of issues can I get help with?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Our WhatsApp support can help with account issues, feature questions, technical problems, data
                  interpretation assistance, and general inquiries about HeartCare services.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">How quickly will I receive a response?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  During business hours, we aim to respond within 15 minutes. Outside of business hours, you may
                  experience longer wait times, but we'll get back to you as soon as possible.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Is WhatsApp support available in multiple languages?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Yes, our WhatsApp support is available in English, Hindi, Spanish, and French. Please specify your
                  preferred language when you first contact us.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Is my information secure when using WhatsApp support?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Yes, WhatsApp uses end-to-end encryption. However, we recommend not sharing sensitive medical
                  information or personal identifiers through WhatsApp. Our support team can guide you to more secure
                  channels if needed.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Other Ways to Contact Us</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Email Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-2">For detailed inquiries and documentation</p>
                <a href="mailto:heartguide108@gmail.com" className="text-blue-400 hover:underline">
                  heartguide108@gmail.com
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Live Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-2">For immediate assistance on our website</p>
                <a href="/contact/chat" className="text-blue-400 hover:underline flex items-center">
                  <span>Start Live Chat</span>
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-green-600 text-white rounded-full">Active</span>
                </a>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Phone Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 mb-2">For urgent matters requiring voice communication</p>
                <a href="tel:+919016261380" className="text-blue-400 hover:underline">
                  +91 (901) 626-1380
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Contact Form</h2>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
              <CardDescription>We'll respond via email or WhatsApp based on your preference</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your name" className="bg-gray-800 border-gray-700" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="Your email" className="bg-gray-800 border-gray-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                  <Input
                    id="whatsapp"
                    placeholder="Your WhatsApp number with country code"
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" placeholder="Subject of your inquiry" className="bg-gray-800 border-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help you?"
                    rows={5}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="flex justify-center">
                  <Button className="bg-red-600 hover:bg-red-700 px-8 py-6">Submit</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <LiveChatWidget />
      </div>
    </div>
  )
}
