import { type NextRequest, NextResponse } from "next/server"
import { HARDCODED_DATA } from "@/lib/data/hardcoded-data"
import { generateRequestId } from "@/lib/utils/request-id"
import { callBillApi } from "@/lib/utils/api-client"

let cachedAirtimeData: any = null
let lastAirtimeFetch = 0

export async function POST(request: NextRequest) {
  let updated = false
  try {
    const now = Date.now()
    if (now - lastAirtimeFetch > 60000) {
      try {
        const requestId = generateRequestId()
        const result = await callBillApi("/Airtime/getAirtimeInfo", {})
        if (result?.data) {
          cachedAirtimeData = result
          lastAirtimeFetch = now
          updated = true
        }
      } catch (err) {
        // Silently fail and use cached/hardcoded data
      }
    }

    const data = cachedAirtimeData || HARDCODED_DATA.data
    const providers = data.data?.[0]?.providers || []

    return NextResponse.json({
      success: true,
      networks: providers.map((p: any) => p.name),
      updated,
      fromApi: true, // Indicate that this data is from the API
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      networks: HARDCODED_DATA.data.data[0].providers.map((p: any) => p.name),
      updated: false,
      fromApi: false, // Indicate that this data is from fallback
    })
  }
}
