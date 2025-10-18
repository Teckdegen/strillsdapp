import { type NextRequest, NextResponse } from "next/server"
import { generateRequestId } from "@/lib/utils/request-id"
import { callBillApi } from "@/lib/utils/api-client"

export async function POST(request: NextRequest) {
  try {
    const { smartCardNumber, providerCode, providerPlanCode } = await request.json()

    if (!smartCardNumber || !providerCode || !providerPlanCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const requestId = generateRequestId()

    const result = await callBillApi("/CableTV/verifyCustomer", {
      smartCardNumber,
      providerCode,
      providerPlanCode,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Verification failed" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      customerName: result.customerName || "Customer",
      smartCardNumber,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify smartcard" }, { status: 500 })
  }
}
