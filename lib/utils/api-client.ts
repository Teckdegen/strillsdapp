// The SECRET_KEY should never be exposed to the client

const API_BASE_URL = process.env.BASE_URL || "https://api.example.com"

interface ApiHeaders {
  "Content-Type": string
  Authorization: string
}

export function getApiHeaders(): ApiHeaders {
  const secretKey = process.env.SECRET_KEY
  if (!secretKey) {
    throw new Error("SECRET_KEY environment variable is not set")
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${secretKey}`,
  }
}

export async function callBillApi(endpoint: string, payload: any) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({
        ...payload,
        appId: process.env.APP_ID,
        businessCode: process.env.BUSINESS_CODE,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Bill API call failed:", error)
    throw error
  }
}
