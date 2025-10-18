import { type NextRequest, NextResponse } from "next/server"
import { generateRequestId } from "@/lib/utils/request-id"
import { waitForTransactionConfirmation } from "@/lib/utils/flare-rpc"
import { callBillApi } from "@/lib/utils/api-client"

export async function POST(request: NextRequest) {
  try {
    const { category, txHash, userInputs, ngnAmount } = await request.json()

    if (!category || !txHash || !userInputs) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const isConfirmed = await waitForTransactionConfirmation(txHash)
    if (!isConfirmed) {
      return NextResponse.json({ error: "Transaction failed on blockchain" }, { status: 400 })
    }

    const requestId = generateRequestId()

    let result
    switch (category) {
      case "data":
        result = await callBillApi("/DataPurchase/buyData", {
          network: userInputs.network,
          providerPlanCode: userInputs.planId,
          phoneNumber: userInputs.phoneNumber,
          reference: requestId,
        })
        break
      case "airtime":
        result = await callBillApi("/Airtime/buyAirtime", {
          network: userInputs.network,
          phoneNumber: userInputs.phoneNumber,
          reference: requestId,
          amount: ngnAmount,
        })
        break
      case "electricity":
        result = await callBillApi("/Electricity/buyElectricity", {
          providerCode: userInputs.disco,
          providerPlanCode: userInputs.meterType,
          meterNumber: userInputs.meterNumber,
          customerName: userInputs.customerName,
          phoneNumber: userInputs.phoneNumber,
          reference: requestId,
          amount: ngnAmount,
        })
        break
      case "cable":
        result = await callBillApi("/CableTV/buyCableTV", {
          providerCode: userInputs.provider,
          providerPlanCode: userInputs.planId,
          phoneNumber: userInputs.phoneNumber,
          smartCardNumber: userInputs.smartCardNumber,
          customerName: userInputs.customerName,
          reference: requestId,
        })
        break
      default:
        return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Payment failed" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      token: result.token || result.reference || requestId,
      reference: result.reference || requestId,
      message: result.message || "Payment successful",
    })
  } catch (error: any) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: error.message || "Payment processing failed" }, { status: 500 })
  }
}
