import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexPublicApi } from "@/lib/utils/api-client"

export async function POST(request: NextRequest) {
  try {
    const { meterNumber, providerCode, providerPlanCode, meterType } = await request.json()

    if (!meterNumber || !providerCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await callPeyflexPublicApi("/api/electricity/verify/", {
      identifier: "electricity",
      meter: meterNumber,
      plan: providerCode,
      type: meterType || providerPlanCode || "prepaid"
    })

    // Peyflex API may return customer details in a different format
    // We'll need to adapt this based on the actual response structure
    return NextResponse.json({
      success: true,
      customerName: result.customerName || result.name || "Customer",
      meterNumber,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify meter" }, { status: 500 })
  }
}