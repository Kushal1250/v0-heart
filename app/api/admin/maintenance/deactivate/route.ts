import { NextResponse } from "next/server"
import logger from "@/lib/system-logger"

export async function POST(request: Request) {
  try {
    // Here you would update the database or a configuration file
    // to indicate that maintenance mode is inactive

    logger.info("Maintenance mode deactivated", { module: "API" })

    return NextResponse.json({
      success: true,
      message: "Maintenance mode deactivated",
    })
  } catch (error) {
    logger.error("Failed to deactivate maintenance mode", {
      module: "API",
      data: { error },
    })

    return NextResponse.json({ success: false, message: "Failed to deactivate maintenance mode" }, { status: 500 })
  }
}
