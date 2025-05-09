import { NextResponse } from "next/server"
import { updateUsersTable } from "@/scripts/update-users-table"

export async function POST(request: Request) {
  try {
    // In a real app, you would check for admin authentication here
    const result = await updateUsersTable()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error running migration:", error)
    return NextResponse.json({ error: "Failed to run migration" }, { status: 500 })
  }
}
