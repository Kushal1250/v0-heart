import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

// Database connection
const sql = neon(process.env.DATABASE_URL!)

// Facebook app secret for verification
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_CLIENT_SECRET

/**
 * Verify that the request is coming from Facebook
 * @param request The incoming request
 * @returns Boolean indicating if the request is valid
 */
function verifyFacebookRequest(request: NextRequest): boolean {
  try {
    // Get the signed request from the body
    const body = request.body
    if (!body) return false

    // Parse the signed request
    const signedRequest = request.nextUrl.searchParams.get("signed_request")
    if (!signedRequest) return false

    // Split the signed request into signature and payload
    const [encodedSignature, payload] = signedRequest.split(".")

    // Decode the signature and payload
    const signature = Buffer.from(encodedSignature, "base64").toString("hex")
    const data = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"))

    // Verify the signature
    const expectedSignature = crypto.createHmac("sha256", FACEBOOK_APP_SECRET!).update(payload).digest("hex")

    // Check if the signatures match
    const isValid = signature === expectedSignature

    // Log verification result (for debugging)
    console.log("Facebook data deletion request verification:", isValid ? "Valid" : "Invalid")

    return isValid
  } catch (error) {
    console.error("Error verifying Facebook request:", error)
    return false
  }
}

/**
 * Delete user data associated with a Facebook user ID
 * @param userId Facebook user ID
 * @returns Success status
 */
async function deleteUserData(userId: string): Promise<boolean> {
  try {
    console.log(`Deleting data for Facebook user ID: ${userId}`)

    // Find the user by Facebook provider ID
    const users = await sql`
      SELECT id FROM users 
      WHERE provider = 'facebook' AND provider_id = ${userId}
    `

    if (users.length === 0) {
      console.log(`No user found with Facebook ID: ${userId}`)
      return true // Consider it a success if no user is found
    }

    const user = users[0]
    console.log(`Found user with ID: ${user.id}, proceeding with deletion`)

    // Delete user predictions
    await sql`DELETE FROM predictions WHERE user_id = ${user.id}`
    console.log(`Deleted predictions for user: ${user.id}`)

    // Delete user sessions
    await sql`DELETE FROM sessions WHERE user_id = ${user.id}`
    console.log(`Deleted sessions for user: ${user.id}`)

    // Delete password reset tokens
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${user.id}`
    console.log(`Deleted password reset tokens for user: ${user.id}`)

    // Delete verification codes
    await sql`DELETE FROM verification_codes WHERE user_id = ${user.id}`
    console.log(`Deleted verification codes for user: ${user.id}`)

    // Finally, delete the user
    await sql`DELETE FROM users WHERE id = ${user.id}`
    console.log(`Deleted user: ${user.id}`)

    return true
  } catch (error) {
    console.error("Error deleting user data:", error)
    return false
  }
}

/**
 * Handle Facebook data deletion requests
 */
export async function POST(request: NextRequest) {
  try {
    console.log("Received Facebook data deletion request")

    // Verify the request is coming from Facebook
    if (!verifyFacebookRequest(request)) {
      console.error("Invalid Facebook data deletion request")
      return NextResponse.json({ success: false, error: "Invalid request signature" }, { status: 400 })
    }

    // Parse the request body
    const body = await request.json()
    const userId = body.user_id

    if (!userId) {
      console.error("Missing user_id in Facebook data deletion request")
      return NextResponse.json({ success: false, error: "Missing user_id" }, { status: 400 })
    }

    // Delete the user data
    const success = await deleteUserData(userId)

    if (success) {
      // Return confirmation URL as required by Facebook
      const confirmationCode = crypto.randomBytes(16).toString("hex")
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const confirmationUrl = `${baseUrl}/api/auth/facebook-data-deletion/confirm?code=${confirmationCode}`

      return NextResponse.json({
        url: confirmationUrl,
        confirmation_code: confirmationCode,
      })
    } else {
      return NextResponse.json({ success: false, error: "Failed to delete user data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing Facebook data deletion request:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

/**
 * Handle GET requests to the data deletion endpoint
 * This is used for Facebook's verification
 */
export async function GET() {
  return NextResponse.json({
    status: "ready",
    message: "Facebook Data Deletion Callback URL is active",
  })
}
