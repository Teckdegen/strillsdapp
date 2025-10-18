import { type NextRequest, NextResponse } from "next/server"
import { generateRequestId } from "@/lib/utils/request-id"
import { callBillApi } from "@/lib/utils/api-client"

export async function POST(request: NextRequest) {
  try {
    const { meterNumber, providerCode, providerPlanCode } = await request.json()

    if (!meterNumber || !providerCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const requestId = generateRequestId()

    const result = await callBillApi("/Electricity/verifyCustomer", {
      meterNumber,
      providerCode,
      providerPlanCode: providerPlanCode || "prepaid",
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Verification failed" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      customerName: result.customerName || "Customer",
      meterNumber,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify meter" }, { status: 500 })
  }
}
