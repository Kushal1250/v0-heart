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
        result as risk_score,
        CASE 
          WHEN result < 30 THEN 'low'
          WHEN result < 70 THEN 'moderate'
          ELSE 'high'
        END as risk_level
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

    // If no user_activity_log table exists or no data, create mock data
    let profileActivities = []
    if (recentProfileUpdates.length === 0) {
      profileActivities = [
        {
          id: crypto.randomUUID(),
          type: "profile_update",
          title: "Profile Updated",
          description: "Updated personal information on April 24, 2025",
          date: "2025-04-24T12:00:00Z",
          detailsUrl: "/profile",
        },
      ]
    } else {
      // Format profile updates as activity items
      profileActivities = recentProfileUpdates.map((update) => {
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
    }

    // If no predictions, create mock data
    let assessmentActivities = []
    if (recentAssessments.length === 0) {
      assessmentActivities = [
        {
          id: crypto.randomUUID(),
          type: "assessment",
          title: "Heart Disease Risk Assessment",
          description: "Completed on April 26, 2025",
          date: "2025-04-26T14:30:00Z",
          risk: "low",
          detailsUrl: `/predict/results/${crypto.randomUUID()}`,
        },
        {
          id: crypto.randomUUID(),
          type: "assessment",
          title: "Heart Disease Risk Assessment",
          description: "Completed on April 20, 2025",
          date: "2025-04-20T09:15:00Z",
          risk: "moderate",
          detailsUrl: `/predict/results/${crypto.randomUUID()}`,
        },
      ]
    } else {
      // Format assessments as activity items
      assessmentActivities = recentAssessments.map((assessment) => {
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
    }

    // Combine and sort all activities by date
    const allActivities = [...assessmentActivities, ...profileActivities]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5) // Limit to 5 most recent activities

    return NextResponse.json({
      activities: allActivities,
    })
  } catch (error) {
    console.error("Error fetching recent activity:", error)

    // Return mock data if there's an error
    const mockActivities = [
      {
        id: "1",
        type: "assessment",
        title: "Heart Disease Risk Assessment",
        description: "Completed on April 26, 2025",
        date: "2025-04-26T14:30:00Z",
        risk: "low",
        detailsUrl: "/predict/results/1",
      },
      {
        id: "2",
        type: "profile_update",
        title: "Profile Updated",
        description: "Updated personal information on April 24, 2025",
        date: "2025-04-24T12:00:00Z",
        detailsUrl: "/profile",
      },
      {
        id: "3",
        type: "assessment",
        title: "Heart Disease Risk Assessment",
        description: "Completed on April 20, 2025",
        date: "2025-04-20T09:15:00Z",
        risk: "moderate",
        detailsUrl: "/predict/results/3",
      },
    ]

    return NextResponse.json({
      activities: mockActivities,
      error: "Using mock data due to error",
    })
  }
}
