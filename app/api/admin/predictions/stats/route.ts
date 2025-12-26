import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const isAdmin = (await cookies()).get("is_admin")?.value === "true"

    if (!isAdmin) {
      console.log("Predictions Stats API: Not an admin")
      return NextResponse.json({ message: "Forbidden", error: "Not an admin" }, { status: 403 })
    }

    // Get today's date at midnight
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayISOString = today.toISOString()

    // Check if predictions table exists
    const checkTable = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'predictions'
    `

    // If table doesn't exist, return empty stats
    if (checkTable.length === 0) {
      console.log("Predictions table doesn't exist yet. Please run migration.")
      return NextResponse.json({
        stats: {
          totalPredictions: 0,
          newToday: 0,
          averageRisk: 0,
          highRiskCount: 0,
          lowRiskCount: 0,
        },
        message: "Predictions table doesn't exist yet. Please run migration.",
      })
    }

    // Get total predictions count
    const totalCountResult = await sql`SELECT COUNT(*) FROM predictions`
    const totalCount = Number.parseInt(totalCountResult[0].count)

    // Get count of predictions made today
    const todayCountResult = await sql`
      SELECT COUNT(*) 
      FROM predictions 
      WHERE created_at >= ${todayISOString}
    `
    const todayCount = Number.parseInt(todayCountResult[0].count)

    // Get average risk
    const avgRiskResult = await sql`
      SELECT AVG(CAST(result AS FLOAT)) as avg_risk
      FROM predictions
    `
    const averageRisk = avgRiskResult[0].avg_risk || 0

    // Get high risk count (> 50%)
    const highRiskResult = await sql`
      SELECT COUNT(*) 
      FROM predictions 
      WHERE CAST(result AS FLOAT) > 0.5
    `
    const highRiskCount = Number.parseInt(highRiskResult[0].count)

    // Get low risk count (< 30%)
    const lowRiskResult = await sql`
      SELECT COUNT(*) 
      FROM predictions 
      WHERE CAST(result AS FLOAT) < 0.3
    `
    const lowRiskCount = Number.parseInt(lowRiskResult[0].count)

    return NextResponse.json({
      stats: {
        totalPredictions: totalCount,
        newToday: todayCount,
        averageRisk: averageRisk,
        highRiskCount: highRiskCount,
        lowRiskCount: lowRiskCount,
      },
    })
  } catch (error) {
    console.error("Error fetching prediction stats:", error)
    return NextResponse.json(
      {
        message: "An error occurred",
        error: String(error),
        stats: {
          totalPredictions: 0,
          newToday: 0,
          averageRisk: 0,
          highRiskCount: 0,
          lowRiskCount: 0,
        },
      },
      { status: 500 },
    )
  }
}
