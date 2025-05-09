import { NextResponse } from "next/server"
import { setupChatSystem } from "@/scripts/setup-chat-system"

export async function POST() {
  try {
    const result = await setupChatSystem()

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message })
    } else {
      return NextResponse.json({ success: false, message: result.message, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in setup-chat-system route:", error)
    return NextResponse.json({ success: false, message: "Failed to set up chat system", error }, { status: 500 })
  }
}
