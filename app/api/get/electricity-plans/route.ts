import { type NextRequest, NextResponse } from "next/server"
import { HARDCODED_DATA } from "@/lib/data/hardcoded-data"
import { callPeyflexApiWithParams } from "@/lib/utils/api-client"

let cachedElectricityData: any = null
let lastElectricityFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastElectricityFetch > 60000) {
      try {
        const result = await callPeyflexApiWithParams("/api/electricity/plans/", {
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

    const data = cachedElectricityData || HARDCODED_DATA.electricity
    // Peyflex returns plans directly, not nested in data.data
    const providers = data.plans || data.data?.[0]?.providers || []

    return NextResponse.json({
      success: true,
      providers: providers.map((p: any) => ({
        id: p.code || p.id,
        name: p.name,
        code: p.code || p.id,
      })),
      plans: providers.flatMap(
        (provider: any) =>
          provider.plans?.map((plan: any) => ({
            id: plan.code || plan.id,
            name: plan.name,
            code: plan.code || plan.id,
          })) || [],
      ),
      updated,
      fromApi: true, // Indicate that this data is from the API
    })
  } catch (error: any) {
    const providers = HARDCODED_DATA.electricity.data[0].providers
    return NextResponse.json({
      success: true,
      providers: providers.map((p: any) => ({
        id: p.code,
        name: p.name,
        code: p.code,
      })),
      plans: providers.flatMap(
        (provider: any) =>
          provider.plans?.map((plan: any) => ({
            id: plan.code,
            name: plan.name,
            code: plan.code,
          })) || [],
      ),
      updated: false,
      fromApi: false, // Indicate that this data is from fallback
    })
  }
}