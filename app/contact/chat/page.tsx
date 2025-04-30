"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, PanelRightOpen, Minimize2, X } from "lucide-react"

export default function LiveChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "system",
      text: "Welcome to HeartCare live chat support. How can we help you today?",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [agentTyping, setAgentTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessage("")

    // Simulate agent typing
    setAgentTyping(true)

    // Simulate agent response after a delay
    setTimeout(
      () => {
        setAgentTyping(false)

        // Simulate agent response
        const agentMessage = {
          id: messages.length + 2,
          sender: "agent",
          text: getAutoResponse(newMessage),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }

        setMessages((prev) => [...prev, agentMessage])
      },
      1500 + Math.random() * 1000,
    )
  }

  const getAutoResponse = (message: string) => {
    const lowerMsg = message.toLowerCase()

    if (lowerMsg.includes("hello") || lowerMsg.includes("hi") || lowerMsg.includes("hey")) {
      return "Hello there! How can I assist you with HeartCare today?"
    } else if (lowerMsg.includes("help")) {
      return "I'd be happy to help. What specific aspect of HeartCare do you need assistance with?"
    } else if (lowerMsg.includes("predict") || lowerMsg.includes("assessment") || lowerMsg.includes("risk")) {
      return "Our prediction tool uses advanced algorithms to assess your heart disease risk based on various health parameters. You can access it from the 'Predict' section of our platform."
    } else if (lowerMsg.includes("data") || lowerMsg.includes("privacy")) {
      return "We take data privacy very seriously. All your health information is encrypted and stored securely in compliance with HIPAA regulations. You can read more in our Privacy Policy."
    } else if (lowerMsg.includes("doctor") || lowerMsg.includes("medical") || lowerMsg.includes("healthcare")) {
      return "HeartCare is not a replacement for professional medical advice. We recommend consulting with your healthcare provider regarding your results and any health concerns."
    } else {
      return "Thank you for your message. Our support team will analyze your query and get back to you shortly. Is there anything else I can help with in the meantime?"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleClose = () => {
    window.close()
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-4 right-4 bg-blue-600 text-white rounded-full p-4 shadow-lg cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <PanelRightOpen className="h-6 w-6" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <h1 className="font-semibold">HeartCare Live Support</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-blue-700"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.sender === "user" ? "flex justify-end" : "flex justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : message.sender === "system"
                    ? "bg-gray-200 text-gray-800 rounded-tl-none"
                    : "bg-green-600 text-white rounded-tl-none"
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs mt-1 opacity-70">{message.time}</p>
            </div>
          </div>
        ))}

        {agentTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-tl-none max-w-[80%]">
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message here..."
            rows={1}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button onClick={handleSendMessage} disabled={newMessage.trim() === ""}>
            Send
          </Button>
        </div>
      </div>
    </div>
  )
}
