import { NextResponse } from "next/server"
import { getUserByEmail, createVerificationCode } from "@/lib/db"
import { sendEmail } from "@/lib/email-utils"
import { logError } from "@/lib/error-logger"
import { isValidEmail } from "@/lib/auth-utils"

// Generate a random verification code
function generateVerificationCode(): string {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
  try {
    const { identifier, method = "email" } = await request.json()

    // Validate inputs
    if (!identifier || identifier.trim() === "") {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // For email verification
    if (method === "email") {
      if (!isValidEmail(identifier)) {
        return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
      }

      // Check if user exists (optional, you may want to skip this for security reasons)
      const user = await getUserByEmail(identifier)
      if (!user) {
        // For security reasons, don't reveal if the email exists or not
        console.log(`User not found for email: ${identifier}, but proceeding with code generation for security`)
      }

      // Generate a verification code
      const code = generateVerificationCode()
      console.log(`Generated verification code for ${identifier}: ${code}`)

      // Store the code in the database
      try {
        await createVerificationCode(identifier, code)
        console.log(`Stored verification code in database for ${identifier}`)
      } catch (dbError) {
        console.error(`Failed to store verification code in database:`, dbError)
        return NextResponse.json(
          {
            success: false,
            message: `Database error: ${dbError instanceof Error ? dbError.message : "Failed to store verification code"}`,
          },
          { status: 500 },
        )
      }

      // Send the email
      try {
        const emailResult = await sendEmail({
          to: identifier,
          subject: "Your Verification Code",
          text: `Your verification code is: ${code}. It will expire in 15 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your Verification Code</h2>
              <p>Use the following code to verify your account:</p>
              <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
                ${code}
              </div>
              <p>This code will expire in 15 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `,
        })

        if (!emailResult.success) {
          console.error("Failed to send email verification:", emailResult.message)
          return NextResponse.json(
            {
              success: false,
              message: emailResult.message || "Failed to send verification email",
            },
            { status: 500 },
          )
        }

        console.log("Email verification sent successfully")
        return NextResponse.json({
          success: true,
          message: "Verification code sent to your email",
          previewUrl: emailResult.previewUrl,
        })
      } catch (emailError) {
        console.error("Error sending email:", emailError)
        await logError("sendVerificationCode", emailError, { identifier, method })
        return NextResponse.json(
          {
            success: false,
            message: emailError instanceof Error ? emailError.message : "Failed to send verification email",
          },
          { status: 500 },
        )
      }
    } else {
      return NextResponse.json({ success: false, message: "Unsupported verification method" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in send-verification-code route:", error)
    await logError("send-verification-code", error, { path: "/api/auth/send-verification-code" })
    return NextResponse.json(
      { success: false, message: "An error occurred while sending the verification code." },
      { status: 500 },
    )
  }
}
