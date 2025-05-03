import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

// Helper function to generate realistic prediction data
function generatePredictionData() {
  return {
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
}

export async function GET(request: Request) {
  try {
    // Check admin authentication
    const isAdmin = cookies().get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Predictions API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Check if predictions table exists
    const checkTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'predictions'
    `

    // If table doesn't exist, create it
    if (checkTable.length === 0) {
      console.log("Creating predictions table...")
      await sql`
        CREATE TABLE IF NOT EXISTS predictions (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL,
          result DECIMAL NOT NULL,
          prediction_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `
    }

    // Check if there are any predictions
    const countPredictions = await sql`SELECT COUNT(*) FROM predictions`
    const predictionCount = Number.parseInt(countPredictions[0].count)

    // If no predictions exist, generate sample data
    if (predictionCount === 0) {
      console.log("No predictions found. Generating sample data...")

      // Get users to associate with sample predictions
      const users = await sql`SELECT id, name, email FROM users LIMIT 5`

      if (users.length > 0) {
        // Generate 1-3 predictions for each user
        for (const user of users) {
          const numPredictions = Math.floor(Math.random() * 3) + 1

          for (let i = 0; i < numPredictions; i++) {
            const id = uuidv4()
            const result = Math.random() * 0.7 + 0.1 // Random value between 0.1 and 0.8
            const predictionData = generatePredictionData()

            // Add prediction with timestamp between 1-30 days ago
            const daysAgo = Math.floor(Math.random() * 30) + 1
            const timestamp = new Date()
            timestamp.setDate(timestamp.getDate() - daysAgo)

            await sql`
              INSERT INTO predictions (id, user_id, result, prediction_data, created_at)
              VALUES (${id}, ${user.id}, ${result}, ${predictionData}, ${timestamp})
            `
          }
        }

        console.log("Sample predictions generated successfully")
      } else {
        // If no users exist, create a demo user and predictions
        console.log("No users found. Creating demo user and predictions...")

        // Create demo user
        const userId = uuidv4()
        const hashedPassword = "demo_password_hash" // In production, use proper hashing

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

        await sql`
          INSERT INTO users (id, email, password, name, role)
          VALUES (${userId}, ${"demo@example.com"}, ${hashedPassword}, ${"Demo User"}, ${"user"})
          ON CONFLICT (email) DO NOTHING
        `

        // Create sample predictions for demo user
        for (let i = 0; i < 3; i++) {
          const id = uuidv4()
          const result = Math.random() * 0.7 + 0.1
          const predictionData = generatePredictionData()

          // Add prediction with timestamp between 1-30 days ago
          const daysAgo = Math.floor(Math.random() * 30) + 1
          const timestamp = new Date()
          timestamp.setDate(timestamp.getDate() - daysAgo)

          await sql`
            INSERT INTO predictions (id, user_id, result, prediction_data, created_at)
            VALUES (${id}, ${userId}, ${result}, ${predictionData}, ${timestamp})
          `
        }

        console.log("Demo user and predictions created successfully")
      }
    }

    // Fetch predictions with user information
    const predictions = await sql`
      SELECT p.*, u.name, u.email
      FROM predictions p
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `

    // Transform the data to match the expected format
    const formattedPredictions = predictions.map((pred) => ({
      id: pred.id,
      userId: pred.user_id,
      userName: pred.name || pred.email || "Unknown User",
      result: Number.parseFloat(pred.result),
      timestamp: pred.created_at,
      data: pred.prediction_data || {},
    }))

    return NextResponse.json({ predictions: formattedPredictions })
  } catch (error) {
    console.error("Error fetching predictions:", error)

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('relation "predictions" does not exist')) {
        return NextResponse.json({
          predictions: [],
          message: "Predictions table doesn't exist yet. Please run migration.",
        })
      }

      if (error.message.includes('relation "users" does not exist')) {
        return NextResponse.json({
          predictions: [],
          message: "Users table doesn't exist yet. Please run migration.",
        })
      }
    }

    return NextResponse.json(
      {
        message: "An error occurred",
        error: String(error),
      },
      { status: 500 },
    )
  }
}

// Add endpoint to create a new prediction
export async function POST(request: Request) {
  try {
    // Check admin authentication
    const isAdmin = cookies().get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Predictions API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    const data = await request.json()
    const { userId, result, predictionData } = data

    // Validate input
    if (!userId || result === undefined) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

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

    // Insert new prediction
    const id = uuidv4()
    await sql`
      INSERT INTO predictions (id, user_id, result, prediction_data)
      VALUES (${id}, ${userId}, ${result}, ${predictionData || {}})
    `

    return NextResponse.json({
      success: true,
      message: "Prediction created successfully",
      prediction: {
        id,
        userId,
        result,
        predictionData: predictionData || {},
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error("Error creating prediction:", error)
    return NextResponse.json(
      {
        message: "An error occurred",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
