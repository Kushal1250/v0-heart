import { io, type Socket } from "socket.io-client"

// Types for our chat messages
export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "agent"
  timestamp: Date
  userId?: string
  agentId?: string
  sessionId: string
}

// Types for our chat events
export interface ServerToClientEvents {
  "chat:message": (message: ChatMessage) => void
  "chat:typing": (data: { isTyping: boolean; user: string }) => void
  "chat:agent-joined": (data: { agentName: string; agentId: string }) => void
  "chat:agent-left": (data: { agentId: string }) => void
  "chat:session-created": (data: { sessionId: string }) => void
  "chat:error": (data: { message: string }) => void
  "connection:established": (data: { socketId: string }) => void
}

export interface ClientToServerEvents {
  "chat:send-message": (message: Omit<ChatMessage, "id" | "timestamp">) => void
  "chat:typing": (isTyping: boolean) => void
  "chat:join-as-user": (data: { name: string; email: string; topic: string; initialMessage: string }) => void
  "chat:join-as-agent": (data: { agentName: string; agentId: string }) => void
  "chat:leave": () => void
}

// Singleton pattern for socket connection
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
let connectionAttempts = 0
const MAX_ATTEMPTS = 3

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socket) {
    // Use the correct Socket.IO URL based on the environment
    const socketUrl =
      typeof window !== "undefined"
        ? window.location.origin // Use current origin in browser
        : process.env.NEXT_PUBLIC_SOCKET_URL || "https://heartgudie3.vercel.app"

    // Create socket connection with more permissive settings
    socket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: false,
      path: "/api/socket",
      transports: ["websocket", "polling"],
      withCredentials: false,
    })

    // Set up event listeners for connection status
    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id)
      connectionAttempts = 0
    })

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason)
    })

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error)

      // If we've tried multiple times and still can't connect, use a fallback mechanism
      connectionAttempts++
      if (connectionAttempts >= MAX_ATTEMPTS) {
        console.log("Maximum connection attempts reached, using fallback mode")
        // You could implement a fallback mechanism here (like polling or fake responses)
      }
    })

    socket.io.on("reconnect", (attempt) => {
      console.log("Socket reconnected after", attempt, "attempts")
    })

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log("Socket reconnection attempt:", attempt)
    })

    socket.io.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error)
    })

    socket.io.on("reconnect_failed", () => {
      console.error("Socket reconnection failed")
    })
  }

  return socket
}

export const connectSocket = () => {
  const socket = getSocket()
  if (socket && !socket.connected) {
    socket.connect()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect()
  }
}

// Fallback mechanism for when real-time connection fails
export const sendMessageFallback = async (message: {
  text: string
  sender: "user"
  sessionId: string
}) => {
  try {
    // Attempt to send via REST API instead of WebSocket
    const response = await fetch("/api/chat/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    return response.json()
  } catch (error) {
    console.error("Fallback message sending failed:", error)
    return null
  }
}
