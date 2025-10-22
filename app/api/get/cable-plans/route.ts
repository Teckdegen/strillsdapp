import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexApiWithParams } from "@/lib/utils/api-client"

let cachedCableData: any = null
let lastCableFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastCableFetch > 60000) {
      try {
        // First get providers
        const providersResult = await callPeyflexApiWithParams("/api/cable/providers/")
        
        if (providersResult && providersResult.providers) {
          // For each provider, get plans
          const plans: any[] = []
          
          for (const provider of providersResult.providers) {
            try {
              const plansResult = await callPeyflexApiWithParams(`/api/cable/plans/${provider.code || provider.id}/`)
              
              const providerPlans = plansResult.plans?.map((plan: any) => ({
                id: plan.code || plan.id,
                name: plan.name,
                amount: plan.amount,
                ngnPrice: plan.amount,
                provider: provider.name,
              })) || []
              
              plans.push(...providerPlans)
            } catch (planError) {
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
    return NextResponse.json({
      success: true,
      providers: [],
      plans: [],
      updated: false,
      fromApi: false,
    })
  }
}