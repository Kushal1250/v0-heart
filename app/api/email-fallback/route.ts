import { type NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"

// Store emails temporarily for demo purposes
const EMAIL_STORAGE_DIR = path.join(process.cwd(), "tmp", "emails")

// Helper function to ensure directory exists
async function ensureDirectoryExists(directory: string) {
  try {
    await fs.mkdir(directory, { recursive: true })
  } catch (error) {
    console.error("Error creating directory:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, subject, message, assessmentData } = body

    // Validate email
    if (!to || !/^\S+@\S+\.\S+$/.test(to)) {
      return NextResponse.json({ error: "Valid recipient email is required" }, { status: 400 })
    }

    // Create a simple email object
    const emailData = {
      to,
      subject,
      message,
      assessmentData,
      timestamp: new Date().toISOString(),
    }

    // Generate a unique ID for this email
    const emailId = crypto.randomUUID()

    // Ensure the directory exists
    await ensureDirectoryExists(EMAIL_STORAGE_DIR)

    // Save the email data to a file (for demo purposes)
    const filePath = path.join(EMAIL_STORAGE_DIR, `${emailId}.json`)
    await fs.writeFile(filePath, JSON.stringify(emailData, null, 2))

    // Return success with the email ID
    return NextResponse.json({
      success: true,
      emailId,
      message: "Email saved for alternative delivery",
    })
  } catch (error: any) {
    console.error("Error in fallback email service:", error)
    return NextResponse.json({ error: "Failed to process fallback email" }, { status: 500 })
  }
}
