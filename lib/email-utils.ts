"use server"

import nodemailer from "nodemailer"
import { logError } from "./error-logger"

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
  attachments?: any[]
}

export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean
  message: string
}> {
  try {
    // Log that we're attempting to send an email
    console.log(`Attempting to send email to ${options.to} with subject: ${options.subject}`)
    console.log(`Using EMAIL_SERVER: ${process.env.EMAIL_SERVER}`)
    console.log(`Using EMAIL_PORT: ${process.env.EMAIL_PORT}`)
    console.log(`Using EMAIL_USER: ${process.env.EMAIL_USER}`)

    // Create a nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        // Do not fail on invalid certificates
        rejectUnauthorized: false,
      },
    })

    // Add the from field
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Heart Health Predictor" <${process.env.EMAIL_USER}>`,
      ...options,
    }

    // Send the email
    console.log(
      "Sending email with options:",
      JSON.stringify({
        to: mailOptions.to,
        subject: mailOptions.subject,
        from: mailOptions.from,
      }),
    )

    const info = await transporter.sendMail(mailOptions)

    console.log("Email sent successfully:", info.messageId)
    return { success: true, message: "Email sent successfully" }
  } catch (error) {
    console.error("Failed to send email:", error)
    await logError("sendEmail", error, { to: options.to, subject: options.subject })
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send email",
    }
  }
}

// Function to verify email transport configuration
export async function verifyEmailConfig(): Promise<{
  success: boolean
  message: string
}> {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    await transporter.verify()
    return { success: true, message: "Email configuration is valid" }
  } catch (error) {
    console.error("Email configuration verification failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Email configuration verification failed",
    }
  }
}
