"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, ArrowLeft, Send, User } from "lucide-react"

// Define message type
type Message = {
  id: string
  content: string
  sender: "user" | "agent"
  timestamp: Date
}

// Define automated responses
const automatedResponses = [
  "Thank you for your question. I'm looking into this for you now.",
  "I understand your concern about heart health. Let me provide some information that might help.",
  "That's a great question about our prediction model. Here's what I can tell you...",
  "I'd be happy to explain how our heart disease prediction works in more detail.",
  "Based on what you've shared, I recommend checking out our FAQ section for more information.",
  "Would you like me to connect you with one of our healthcare specialists for more detailed guidance?",
  "Our HeartPredict model uses multiple factors to assess risk. Let me explain how it works.",
  "I appreciate your patience. Let me check our resources to give you the most accurate information.",
]

export default function LiveChatPage() {
  const [chatStarted, setChatStarted] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState("")
  const [initialMessage, setInitialMessage] = useState("")
  const [currentMessage, setCurrentMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const startChat = (e: React.FormEvent) => {
    e.preventDefault()
    setChatStarted(true)

    // Add initial welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hello ${name}! Welcome to HeartPredict support. How can I help you with "${topic}" today?`,
      sender: "agent",
      timestamp: new Date(),
    }

    setMessages([welcomeMessage])

    // Add user's initial message after a short delay
    setTimeout(() => {
      const userInitialMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: initialMessage,
        sender: "user",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userInitialMessage])

      // Show typing indicator
      setIsTyping(true)

      // Respond to initial message within 25 seconds (actually within 3 seconds for better UX)
      setTimeout(() => {
        setIsTyping(false)

        const agentResponse: Message = {
          id: (Date.now() + 2).toString(),
          content:
            "Thank you for providing that information. Let me look into this for you. I'll have an answer shortly.",
          sender: "agent",
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, agentResponse])
      }, 3000)
    }, 1000)
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentMessage.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setCurrentMessage("")

    // Show typing indicator
    setIsTyping(true)

    // Respond within 25 seconds (using random time between 2-5 seconds for better UX)
    const responseTime = Math.floor(Math.random() * 3000) + 2000 // 2-5 seconds

    setTimeout(() => {
      setIsTyping(false)

      // Select a random response
      const randomResponse = automatedResponses[Math.floor(Math.random() * automatedResponses.length)]

      const agentResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: "agent",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, agentResponse])
    }, responseTime)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Button variant="ghost" className="mr-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Live Chat Support</h1>
        </div>

        {!chatStarted ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Start a Live Chat</CardTitle>
              <CardDescription>Please provide some information to help us assist you better</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={startChat} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="bg-gray-800 border-gray-700"
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
                    className="bg-gray-800 border-gray-700"
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
                    className="bg-gray-800 border-gray-700"
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
                    className="bg-gray-800 border-gray-700"
                    value={initialMessage}
                    onChange={(e) => setInitialMessage(e.target.value)}
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
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="bg-gray-900 border-gray-800 h-[600px] flex flex-col">
                <CardHeader className="border-b border-gray-800 bg-gray-800">
                  <div className="flex items-center">
                    <div className="bg-red-600 rounded-full p-2 mr-3">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Chat with Support</CardTitle>
                      <CardDescription>We typically respond in under 25 seconds</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex justify-${message.sender === "user" ? "end" : "start"}`}>
                      <div
                        className={`rounded-lg p-3 max-w-[80%] ${
                          message.sender === "user" ? "bg-red-600" : "bg-gray-800"
                        }`}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender === "user" ? "text-red-200" : "text-gray-400"
                          } text-right`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800 rounded-lg p-3 max-w-[80%]">
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

                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t border-gray-800">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      className="bg-gray-800 border-gray-700"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                    />
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            </div>

            <div>
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle>Chat Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Name</h3>
                    <p>{name}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Email</h3>
                    <p>{email}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Topic</h3>
                    <p>{topic}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Chat Started</h3>
                    <p>{new Date().toLocaleTimeString()}</p>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full" onClick={() => setChatStarted(false)}>
                      End Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800 mt-6">
                <CardHeader>
                  <CardTitle>Support Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <a href="/product/faq" className="text-blue-400 hover:underline">
                        Frequently Asked Questions
                      </a>
                    </li>
                    <li>
                      <a href="/product/features" className="text-blue-400 hover:underline">
                        Product Features
                      </a>
                    </li>
                    <li>
                      <a href="/contact/whatsapp-support" className="text-blue-400 hover:underline">
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
