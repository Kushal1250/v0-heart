import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Log the error to server console
    console.error("Client error:", data)

    // Here you could store in a database or send to an error tracking service

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in error logging API:", error)
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 })
  }
}
