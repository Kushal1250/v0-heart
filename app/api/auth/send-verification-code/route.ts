import { NextResponse } from "next/server"
import { getUserByEmail, getUserByPhone } from "@/lib/db"
import { sendVerificationCode } from "@/lib/auth-utils"
import { isValidEmail } from "@/lib/client-validation"

export async function POST(request: Request) {
  try {
    const { email, phone, method, isLoggedIn = false } = await request.json()

    console.log("Received verification code request:", { email, phone, method, isLoggedIn })

    // Determine the identifier and verification method
    let identifier: string
    let verificationMethod: "email" | "sms"

    if (email) {
      identifier = email
      verificationMethod = "email"

      // Validate email format
      if (!isValidEmail(email)) {
        console.error("Invalid email format:", email)
        return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
      }
    } else if (phone) {
      identifier = phone
      verificationMethod = "sms"

      // Basic phone validation
      if (!phone.startsWith("+") || phone.length < 10) {
        console.error("Invalid phone format:", phone)
        return NextResponse.json(
          { message: "Invalid phone number format. Please include country code (e.g., +1)" },
          { status: 400 },
        )
      }
    } else {
      console.error("No email or phone provided")
      return NextResponse.json({ message: "Email or phone number is required" }, { status: 400 })
    }

    console.log(`Using ${verificationMethod} verification with identifier: ${identifier}`)

    // If not logged in, check if user exists (for password reset)
    if (!isLoggedIn) {
      let user = null

      if (verificationMethod === "email") {
        user = await getUserByEmail(identifier)
      } else {
        user = await getUserByPhone(identifier)
      }

      // For security reasons, don't reveal if user exists or not
      if (!user) {
        console.log(`User not found for ${verificationMethod} ${identifier}, but returning success for security`)
        // Return success even if user doesn't exist (security best practice)
        return NextResponse.json({
          success: true,
          message: `If an account exists, a verification code has been sent to your ${verificationMethod === "email" ? "email" : "phone"}`,
        })
      }
    }

    // Send verification code
    const result = await sendVerificationCode(identifier, verificationMethod)

    console.log("Verification code send result:", result)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      method: verificationMethod,
      previewUrl: result.previewUrl,
    })
  } catch (error) {
    console.error("Error sending verification code:", error)
    return NextResponse.json({ message: "An error occurred while sending the verification code" }, { status: 500 })
  }
}
