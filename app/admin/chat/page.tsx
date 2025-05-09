"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Send, User, Clock, MessageSquare, AlertCircle } from "lucide-react"
import { connectSocket, getSocket, type ChatMessage } from "@/lib/socket-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ChatSession {
  id: string
  userName: string
  topic: string
  timestamp: Date
  unread: number
}

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessions, setActiveSessions] = useState<ChatSession[]>([])
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [agentName, setAgentName] = useState("Support Agent")
  const [agentId, setAgentId] = useState(`agent-${Date.now()}`)
  const [connectionError, setConnectionError] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Initialize socket connection
  useEffect(() => {
    setIsConnecting(true)
    const socket = connectSocket()

    // Join as agent
    socket.emit("chat:join-as-agent", {
      agentName,
      agentId,
    })

    // Set up event listeners
    socket.on("chat:message", (message) => {
      // Add message to the appropriate session
      if (message.sessionId === selectedSession) {
        setMessages((prev) => [...prev, message])
      } else {
        // Increment unread count for other sessions
        setSessions((prev) =>
          prev.map((session) =>
            session.id === message.sessionId ? { ...session, unread: (session.unread || 0) + 1 } : session,
          ),
        )
      }
    })

    socket.on("chat:typing", (data) => {
      if (data.user === "user" && data.sessionId === selectedSession) {
        setIsTyping(data.isTyping)
      }
    })

    socket.on("chat:new-session", (data) => {
      const newSession: ChatSession = {
        id: data.sessionId,
        userName: data.userName,
        topic: data.topic,
        timestamp: new Date(data.timestamp),
        unread: 1,
      }

      setSessions((prev) => [newSession, ...prev])
      setActiveSessions((prev) => [newSession, ...prev])
    })

    socket.on("chat:user-left", (data) => {
      // Move session from active to history
      setSessions((prev) => prev.filter((session) => session.id !== data.sessionId))
      setActiveSessions((prev) => prev.filter((session) => session.id !== data.sessionId))

      const session = activeSessions.find((s) => s.id === data.sessionId)
      if (session) {
        setHistorySessions((prev) => [session, ...prev])
      }

      // Clear selected session if it was this one
      if (selectedSession === data.sessionId) {
        setSelectedSession(null)
        setMessages([])
      }
    })

    socket.on("connect", () => {
      setConnectionError(false)
      setIsConnecting(false)
    })

    socket.on("connect_error", () => {
      setConnectionError(true)
      setIsConnecting(false)
    })

    // Load initial sessions
    // In a real app, this would come from the server
    setActiveSessions([
      {
        id: "demo-session-1",
        userName: "John Doe",
        topic: "Heart Health Assessment",
        timestamp: new Date(),
        unread: 2,
      },
      {
        id: "demo-session-2",
        userName: "Jane Smith",
        topic: "Account Issues",
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        unread: 0,
      },
    ])

    setHistorySessions([
      {
        id: "demo-session-3",
        userName: "Robert Johnson",
        topic: "Technical Support",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        unread: 0,
      },
      {
        id: "demo-session-4",
        userName: "Emily Williams",
        topic: "Billing Question",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        unread: 0,
      },
    ])

    setSessions([
      {
        id: "demo-session-1",
        userName: "John Doe",
        topic: "Heart Health Assessment",
        timestamp: new Date(),
        unread: 2,
      },
      {
        id: "demo-session-2",
        userName: "Jane Smith",
        topic: "Account Issues",
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        unread: 0,
      },
    ])

    return () => {
      // Clean up event listeners
      socket.off("chat:message")
      socket.off("chat:typing")
      socket.off("chat:new-session")
      socket.off("chat:user-left")
      socket.off("connect")
      socket.off("connect_error")
    }
  }, [])

  const selectSession = (sessionId: string) => {
    setSelectedSession(sessionId)

    // Clear unread count
    setSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, unread: 0 } : session)))

    setActiveSessions((prev) => prev.map((session) => (session.id === sessionId ? { ...session, unread: 0 } : session)))

    // Join session
    const socket = getSocket()
    socket.emit("chat:join-session", sessionId)

    // Load messages for this session
    // In a real app, this would come from the server
    if (sessionId === "demo-session-1") {
      setMessages([
        {
          id: "1",
          text: "Hello, I have some questions about my heart health assessment results.",
          sender: "user",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          sessionId: "demo-session-1",
        },
        {
          id: "2",
          text: "I'm concerned about my cholesterol levels.",
          sender: "user",
          timestamp: new Date(Date.now() - 4 * 60 * 1000),
          sessionId: "demo-session-1",
        },
      ])
    } else if (sessionId === "demo-session-2") {
      setMessages([
        {
          id: "3",
          text: "Hi, I'm having trouble accessing my account.",
          sender: "user",
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          sessionId: "demo-session-2",
        },
        {
          id: "4",
          text: "I've tried resetting my password but I'm not receiving the email.",
          sender: "user",
          timestamp: new Date(Date.now() - 18 * 60 * 1000),
          sessionId: "demo-session-2",
        },
        {
          id: "5",
          text: "Let me check that for you. Can you confirm the email address you're using?",
          sender: "agent",
          timestamp: new Date(Date.now() - 16 * 60 * 1000),
          sessionId: "demo-session-2",
        },
      ])
    }
  }

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !selectedSession) return

    const socket = getSocket()
    socket.emit("chat:send-message", {
      text: inputValue,
      sender: "agent",
      sessionId: selectedSession,
    })

    setInputValue("")
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)

    // Send typing indicator
    if (selectedSession) {
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

  const formatDate = (date: Date) => {
    if (typeof date === "string") {
      date = new Date(date)
    }

    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    return date.toLocaleDateString()
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
      } else {
        // Re-join as agent
        socket.emit("chat:join-as-agent", {
          agentName,
          agentId,
        })

        // Re-join current session if any
        if (selectedSession) {
          socket.emit("chat:join-session", selectedSession)
        }
      }
    }, 5000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold">Support Chat Dashboard</h1>

        {connectionError && (
          <Alert variant="destructive">
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

        {isConnecting && (
          <Alert>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
            <AlertTitle>Connecting to chat server...</AlertTitle>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Chat Sessions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="active">
                  <TabsList className="w-full">
                    <TabsTrigger value="active" className="flex-1">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1">
                      History
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="p-0">
                    <div className="max-h-[600px] overflow-y-auto">
                      {activeSessions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No active chat sessions</div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {activeSessions.map((session) => (
                            <li
                              key={session.id}
                              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                                selectedSession === session.id ? "bg-gray-100" : ""
                              }`}
                              onClick={() => selectSession(session.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-3">
                                  <div className="bg-red-600 rounded-full p-2">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{session.userName}</h3>
                                    <p className="text-sm text-gray-500 truncate max-w-[180px]">{session.topic}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end">
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(session.timestamp)}
                                  </span>
                                  {session.unread > 0 && <Badge className="bg-red-600 mt-1">{session.unread}</Badge>}
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="history" className="p-0">
                    <div className="max-h-[600px] overflow-y-auto">
                      {historySessions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No chat history</div>
                      ) : (
                        <ul className="divide-y divide-gray-200">
                          {historySessions.map((session) => (
                            <li
                              key={session.id}
                              className="p-4 hover:bg-gray-50 cursor-pointer"
                              onClick={() => selectSession(session.id)}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-start space-x-3">
                                  <div className="bg-gray-400 rounded-full p-2">
                                    <User className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium">{session.userName}</h3>
                                    <p className="text-sm text-gray-500 truncate max-w-[180px]">{session.topic}</p>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500 flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(session.timestamp)}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            {selectedSession ? (
              <Card className="bg-white border-gray-200 shadow-sm h-[700px] flex flex-col">
                <CardHeader className="border-b border-gray-200 bg-gray-50 p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-red-600 rounded-full p-2 mr-3">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {sessions.find((s) => s.id === selectedSession)?.userName || "User"}
                        </CardTitle>
                        <CardDescription>
                          {sessions.find((s) => s.id === selectedSession)?.topic || "Chat session"}
                        </CardDescription>
                      </div>
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === "agent" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`rounded-lg p-3 max-w-[80%] ${
                          msg.sender === "agent" ? "bg-red-600 text-white" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            msg.sender === "agent" ? "text-red-100" : "text-gray-500"
                          }`}
                        >
                          {formatTime(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
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
                      value={inputValue}
                      onChange={handleTyping}
                    />
                    <Button type="submit" className="bg-red-600 hover:bg-red-700">
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </Card>
            ) : (
              <Card className="bg-white border-gray-200 shadow-sm h-[700px] flex items-center justify-center">
                <div className="text-center p-6">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-700">No Chat Selected</h3>
                  <p className="text-gray-500 mt-2">Select a chat session from the list to view the conversation.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
