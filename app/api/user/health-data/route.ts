import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get health data from database
    const result = await sql`
      SELECT * FROM user_health_data 
      WHERE user_id = ${currentUser.id}
      LIMIT 1
    `.catch(() => null)

    // If no health data exists yet, return empty object
    if (!result || result.length === 0) {
      return NextResponse.json({})
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching health data:", error)
    return NextResponse.json({ message: "Failed to fetch health data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Check if health data already exists for this user
    const existingData = await sql`
      SELECT id FROM user_health_data 
      WHERE user_id = ${currentUser.id}
      LIMIT 1
    `.catch(() => null)

    let result

    if (existingData && existingData.length > 0) {
      // Update existing record
      result = await sql`
        UPDATE user_health_data
        SET 
          height = ${data.height || null},
          weight = ${data.weight || null},
          blood_type = ${data.bloodType || null},
          allergies = ${data.allergies || null},
          medical_conditions = ${data.medicalConditions || null},
          medications = ${data.medications || null},
          emergency_contact_name = ${data.emergencyContactName || null},
          emergency_contact_phone = ${data.emergencyContactPhone || null},
          emergency_contact_relation = ${data.emergencyContactRelation || null},
          gender = ${data.gender || null},
          date_of_birth = ${data.dateOfBirth || null},
          updated_at = NOW()
        WHERE user_id = ${currentUser.id}
        RETURNING *
      `
    } else {
      // Create new record
      result = await sql`
        INSERT INTO user_health_data (
          user_id,
          height,
          weight,
          blood_type,
          allergies,
          medical_conditions,
          medications,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relation,
          gender,
          date_of_birth,
          created_at,
          updated_at
        ) VALUES (
          ${currentUser.id},
          ${data.height || null},
          ${data.weight || null},
          ${data.bloodType || null},
          ${data.allergies || null},
          ${data.medicalConditions || null},
          ${data.medications || null},
          ${data.emergencyContactName || null},
          ${data.emergencyContactPhone || null},
          ${data.emergencyContactRelation || null},
          ${data.gender || null},
          ${data.dateOfBirth || null},
          NOW(),
          NOW()
        )
        RETURNING *
      `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating health data:", error)
    return NextResponse.json({ message: "Failed to update health data" }, { status: 500 })
  }
}
