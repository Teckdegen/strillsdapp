import { type NextRequest, NextResponse } from "next/server"
import { callPeyflexPublicApi } from "@/lib/utils/api-client"

export async function POST(request: NextRequest) {
  try {
    const { smartCardNumber, providerCode } = await request.json()

    if (!smartCardNumber || !providerCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await callPeyflexPublicApi("/api/cable/verify/", {
      iuc: smartCardNumber,
      identifier: providerCode
    }, "POST")

    return NextResponse.json({
      success: true,
      customerName: result.customerName || result.name || "Customer",
      smartCardNumber,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify smartcard" }, { status: 500 })
  }
}