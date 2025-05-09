import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET_KEY || "your-fallback-secret-key"

export async function verifyJwtToken(token: string): Promise<any> {
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    return payload
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}
