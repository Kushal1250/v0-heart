import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

// Define types
interface User {
  id: string
  email: string
  role: string
}

interface AuthResult {
  isAuthenticated: boolean
  user?: User
  error?: string
}

interface TokenPayload {
  userId: string
  email: string
  role: string
  exp?: number
}

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET_KEY || "fallback-secret-key-for-development"

// Generate a session token
export function generateSessionToken(payload: TokenPayload): string {
  // Set token expiry to 24 hours
  const expiresIn = 24 * 60 * 60

  return jwt.sign({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresIn }, JWT_SECRET)
}

// Verify authentication from request
export async function verifyAuth(request: Request | NextRequest): Promise<AuthResult> {
