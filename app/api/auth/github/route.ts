import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID

  if (!clientId) {
    return NextResponse.json({ message: "OAuth configuration missing" }, { status: 500 })
  }

  // Generate state for CSRF protection
  const state = uuidv4()

  // Store state in cookie for validation
  const response = NextResponse.redirect(
    `https://github.com/login/oauth/authorize?client_id=${clientId}&state=${state}&scope=user:email`,
  )

  // Set state cookie to verify on callback
  response.cookies.set({
    name: "oauth_state",
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return response
}
