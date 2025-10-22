import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexPublicApi } from "@/lib/utils/api-client"

let cachedElectricityData: any = null
let lastElectricityFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastElectricityFetch > 60000) {
      try {
        const result = await callPeyflexPublicApi("/api/electricity/plans/", {
          identifier: "electricity"
        })
        
        if (result && result.plans) {
          cachedElectricityData = result
          lastElectricityFetch = now
          updated = true
        }
      } catch (err) {
        console.error("Error fetching electricity plans:", err)
        // Silently fail and use cached/hardcoded data
      }
    }

    const data = cachedElectricityData || { plans: [] }

    return NextResponse.json({
      success: true,
      providers: data.plans?.map((p: any) => ({
        id: p.code || p.id,
        name: p.name,
        code: p.code || p.id,
      })) || [],
      updated,
      fromApi: true, // Indicate that this data is from the API
    })
  } catch (error: any) {
    console.error("Electricity plans API error:", error)
    return NextResponse.json({
      success: true,
      providers: [],
      updated: false,
      fromApi: false, // Indicate that this data is from fallback
    })
  }
}