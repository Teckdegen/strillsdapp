import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexPublicApi } from "@/lib/utils/api-client"

let cachedNetworks: any = null
let cachedPlansByNetwork: Record<string, any[]> = {}
let lastNetworksFetch = 0
let lastPlansFetch: Record<string, number> = {}

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    
    // Always fetch networks (with caching)
    if (now - lastNetworksFetch > 60000) {
      try {
        const networksResult = await callPeyflexPublicApi("/api/data/networks/")
        
        if (networksResult && networksResult.networks) {
          cachedNetworks = networksResult
          lastNetworksFetch = now
          updated = true
        }
      } catch (err) {
        console.error("Error fetching data networks:", err)
      }
    }

    const networks = cachedNetworks?.networks || []

    return NextResponse.json({
      success: true,
      networks: networks.map((n: any) => ({
        id: n.code || n.id,
        name: n.name,
        code: n.code || n.id,
      })) || [],
      updated,
      fromApi: true,
    })
  } catch (error: any) {
    console.error("Data networks API error:", error)
    return NextResponse.json({
      success: true,
      networks: [],
      updated: false,
      fromApi: false,
    })
  }
}

// New endpoint to get plans for a specific network
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const network = searchParams.get('network')
  
  if (!network) {
    return NextResponse.json({
      success: false,
      plans: [],
      error: "Network parameter is required"
    })
  }

  let updated = false
  try {
    const now = Date.now()
    
    // Fetch plans for specific network (with caching)
    if (!lastPlansFetch[network] || now - lastPlansFetch[network] > 60000) {
      try {
        const plansResult = await callPeyflexPublicApi(`/api/data/plans/?network=${network}`)
        
        if (plansResult && plansResult.plans) {
          cachedPlansByNetwork[network] = plansResult.plans
          lastPlansFetch[network] = now
          updated = true
        }
      } catch (err) {
        console.error(`Error fetching plans for network ${network}:`, err)
      }
    }

    const plans = cachedPlansByNetwork[network] || []

    return NextResponse.json({
      success: true,
      plans: plans.map((plan: any) => ({
        id: plan.code || plan.id,
        name: plan.name,
        amount: plan.amount,
        ngnPrice: plan.amount,
      })) || [],
      updated,
      fromApi: true,
    })
  } catch (error: any) {
    console.error(`Data plans API error for network ${network}:`, error)
    return NextResponse.json({
      success: true,
      plans: [],
      updated: false,
      fromApi: false,
    })
  }
}