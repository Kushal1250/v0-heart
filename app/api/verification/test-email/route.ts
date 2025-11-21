import { NextResponse } from "next/server"
import { getUserFromRequest } from "@/lib/auth-utils"
import { sendEmail } from "@/lib/email-utils"
import { isValidEmail } from "@/lib/client-validation"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const user = await getUserFromRequest(request as any)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: "Email address is required" }, { status: 400 })
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Invalid email format" }, { status: 400 })
    }

    // Generate a test code
    const testCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Send the email
    const result = await sendEmail({
      to: email,
      subject: "[TEST] HeartPredict Verification Code",
      text: `Your verification code is: ${testCode}. This is a test message.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>HeartPredict Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f5f5f5; border-radius: 4px; text-align: center; letter-spacing: 4px;">
            ${testCode}
          </div>
          <p style="margin-top: 20px;">This is a test message. Please ignore if you did not request this code.</p>
        </div>
      `,
    })

    if (!result.success) {
      return NextResponse.json({ message: result.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `Test email sent successfully to ${email}`,
      code: testCode,
    })
  } catch (error) {
    console.error("Error sending test email:", error)
    return NextResponse.json(
      {
        message: `Failed to send test email: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
