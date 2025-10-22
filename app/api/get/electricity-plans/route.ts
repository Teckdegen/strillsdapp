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
        
        if (result) {
          cachedElectricityData = result
          lastElectricityFetch = now
          updated = true
        }
      } catch (err) {
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
      plans: data.plans?.flatMap(
        (provider: any) =>
          provider.plans?.map((plan: any) => ({
            id: plan.code || plan.id,
            name: plan.name,
            code: plan.code || plan.id,
          })) || [],
      ) || [],
      updated,
      fromApi: true, // Indicate that this data is from the API
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      providers: [],
      plans: [],
      updated: false,
      fromApi: false, // Indicate that this data is from fallback
    })
  }
}