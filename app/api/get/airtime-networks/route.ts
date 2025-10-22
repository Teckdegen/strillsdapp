import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexApiWithParams } from "@/lib/utils/api-client"

let cachedAirtimeData: any = null
let lastAirtimeFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastAirtimeFetch > 60000) {
      try {
        const result = await callPeyflexApiWithParams("/api/airtime/networks/")
        
        if (result) {
          cachedAirtimeData = result
          lastAirtimeFetch = now
          updated = true
        }
      } catch (err) {
        // Silently fail and use cached data
      }
    }

    const data = cachedAirtimeData || { networks: [] }

    return NextResponse.json({
      success: true,
      networks: data.networks || [],
      updated,
      fromApi: true,
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      networks: [],
      updated: false,
      fromApi: false,
    })
  }
}