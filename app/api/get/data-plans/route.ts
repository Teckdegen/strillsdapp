import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexPublicApi } from "@/lib/utils/api-client"

let cachedDataPlans: any = null
let lastDataPlansFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastDataPlansFetch > 60000) {
      try {
        // First get networks
        const networksResult = await callPeyflexPublicApi("/api/data/networks/")
        
        if (networksResult && networksResult.networks) {
          // For each network, get plans
          const plansByNetwork: Record<string, any[]> = {}
          
          for (const network of networksResult.networks) {
            try {
              const plansResult = await callPeyflexPublicApi("/api/data/plans/", {
                network: network.code || network.id
              })
              
              plansByNetwork[network.name] = plansResult.plans?.map((plan: any) => ({
                id: plan.code || plan.id,
                name: plan.name,
                amount: plan.amount,
                ngnPrice: plan.amount,
                network: network.name,
              })) || []
            } catch (planError) {
              plansByNetwork[network.name] = []
            }
          }
          
          cachedDataPlans = {
            networks: networksResult.networks.map((n: any) => n.name),
            plansByNetwork
          }
          
          lastDataPlansFetch = now
          updated = true
        }
      } catch (err) {
        // Silently fail and use cached data
      }
    }

    const data = cachedDataPlans || { networks: [], plansByNetwork: {} }

    return NextResponse.json({
      success: true,
      networks: data.networks || [],
      plansByNetwork: data.plansByNetwork || {},
      allPlans: Object.values(data.plansByNetwork || {}).flat(),
      updated,
      fromApi: true,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      networks: [],
      plansByNetwork: {},
      allPlans: [],
      updated: false,
      fromApi: false,
    })
  }
}