"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, X, Minimize2, Maximize2, User, MessageSquare, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"
import { connectSocket, getSocket, type ChatMessage } from "@/lib/socket-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [agentName, setAgentName] = useState<string | null>(null)
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [showForm, setShowForm] = useState(true)
  const [topic, setTopic] = useState("")
  const [connectionError, setConnectionError] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && isOpen && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping, isOpen, isMinimized])

  // Initialize socket when widget opens
  useEffect(() => {
    if (isOpen && !isMinimized && sessionId) {
      const socket = getSocket()

      // Set up event listeners if not already connected
      if (!socket.hasListeners("chat:message")) {
        socket.on("chat:message", (message) => {
          setMessages((prev) => [...prev, message])
        })

        socket.on("chat:typing", (data) => {
          if (data.user === "agent") {
            setIsTyping(data.isTyping)
          }
        })

        socket.on("chat:agent-joined", (data) => {
          setAgentName(data.agentName)
        })

        socket.on("chat:agent-left", () => {
          setAgentName(null)
        })
      }
    }

    return () => {
      // Clean up if widget is closed
      if (!isOpen) {
        const socket = getSocket()
        socket.off("chat:message")
        socket.off("chat:typing")
        socket.off("chat:agent-joined")
        socket.off("chat:agent-left")
      }
    }
  }, [isOpen, isMinimized, sessionId])

  const startChat = (e: React.FormEvent) => {
    e.preventDefault()
    setIsConnecting(true)

    // Connect to socket
    const socket = connectSocket()

    // Set up session created listener
    socket.on("chat:session-created", (data) => {
      setSessionId(data.sessionId)
      setShowForm(false)
      setIsConnecting(false)
    })

    socket.on("connect_error", () => {
      setConnectionError(true)
      setIsConnecting(false)
    })

    // Join as user
    socket.emit("chat:join-as-user", {
      name: userName,
      email: userEmail,
      topic,
      initialMessage: `Hi, I'd like to discuss ${topic}`,
    })

    // Add initial welcome message
    setMessages([
      {
        id: "welcome",
        text: "Welcome to HeartPredict support! How can we help you today?",
        sender: "agent",
        timestamp: new Date(),
        sessionId: "system",
      },
    ])
  }

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || !sessionId) return

    const socket = getSocket()
    socket.emit("chat:send-message", {
      text: inputValue,
      sender: "user",
      sessionId,
    })

    setInputValue("")
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    // Send typing indicator
    if (sessionId) {
      const socket = getSocket()
      socket.emit("chat:typing", e.target.value.length > 0)
    }
  }

  const formatTime = (date: Date) => {
    if (typeof date === "string") {
      date = new Date(date)
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const closeChat = () => {
    if (sessionId) {
      const socket = getSocket()
      socket.emit("chat:leave")
    }
    setIsOpen(false)
    setMessages([])
    setSessionId(null)
    setAgentName(null)
    setShowForm(true)
  }

  const reconnect = () => {
    setConnectionError(false)
    setIsConnecting(true)
    const socket = connectSocket()

    // Try to reconnect
    setTimeout(() => {
      if (!socket.connected) {
        setConnectionError(true)
        setIsConnecting(false)
      }
    }, 5000)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 p-0 shadow-lg bg-red-600 hover:bg-red-700 z-50"
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <Card
      className={`fixed bottom-6 right-6 w-80 md:w-96 shadow-lg border-gray-200 bg-white z-50 transition-all duration-300 ${
        isMinimized ? "h-14" : "h-[500px] max-h-[80vh]"
      }`}
    >
      <CardHeader className="p-3 border-b border-gray-200 bg-gray-50 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 mr-2 bg-red-600">
            <User className="h-4 w-4 text-white" />
          </Avatar>
          <div>
            <h3 className="text-sm font-medium">
              HeartPredict Support
              {agentName && !isMinimized && <span className="text-xs font-normal ml-2">({agentName})</span>}
            </h3>
            <p className="text-xs text-gray-500">{agentName ? "Online" : "Connecting..."}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeChat}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="p-3 overflow-y-auto flex-grow h-[calc(100%-110px)]">
            {connectionError && (
              <Alert variant="destructive" className="mb-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs flex justify-between items-center">
                  Connection error
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={reconnect}>
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {showForm ? (
              <form onSubmit={startChat} className="space-y-3 py-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    placeholder="Your name"
                    className="bg-white border-gray-300 h-8 text-sm"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="Your email"
                    className="bg-white border-gray-300 h-8 text-sm"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Topic</label>
                  <Input
                    placeholder="What would you like to discuss?"
                    className="bg-white border-gray-300 h-8 text-sm"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 h-8 text-sm"
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Connecting...
                    </>
                  ) : (
                    "Start Chat"
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 text-right ${
                          message.sender === "user" ? "text-red-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-gray-800">
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
              </div>
            )}
          </CardContent>

          {!showForm && (
            <CardFooter className="p-3 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={handleTyping}
                  className="flex-grow bg-white border-gray-300 h-9"
                />
                <Button type="submit" size="icon" className="bg-red-600 hover:bg-red-700 h-9 w-9">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  )
}
