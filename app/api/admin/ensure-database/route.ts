import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    // Check admin authentication
    const isAdmin = cookies().get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Ensure Database API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        role TEXT DEFAULT 'user'
      )
    `

    // Create predictions table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS predictions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL,
        result DECIMAL NOT NULL,
        prediction_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Check if there are any users
    const countUsers = await sql`SELECT COUNT(*) FROM users`
    const userCount = Number.parseInt(countUsers[0].count)

    // If no users exist, create a demo user
    if (userCount === 0) {
      console.log("No users found. Creating demo user...")

      // Create demo user
      const userId = uuidv4()
      const hashedPassword = "demo_password_hash" // In production, use proper hashing

      await sql`
        INSERT INTO users (id, email, password, name, role)
        VALUES (${userId}, ${"demo@example.com"}, ${hashedPassword}, ${"Demo User"}, ${"user"})
      `

      // Create admin user
      const adminId = uuidv4()
      await sql`
        INSERT INTO users (id, email, password, name, role)
        VALUES (${adminId}, ${"admin@example.com"}, ${hashedPassword}, ${"Admin User"}, ${"admin"})
      `

      console.log("Demo users created successfully")

      // Create sample predictions for demo user
      for (let i = 0; i < 3; i++) {
        const id = uuidv4()
        const result = Math.random() * 0.7 + 0.1
        const predictionData = {
          age: Math.floor(Math.random() * 50) + 30,
          sex: Math.random() > 0.5 ? 1 : 0,
          cp: Math.floor(Math.random() * 4),
          trestbps: Math.floor(Math.random() * 60) + 120,
          chol: Math.floor(Math.random() * 200) + 150,
          fbs: Math.random() > 0.7 ? 1 : 0,
          restecg: Math.floor(Math.random() * 3),
          thalach: Math.floor(Math.random() * 100) + 100,
          exang: Math.random() > 0.7 ? 1 : 0,
          oldpeak: Math.random() * 4,
          slope: Math.floor(Math.random() * 3),
          ca: Math.floor(Math.random() * 4),
          thal: Math.floor(Math.random() * 3) + 1,
        }

        // Add prediction with timestamp between 1-30 days ago
        const daysAgo = Math.floor(Math.random() * 30) + 1
        const timestamp = new Date()
        timestamp.setDate(timestamp.getDate() - daysAgo)

        await sql`
          INSERT INTO predictions (id, user_id, result, prediction_data, created_at)
          VALUES (${id}, ${userId}, ${result}, ${predictionData}, ${timestamp})
        `
      }
    }

    // Check if there are any predictions
    const countPredictions = await sql`SELECT COUNT(*) FROM predictions`
    const predictionCount = Number.parseInt(countPredictions[0].count)

    return NextResponse.json({
      success: true,
      message: "Database initialization complete",
      stats: {
        users: userCount,
        predictions: predictionCount,
      },
    })
  } catch (error) {
    console.error("Error ensuring database:", error)
    return NextResponse.json(
      {
        message: "An error occurred",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
