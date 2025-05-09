"use client"

import { useState, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, ArrowLeft, Send, User } from "lucide-react"

export default function LiveChatPage() {
  const [chatStarted, setChatStarted] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState("")
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<Array<{ text: string; sender: "user" | "agent"; time: string }>>([])
  const [userMessage, setUserMessage] = useState("")
  const [isAgentTyping, setIsAgentTyping] = useState(false)

  const startChat = (e: FormEvent) => {
    e.preventDefault()

    // Initialize chat with user's initial message
    const initialMessages = [
      {
        text: `Hello ${name}! Welcome to HeartPredict support. How can I help you with "${topic}" today?`,
        sender: "agent" as const,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
      {
        text: message,
        sender: "user" as const,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]

    setChatMessages(initialMessages)
    setChatStarted(true)

    // Simulate agent typing and response
    simulateAgentResponse(
      "Thank you for providing that information. Let me look into this for you. I'll have an answer shortly.",
    )
  }

  const sendMessage = (e: FormEvent) => {
    e.preventDefault()
    if (!userMessage.trim()) return

    // Add user message
    const newUserMessage = {
      text: userMessage,
      sender: "user" as const,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setChatMessages((prev) => [...prev, newUserMessage])
    setUserMessage("")

    // Simulate agent response
    const responses = [
      "I understand your concern. Let me help you with that.",
      "Thank you for providing that information. Let me check our resources.",
      "That's a great question about heart health. Here's what I can tell you...",
      "I'd be happy to explain how our prediction model works.",
      "Would you like me to connect you with one of our healthcare specialists for more detailed information?",
    ]

    simulateAgentResponse(responses[Math.floor(Math.random() * responses.length)])
  }

  const simulateAgentResponse = (responseText: string) => {
    setIsAgentTyping(true)

    // Simulate typing delay (1.5-3 seconds)
    const typingDelay = 1500 + Math.random() * 1500

    setTimeout(() => {
      setIsAgentTyping(false)

      const agentResponse = {
        text: responseText,
        sender: "agent" as const,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setChatMessages((prev) => [...prev, agentResponse])
    }, typingDelay)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6 md:mb-8">
          <Button variant="ghost" className="mr-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Live Chat Support</h1>
        </div>

        {!chatStarted ? (
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle>Start a Live Chat</CardTitle>
              <CardDescription>Please provide some information to help us assist you better</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={startChat} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="bg-white border-gray-300"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Your email"
                    className="bg-white border-gray-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    placeholder="What would you like to discuss?"
                    className="bg-white border-gray-300"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Initial Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your question or issue"
                    rows={4}
                    className="bg-white border-gray-300"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Start Chat
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <Card className="bg-white border-gray-200 shadow-sm h-[500px] md:h-[600px] flex flex-col">
                <CardHeader className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center">
                    <div className="bg-red-600 rounded-full p-2 mr-3">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Chat with Support</CardTitle>
                      <CardDescription>We typically respond in under 2 minutes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`rounded-lg p-3 max-w-[80%] ${
                          msg.sender === "user" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            msg.sender === "user" ? "text-red-100" : "text-gray-500"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isAgentTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      className="bg-white border-gray-300"
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                    />
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>

            <div>
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Chat Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Name</h3>
                    <p>{name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p>{email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Topic</h3>
                    <p>{topic}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Chat Started</h3>
                    <p>{new Date().toLocaleTimeString()}</p>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full" onClick={() => setChatStarted(false)}>
                      End Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-gray-200 shadow-sm mt-4 md:mt-6">
                <CardHeader>
                  <CardTitle>Support Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <a href="/product/faq" className="text-blue-600 hover:underline">
                        Frequently Asked Questions
                      </a>
                    </li>
                    <li>
                      <a href="/product/features" className="text-blue-600 hover:underline">
                        Product Features
                      </a>
                    </li>
                    <li>
                      <a href="/contact/whatsapp-support" className="text-blue-600 hover:underline">
                        WhatsApp Support
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
