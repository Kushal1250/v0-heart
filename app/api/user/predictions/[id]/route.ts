import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const predictionId = params.id

    if (!predictionId) {
      return NextResponse.json({ error: "Prediction ID is required" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)

    // Fetch the prediction with the given ID that belongs to the authenticated user
    const prediction = await sql`
      SELECT 
        p.id,
        p.user_id,
        p.created_at,
        p.result,
        p.prediction_data
      FROM 
        predictions p
      WHERE 
        p.id = ${predictionId} AND p.user_id = ${user.id}
      LIMIT 1
    `

    if (!prediction || prediction.length === 0) {
      return NextResponse.json({ error: "Prediction not found" }, { status: 404 })
    }

    // Format the prediction data for the client
    const predictionData = prediction[0]

    // Calculate risk level based on result score
    const riskScore = predictionData.result * 100
    let riskLevel = "low"
    if (riskScore >= 70) {
      riskLevel = "high"
    } else if (riskScore >= 30) {
      riskLevel = "moderate"
    }

    // Format the response
    const formattedPrediction = {
      id: predictionData.id,
      date: predictionData.created_at,
      result: {
        risk: riskLevel,
        score: Math.round(riskScore),
        hasDisease: predictionData.result >= 0.5,
      },
      ...predictionData.prediction_data,
    }

    return NextResponse.json(formattedPrediction)
  } catch (error) {
    console.error("Error fetching prediction:", error)
    return NextResponse.json({ error: "Failed to fetch prediction" }, { status: 500 })
  }
}
