import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; message: string }> {
  try {
    // Check if email is configured
    if (
      !process.env.EMAIL_SERVER ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASSWORD
    ) {
      console.warn("Email is not configured. Email will not be sent.")
      return {
        success: false,
        message: "Email service is not configured",
      }
    }

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number.parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Send the email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    console.log(`Email sent successfully. Message ID: ${info.messageId}`)
    return {
      success: true,
      message: "Email sent successfully",
    }
  } catch (error) {
    console.error("Error sending email:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error sending email",
    }
  }
}
