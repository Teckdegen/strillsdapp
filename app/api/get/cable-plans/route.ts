import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexPublicApi } from "@/lib/utils/api-client"

let cachedCableData: any = null
let lastCableFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastCableFetch > 60000) {
      try {
        // First get providers
        const providersResult = await callPeyflexPublicApi("/api/cable/providers/")
        
        if (providersResult && providersResult.providers) {
          // For each provider, get plans
          const plans: any[] = []
          
          for (const provider of providersResult.providers) {
            try {
              // Get plans for this provider using the correct endpoint
              const plansResult = await callPeyflexPublicApi(`/api/cable/plans/${provider.code || provider.id}/`)
              
              const providerPlans = plansResult.plans?.map((plan: any) => ({
                id: plan.code || plan.id,
                name: plan.name,
                amount: plan.amount,
                ngnPrice: plan.amount,
                provider: provider.name,
              })) || []
              
              plans.push(...providerPlans)
            } catch (planError) {
              console.error(`Error fetching plans for provider ${provider.name}:`, planError)
              // Continue with other providers even if one fails
            }
          }
          
          cachedCableData = {
            providers: providersResult.providers.map((p: any) => ({
              id: p.code || p.id,
              name: p.name,
              code: p.code || p.id,
            })),
            plans
          }
          
          lastCableFetch = now
          updated = true
        }
      } catch (err) {
        console.error("Error fetching cable data:", err)
        // Silently fail and use cached data
      }
    }

    const data = cachedCableData || { providers: [], plans: [] }

    return NextResponse.json({
      success: true,
      providers: data.providers || [],
      plans: data.plans || [],
      updated,
      fromApi: true,
    })
  } catch (error: any) {
    console.error("Cable plans API error:", error)
    return NextResponse.json({
      success: true,
      providers: [],
      plans: [],
      updated: false,
      fromApi: false,
    })
  }
}