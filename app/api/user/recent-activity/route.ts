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

    // Get recent assessments
    const recentAssessments = await sql`
      SELECT 
        id, 
        created_at, 
        risk_score, 
        risk_level
      FROM predictions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC 
      LIMIT 3
    `

    // Get recent profile updates
    const recentProfileUpdates = await sql`
      SELECT 
        id, 
        updated_at, 
        action_type
      FROM user_activity_log
      WHERE user_id = ${userId} AND action_type = 'profile_update'
      ORDER BY updated_at DESC
      LIMIT 2
    `

    // Format assessments as activity items
    const assessmentActivities = recentAssessments.map((assessment) => {
      const date = new Date(assessment.created_at)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      return {
        id: assessment.id,
        type: "assessment",
        title: "Heart Disease Risk Assessment",
        description: `Completed on ${formattedDate}`,
        date: assessment.created_at,
        risk: assessment.risk_level.toLowerCase(),
        detailsUrl: `/predict/results/${assessment.id}`,
      }
    })

    // Format profile updates as activity items
    const profileActivities = recentProfileUpdates.map((update) => {
      const date = new Date(update.updated_at)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      return {
        id: update.id,
        type: "profile_update",
        title: "Profile Updated",
        description: `Updated personal information on ${formattedDate}`,
        date: update.updated_at,
        detailsUrl: "/profile",
      }
    })

    // Combine and sort all activities by date
    const allActivities = [...assessmentActivities, ...profileActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5) // Limit to 5 most recent activities

    return NextResponse.json({
      activities: allActivities,
    })
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 })
  }
}
