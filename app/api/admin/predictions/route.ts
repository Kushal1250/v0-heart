import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

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

    // If table doesn't exist, create it and add sample data
    if (checkTable.length === 0) {
      console.log("Predictions table doesn't exist. Creating it with sample data...")

      // Create predictions table
      await sql`
        CREATE TABLE IF NOT EXISTS predictions (
          id UUID PRIMARY KEY,
          user_id UUID NOT NULL,
          result DECIMAL NOT NULL,
          prediction_data JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `

      // Get a user to associate with sample predictions
      const users = await sql`SELECT id, name, email FROM users LIMIT 5`

      if (users.length > 0) {
        // Add sample predictions for each user
        for (const user of users) {
          const samplePredictions = [
            {
              id: uuidv4(),
              user_id: user.id,
              result: Math.random() * 0.7 + 0.1, // Random value between 0.1 and 0.8
              prediction_data: {
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
              },
            },
            {
              id: uuidv4(),
              user_id: user.id,
              result: Math.random() * 0.7 + 0.1, // Random value between 0.1 and 0.8
              prediction_data: {
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
              },
            },
          ]

          for (const pred of samplePredictions) {
            await sql`
              INSERT INTO predictions (id, user_id, result, prediction_data)
              VALUES (${pred.id}, ${pred.user_id}, ${pred.result}, ${pred.prediction_data})
            `
          }
        }
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

    // Check if the error is about the missing table
    if (error instanceof Error && error.message.includes('relation "predictions" does not exist')) {
      return NextResponse.json({
        predictions: [],
        message: "Predictions table doesn't exist yet. Please run migration.",
      })
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
