import { type NextRequest, NextResponse } from "next/server"
import { HARDCODED_DATA } from "@/lib/data/hardcoded-data"
import { generateRequestId } from "@/lib/utils/request-id"
// Example of how to import and use a new API client
// import { callNewBillApi } from "@/lib/utils/api-client"

let cachedDataPlans: any = null
let lastDataPlansFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastDataPlansFetch > 60000) {
      try {
        const requestId = generateRequestId()
        // Example of how to use a new API client
        // const result = await callNewBillApi("/data/plans", { requestId })
        const result = await callBillApi("/DataPurchase/getDataInfo", {})
        if (result?.data) {
          cachedDataPlans = result
          lastDataPlansFetch = now
          updated = true
        }
      } catch (err) {
        // Silently fail and use cached/hardcoded data
      }
    }

    const data = cachedDataPlans || HARDCODED_DATA.data
    const providers = data.data?.[0]?.providers || []

    const plansByNetwork: Record<string, any[]> = {}
    providers.forEach((provider: any) => {
      const networkName = provider.name
      plansByNetwork[networkName] =
        provider.providerPlans?.map((plan: any) => ({
          id: plan.code,
          name: plan.name,
          amount: plan.amount,
          ngnPrice: plan.amount,
          network: networkName,
        })) || []
    })

    return NextResponse.json({
      success: true,
      networks: providers.map((p: any) => p.name),
      plansByNetwork,
      allPlans: Object.values(plansByNetwork).flat(),
      updated,
      fromApi: true, // Indicate that this data is from the API
    })
  } catch (error: any) {
    const providers = HARDCODED_DATA.data.data[0].providers
    const plansByNetwork: Record<string, any[]> = {}
    providers.forEach((provider: any) => {
      const networkName = provider.name
      plansByNetwork[networkName] =
        provider.providerPlans?.map((plan: any) => ({
          id: plan.code,
          name: plan.name,
          amount: plan.amount,
          ngnPrice: plan.amount,
          network: networkName,
        })) || []
    })

    return NextResponse.json({
      success: true,
      networks: providers.map((p: any) => p.name),
      plansByNetwork,
      allPlans: Object.values(plansByNetwork).flat(),
      updated: false,
      fromApi: false, // Indicate that this data is from fallback
    })
  }
}