import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { verifyAdminSession } from "@/lib/auth-utils"

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
    const adminSession = await verifyAdminSession()
    if (!adminSession.success) {
      console.log("Predictions API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Get search parameter if any
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("search")?.toLowerCase() || ""
    const limit = Number.parseInt(searchParams.get("limit") || "100") // Default to 100 records

    console.log(`Fetching predictions with search term: "${searchTerm}", limit: ${limit}`)

    // Fetch predictions with user information
    // Use a JOIN with the users table to get user details
    // Add search functionality to filter by email or name
    let predictionsQuery = `
      SELECT 
        p.id, 
        p.user_id, 
        p.result, 
        p.created_at, 
        p.prediction_data,
        u.name, 
        u.email
      FROM predictions p
      LEFT JOIN users u ON p.user_id = u.id
    `

    // Add search condition if search term is provided
    if (searchTerm) {
      predictionsQuery += `
        WHERE 
          LOWER(u.name) LIKE '%${searchTerm}%' OR 
          LOWER(u.email) LIKE '%${searchTerm}%'
      `
    }

    // Add order by and limit
    predictionsQuery += `
      ORDER BY p.created_at DESC
      LIMIT ${limit}
    `

    console.log("Executing query:", predictionsQuery)
    const predictions = await sql(predictionsQuery)
    console.log(`Found ${predictions.length} predictions`)

    // Transform the data to match the expected format
    const formattedPredictions = predictions.map((pred) => ({
      id: pred.id,
      userId: pred.user_id,
      userName: pred.name || pred.email || "Unknown User",
      email: pred.email || "No Email",
      result: Number.parseFloat(pred.result),
      timestamp: pred.created_at,
      data: pred.prediction_data || {},
    }))

    return NextResponse.json({
      predictions: formattedPredictions,
      total: formattedPredictions.length,
      timestamp: new Date().toISOString(),
    })
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
    const adminSession = await verifyAdminSession()
    if (!adminSession.success) {
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
    const id = crypto.randomUUID()
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
