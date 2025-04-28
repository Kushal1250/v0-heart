import { type NextRequest, NextResponse } from "next/server"
import { generateEnhancedPDF } from "@/lib/enhanced-pdf-generator"
import type { PredictionResult } from "../predict/route"

export async function POST(request: NextRequest) {
  try {
    const { predictionData, userName, phoneNumber } = await request.json()

    if (!predictionData) {
      return NextResponse.json({ error: "Prediction data is required" }, { status: 400 })
    }

    // Generate PDF
    const pdfBuffer = await generateEnhancedPDF(
      predictionData as PredictionResult,
      userName || "Anonymous User",
      phoneNumber || "",
    )

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="heart-health-assessment.pdf"',
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
