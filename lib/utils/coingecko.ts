export async function getNGNtoUSDRate(): Promise<number> {
  try {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=ngn", {
      headers: { Accept: "application/json" },
    })

    if (!response.ok) {
      console.warn("CoinGecko API returned status:", response.status)
      return 1650 // Fallback rate
    }

    const data = await response.json()

    if (!data.tether || !data.tether.ngn) {
      console.warn("Invalid CoinGecko response structure")
      return 1650 // Fallback rate
    }

    return data.tether.ngn
  } catch (error) {
    console.warn("Failed to fetch NGN/USD rate, using fallback:", error)
    return 1650 // Fallback rate (approximately 1 USD = 1650 NGN)
  }
}

export function convertNGNtoUSD(ngnAmount: number, ngnToUsdRate: number): number {
  if (!ngnToUsdRate || ngnToUsdRate <= 0) return 0
  return Math.round((ngnAmount / ngnToUsdRate) * 100) / 100
}
