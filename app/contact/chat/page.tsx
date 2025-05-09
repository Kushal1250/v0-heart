"use client"

import type React from "react"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MessageSquare, ArrowLeft, Send, User, AlertCircle, RefreshCw } from "lucide-react"
import { connectSocket, getSocket, type ChatMessage, sendMessageFallback } from "@/lib/socket-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

export default function LiveChatPage() {
  const router = useRouter()
  const [chatStarted, setChatStarted] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState("")
  const [message, setMessage] = useState("")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [userMessage, setUserMessage] = useState("")
  const [isAgentTyping, setIsAgentTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState<string | null>(null)
  const [connectionError, setConnectionError] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [useFallbackMode, setUseFallbackMode] = useState(false)
  const [fallbackPollingInterval, setFallbackPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages, isAgentTyping])

  // Initialize socket connection
  useEffect(() => {
    if (chatStarted && !sessionId) {
      setIsConnecting(true)

      // First try real-time WebSocket connection
      const socket = connectSocket()

      // Set a timeout to detect if connection is taking too long
      const connectionTimeout = setTimeout(() => {
        if (!sessionId) {
          console.log("Connection taking too long, switching to fallback mode")
          setUseFallbackMode(true)
          setConnectionError(false)
          setIsConnecting(false)

          // Generate a fallback session ID
          const fallbackId = `fallback-${Date.now()}`
          setSessionId(fallbackId)

          // Add initial message
          const initialMessage = {
            id: `msg-${Date.now()}`,
            text: message,
            sender: "user" as const,
            timestamp: new Date(),
            sessionId: fallbackId,
          }

          setChatMessages([initialMessage])

          // Setup polling for fallback mode messages
          const interval = setInterval(() => {
            fetchFallbackMessages(fallbackId)
          }, 3000)

          setFallbackPollingInterval(interval)
        }
      }, 5000) // Wait 5 seconds before switching to fallback

      // Set up event listeners
      socket.on("chat:message", (message) => {
        setChatMessages((prev) => [...prev, message])
      })

      socket.on("chat:typing", (data) => {
        if (data.user === "agent") {
          setIsAgentTyping(data.isTyping)
        }
      })

      socket.on("chat:agent-joined", (data) => {
        setAgentName(data.agentName)
      })

      socket.on("chat:agent-left", () => {
        setAgentName(null)
      })

      socket.on("chat:session-created", (data) => {
        clearTimeout(connectionTimeout)
        setSessionId(data.sessionId)
        setIsConnecting(false)
      })

      socket.on("connect_error", () => {
        console.error("Socket connection error")
        // Don't set error immediately, let the timeout handle fallback
      })

      socket.on("connection:established", () => {
        console.log("Socket connection established")
      })

      return () => {
        // Clean up event listeners and intervals
        clearTimeout(connectionTimeout)
        if (fallbackPollingInterval) {
          clearInterval(fallbackPollingInterval)
        }

        socket.off("chat:message")
        socket.off("chat:typing")
        socket.off("chat:agent-joined")
        socket.off("chat:agent-left")
        socket.off("chat:session-created")
        socket.off("connect_error")
        socket.off("connection:established")
      }
    }

    return () => {
      if (fallbackPollingInterval) {
        clearInterval(fallbackPollingInterval)
      }
    }
  }, [chatStarted, sessionId, message, fallbackPollingInterval])

  // Fetch messages for fallback mode
  const fetchFallbackMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/message?sessionId=${sessionId}`)
      const data = await response.json()

      if (data.messages && data.messages.length > 0) {
        setChatMessages(data.messages)
      }
    } catch (error) {
      console.error("Failed to fetch fallback messages:", error)
    }
  }

  const startChat = (e: FormEvent) => {
    e.preventDefault()
    setChatStarted(true)

    // Real-time connection will be initialized in the useEffect above
  }

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!userMessage.trim() || !sessionId) return

    if (useFallbackMode) {
      // Use fallback REST API
      try {
        const newMessage = {
          text: userMessage,
          sender: "user" as const,
          sessionId,
        }

        // Optimistically add message to UI
        const optimisticMessage = {
          id: `msg-${Date.now()}`,
          text: userMessage,
          sender: "user" as const,
          timestamp: new Date(),
          sessionId,
        }

        setChatMessages((prev) => [...prev, optimisticMessage])
        setUserMessage("")

        // Send via REST API
        await sendMessageFallback(newMessage)
      } catch (error) {
        console.error("Failed to send message in fallback mode:", error)
      }
    } else {
      // Use WebSocket
      try {
        const socket = getSocket()
        socket.emit("chat:send-message", {
          text: userMessage,
          sender: "user",
          sessionId,
        })

        setUserMessage("")
      } catch (error) {
        console.error("Failed to send message via WebSocket:", error)

        // Switch to fallback mode if WebSocket fails
        setUseFallbackMode(true)

        // Resend the message using fallback
        sendMessageFallback({
          text: userMessage,
          sender: "user",
          sessionId,
        })

        setUserMessage("")
      }
    }
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(e.target.value)

    // Send typing indicator only in WebSocket mode
    if (!useFallbackMode && sessionId) {
      try {
        const socket = getSocket()
        socket.emit("chat:typing", e.target.value.length > 0)
      } catch (error) {
        // Silently fail for typing events
        console.error("Failed to send typing indicator:", error)
      }
    }
  }

  const endChat = () => {
    if (!useFallbackMode) {
      try {
        const socket = getSocket()
        socket.emit("chat:leave")
      } catch (error) {
        console.error("Failed to leave chat properly:", error)
      }
    }

    // Clear polling interval for fallback mode
    if (fallbackPollingInterval) {
      clearInterval(fallbackPollingInterval)
      setFallbackPollingInterval(null)
    }

    setChatStarted(false)
    setChatMessages([])
    setSessionId(null)
    setAgentName(null)
    setUseFallbackMode(false)
  }

  const formatTime = (date: Date) => {
    if (typeof date === "string") {
      date = new Date(date)
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const reconnect = () => {
    setConnectionError(false)
    setIsConnecting(true)
    setUseFallbackMode(false)

    // Reload the page to reset all state and connections
    router.refresh()
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

        {useFallbackMode && (
          <Alert variant="warning" className="mb-6 bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertTitle className="text-yellow-700">Using Basic Chat Mode</AlertTitle>
            <AlertDescription className="text-yellow-600">
              Real-time chat is unavailable. Using basic mode instead.
              <Button
                variant="outline"
                size="sm"
                className="ml-4 border-yellow-300 text-yellow-700"
                onClick={reconnect}
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Try Real-Time
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {connectionError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to connect to chat server. Please try again.
              <Button variant="outline" size="sm" className="ml-4" onClick={reconnect}>
                Reconnect
              </Button>
            </AlertDescription>
          </Alert>
        )}

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

                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Start Chat
                    </>
                  )}
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
                      <CardTitle className="text-lg">
                        Chat with Support
                        {agentName && <span className="text-sm font-normal ml-2">({agentName})</span>}
                      </CardTitle>
                      <CardDescription>
                        {useFallbackMode
                          ? "Basic chat mode active"
                          : agentName
                            ? "Agent is online and responding to your questions"
                            : "We'll connect you with an agent shortly"}
                      </CardDescription>
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
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isAgentTyping && !useFallbackMode && (
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
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      className="bg-white border-gray-300"
                      value={userMessage}
                      onChange={handleTyping}
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

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Chat Mode</h3>
                    <p>{useFallbackMode ? "Basic Mode" : "Real-Time"}</p>
                  </div>

                  <div className="pt-4">
                    <Button variant="outline" className="w-full" onClick={endChat}>
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
