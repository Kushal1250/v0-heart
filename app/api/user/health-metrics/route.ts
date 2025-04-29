import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { getUserFromRequest } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(request)

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const sql = neon(process.env.DATABASE_URL!)

    // Get the user's latest assessment
    const latestAssessment = await sql`
      SELECT 
        id, 
        created_at, 
        risk_score, 
        risk_level
      FROM predictions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `

    // Get previous assessments to determine trend
    const previousAssessments = await sql`
      SELECT 
        risk_score, 
        created_at 
      FROM predictions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 5
    `

    // Calculate risk trend
    let riskTrend: "improving" | "stable" | "worsening" = "stable"

    if (previousAssessments.length >= 2) {
      const latestScore = previousAssessments[0].risk_score
      const previousScore = previousAssessments[1].risk_score

      const difference = latestScore - previousScore

      if (difference < -5) {
        riskTrend = "improving"
      } else if (difference > 5) {
        riskTrend = "worsening"
      }
    }

    // Get community rank (simplified version)
    const communityRank = await sql`
      SELECT 
        COUNT(*) as better_count
      FROM predictions p
      JOIN (
        SELECT 
          user_id, 
          MAX(created_at) as latest_date
        FROM predictions
        GROUP BY user_id
      ) latest ON p.user_id = latest.user_id AND p.created_at = latest.latest_date
      WHERE p.risk_score < (
        SELECT risk_score 
        FROM predictions 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 1
      )
    `

    // Get total number of users with predictions
    const totalUsers = await sql`
      SELECT COUNT(DISTINCT user_id) as total
      FROM predictions
    `

    // Calculate percentile rank
    const betterCount = communityRank[0]?.better_count || 0
    const total = totalUsers[0]?.total || 0

    let percentileRank = "N/A"
    if (total > 0) {
      const percentile = Math.round((betterCount / total) * 100)
      percentileRank = `Top ${100 - percentile}%`
    }

    return NextResponse.json({
      lastRiskScore: latestAssessment.length > 0 ? latestAssessment[0].risk_score : null,
      lastAssessmentDate: latestAssessment.length > 0 ? latestAssessment[0].created_at : null,
      riskTrend,
      communityRank: percentileRank,
    })
  } catch (error) {
    console.error("Error fetching health metrics:", error)
    return NextResponse.json({ error: "Failed to fetch health metrics" }, { status: 500 })
  }
}
