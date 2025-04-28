import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function GET() {
  try {
    // Check if email environment variables are set
    const emailConfig = {
      server: process.env.EMAIL_SERVER,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === "true",
      user: process.env.EMAIL_USER,
      password: process.env.EMAIL_PASSWORD ? "✓ Set" : "✗ Not set",
      from: process.env.EMAIL_FROM,
    }

    // Check for missing configuration
    const missingConfig = []
    if (!emailConfig.server) missingConfig.push("EMAIL_SERVER")
    if (!emailConfig.port) missingConfig.push("EMAIL_PORT")
    if (!emailConfig.user) missingConfig.push("EMAIL_USER")
    if (!emailConfig.password === "✗ Not set") missingConfig.push("EMAIL_PASSWORD")
    if (!emailConfig.from) missingConfig.push("EMAIL_FROM")

    if (missingConfig.length > 0) {
      return NextResponse.json({
        status: "error",
        message: "Missing email configuration",
        missingConfig,
        config: {
          ...emailConfig,
          password: undefined, // Don't expose password status in response
        },
      })
    }

    // Try to create a transporter
    const transporter = nodemailer.createTransport({
      host: emailConfig.server,
      port: Number(emailConfig.port) || 587,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    // Verify connection configuration
    try {
      await transporter.verify()
      return NextResponse.json({
        status: "success",
        message: "Email configuration is valid",
        config: {
          server: emailConfig.server,
          port: emailConfig.port,
          secure: emailConfig.secure,
          user: emailConfig.user,
          from: emailConfig.from,
        },
      })
    } catch (error: any) {
      return NextResponse.json({
        status: "error",
        message: "Email configuration is invalid",
        error: error.message,
        code: error.code,
        config: {
          server: emailConfig.server,
          port: emailConfig.port,
          secure: emailConfig.secure,
          user: emailConfig.user,
          from: emailConfig.from,
        },
      })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: "error",
      message: "Failed to test email configuration",
      error: error.message,
    })
  }
}
