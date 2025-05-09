import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Simple in-memory message storage for fallback mode
const fallbackMessages = new Map<string, any[]>()

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { text, sender, sessionId } = data

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Create a message
    const messageId = uuidv4()
    const timestamp = new Date()

    const message = {
      id: messageId,
      text,
      sender,
      timestamp,
      sessionId,
    }

    // Store in our fallback system
    if (!fallbackMessages.has(sessionId)) {
      fallbackMessages.set(sessionId, [])
    }
    fallbackMessages.get(sessionId)?.push(message)

    // Generate an auto-response for test purposes
    setTimeout(() => {
      const responses = [
        "Thank you for your message. Our team will get back to you shortly.",
        "I've received your message and will process it as soon as possible.",
        "Thanks for contacting us. We're experiencing high volume but will respond soon.",
        "Your message has been received. A support agent will contact you shortly.",
      ]

      const autoMessage = {
        id: uuidv4(),
        text: responses[Math.floor(Math.random() * responses.length)],
        sender: "agent",
        timestamp: new Date(),
        sessionId,
      }

      fallbackMessages.get(sessionId)?.push(autoMessage)
    }, 2000)

    return NextResponse.json({ success: true, message })
  } catch (error) {
    console.error("Error in chat message API:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get("sessionId")

  if (!sessionId) {
    return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
  }

  // Return messages for the session
  const messages = fallbackMessages.get(sessionId) || []
  return NextResponse.json({ messages })
}
