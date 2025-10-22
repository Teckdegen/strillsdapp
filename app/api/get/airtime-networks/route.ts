import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexPublicApi } from "@/lib/utils/api-client"

let cachedAirtimeData: any = null
let lastAirtimeFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastAirtimeFetch > 60000) {
      try {
        const result = await callPeyflexPublicApi("/api/airtime/networks/")
        
        if (result && result.networks) {
          cachedAirtimeData = result
          lastAirtimeFetch = now
          updated = true
        }
      } catch (err) {
        console.error("Error fetching airtime networks:", err)
        // Silently fail and use cached data
      }
    }

    const data = cachedAirtimeData || { networks: [] }

    return NextResponse.json({
      success: true,
      networks: data.networks?.map((n: any) => ({
        id: n.code || n.id,
        name: n.name,
        code: n.code || n.id,
      })) || [],
      updated,
      fromApi: true,
    })
  } catch (error: any) {
    console.error("Airtime networks API error:", error)
    return NextResponse.json({
      success: true,
      networks: [],
      updated: false,
      fromApi: false,
    })
  }
}