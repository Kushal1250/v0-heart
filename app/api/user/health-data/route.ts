import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Check if health data exists for this user
    const healthData = await sql`
      SELECT * FROM user_health_data WHERE user_id = ${currentUser.id}
    `

    if (healthData.length === 0) {
      // Return default empty health data
      return NextResponse.json({
        height: "",
        weight: "",
        bloodType: "",
        allergies: "",
        medicalConditions: "",
        medications: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        emergencyContactRelation: "",
      })
    }

    // Return existing health data
    return NextResponse.json({
      height: healthData[0].height || "",
      weight: healthData[0].weight || "",
      bloodType: healthData[0].blood_type || "",
      allergies: healthData[0].allergies || "",
      medicalConditions: healthData[0].medical_conditions || "",
      medications: healthData[0].medications || "",
      emergencyContactName: healthData[0].emergency_contact_name || "",
      emergencyContactPhone: healthData[0].emergency_contact_phone || "",
      emergencyContactRelation: healthData[0].emergency_contact_relation || "",
      dateOfBirth: healthData[0].date_of_birth || "",
      gender: healthData[0].gender || "",
    })
  } catch (error) {
    console.error("Error fetching health data:", error)
    return NextResponse.json({ message: "Failed to fetch health data" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const data = await req.json()

    // Check if health data already exists for this user
    const existingData = await sql`
      SELECT id FROM user_health_data WHERE user_id = ${currentUser.id}
    `

    if (existingData.length === 0) {
      // Create new health data record
      await sql`
        INSERT INTO user_health_data (
          user_id, height, weight, blood_type, allergies, 
          medical_conditions, medications, emergency_contact_name, 
          emergency_contact_phone, emergency_contact_relation, 
          date_of_birth, gender
        ) VALUES (
          ${currentUser.id}, ${data.height || null}, ${data.weight || null}, 
          ${data.bloodType || null}, ${data.allergies || null}, 
          ${data.medicalConditions || null}, ${data.medications || null}, 
          ${data.emergencyContactName || null}, ${data.emergencyContactPhone || null}, 
          ${data.emergencyContactRelation || null}, ${data.dateOfBirth || null}, 
          ${data.gender || null}
        )
      `
    } else {
      // Update existing health data
      await sql`
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
          date_of_birth = ${data.dateOfBirth || null}, 
          gender = ${data.gender || null},
          updated_at = NOW()
        WHERE user_id = ${currentUser.id}
      `
    }

    return NextResponse.json({
      success: true,
      message: "Health data updated successfully",
    })
  } catch (error) {
    console.error("Error updating health data:", error)
    return NextResponse.json({ message: "Failed to update health data" }, { status: 500 })
  }
}
