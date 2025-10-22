// Peyflex API Client
// Authentication: Bearer token in Authorization header

const API_BASE_URL = "https://client.peyflex.com.ng"

interface ApiHeaders {
  "Content-Type": string
  Authorization: string
}

export function getApiHeaders(): ApiHeaders {
  const apiKey = process.env.PEYFLEX_API_KEY
  if (!apiKey) {
    throw new Error("PEYFLEX_API_KEY environment variable is not set")
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Token ${apiKey}`,
  }
}

// Function to call Peyflex API
export async function callPeyflexApi(endpoint: string, payload: any = {}, method: string = "POST") {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    
    const config: RequestInit = {
      method,
      headers: getApiHeaders(),
    }

    if (method === "POST" && payload) {
      config.body = JSON.stringify(payload)
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Peyflex API call failed:", error)
    throw error
  }
}

// Function to call Peyflex API with query parameters (for GET requests)
export async function callPeyflexApiWithParams(endpoint: string, params: Record<string, string> = {}) {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`)
    
    // Add query parameters
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: getApiHeaders(),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Peyflex API call failed:", error)
    throw error
  }
}