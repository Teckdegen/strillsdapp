import { type NextRequest, NextResponse } from "next/server"
import { waitForTransactionConfirmation } from "@/lib/utils/flare-rpc"
import { callPeyflexApi } from "@/lib/utils/api-client"

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

    let result
    switch (category) {
      case "airtime":
        result = await callPeyflexApi("/api/airtime/topup/", {
          network: userInputs.network,
          amount: ngnAmount,
          mobile_number: userInputs.phoneNumber
        })
        break
      case "data":
        result = await callPeyflexApi("/api/data/purchase/", {
          network: userInputs.network,
          mobile_number: userInputs.phoneNumber,
          plan_code: userInputs.planId
        })
        break
      case "cable":
        result = await callPeyflexApi("/api/cable/subscribe/", {
          identifier: userInputs.provider,
          plan: userInputs.planId,
          iuc: userInputs.smartCardNumber,
          phone: userInputs.phoneNumber,
          amount: ngnAmount.toString()
        })
        break
      case "electricity":
        result = await callPeyflexApi("/api/electricity/subscribe/", {
          identifier: "electricity",
          meter: userInputs.meterNumber,
          plan: userInputs.disco,
          amount: ngnAmount.toString(),
          type: userInputs.meterType,
          phone: userInputs.phoneNumber
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
      token: result.token || result.reference || result.transactionId,
      reference: result.reference || result.transactionId,
      message: result.message || "Payment successful",
    })
  } catch (error: any) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: error.message || "Payment processing failed" }, { status: 500 })
  }
}