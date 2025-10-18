import { type NextRequest, NextResponse } from "next/server"
import { getNGNtoUSDRate } from "@/lib/utils/coingecko"

export async function GET(request: NextRequest) {
  try {
    const ngnToUsdRate = await getNGNtoUSDRate()
    return NextResponse.json({
      rate: ngnToUsdRate,
      success: true,
    })
  } catch (error) {
    console.error("Rates API error:", error)
    // Return fallback rate instead of error
    return NextResponse.json({
      rate: 1650,
      success: true,
      cached: true,
    })
  }
}
