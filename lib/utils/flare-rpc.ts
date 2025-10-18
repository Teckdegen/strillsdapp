const FLARE_RPC_URL = "https://flare-api.flare.network/ext/C/rpc"

export async function getTransactionReceipt(txHash: string) {
  try {
    const response = await fetch(FLARE_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getTransactionReceipt",
        params: [txHash],
        id: 1,
      }),
    })

    const data = await response.json()
    return data.result
  } catch (error) {
    console.error("RPC call failed:", error)
    throw error
  }
}

export async function waitForTransactionConfirmation(
  txHash: string,
  maxAttempts = 30,
  delayMs = 2000,
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const receipt = await getTransactionReceipt(txHash)

    if (receipt) {
      return receipt.status === "0x1"
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs))
  }

  throw new Error("Transaction confirmation timeout")
}
