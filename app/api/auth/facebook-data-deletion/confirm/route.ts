import { type NextRequest, NextResponse } from "next/server"

/**
 * Handle Facebook data deletion confirmation requests
 */
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")

    if (!code) {
      return NextResponse.json({ success: false, error: "Missing confirmation code" }, { status: 400 })
    }

    // Here you could verify the confirmation code against a stored value
    // For now, we'll just confirm that the code exists

    return NextResponse.json({
      success: true,
      message: "Data deletion confirmed",
      confirmation_code: code,
    })
  } catch (error) {
    console.error("Error processing Facebook data deletion confirmation:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
