// Peyflex API Client
// Authentication: Bearer token in Authorization header

import axios from 'axios'

const API_BASE_URL = "https://client.peyflex.com.ng"

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to add authorization header when API key is available
apiClient.interceptors.request.use(
  (config) => {
    const apiKey = process.env.PEYFLEX_API_KEY
    if (apiKey) {
      config.headers.Authorization = `Token ${apiKey}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Function to call Peyflex API with authentication (for endpoints that require API key)
export async function callPeyflexApi(endpoint: string, payload: any = {}, method: string = "POST") {
  try {
    const config: any = {
      method,
      url: endpoint,
    }

    if (method === "POST" && payload) {
      config.data = payload
    }

    const response = await apiClient(config)
    return response.data
  } catch (error) {
    console.error("Peyflex API call failed:", error)
    throw error
  }
}

// Function to call Peyflex API without authentication (for public endpoints)
export async function callPeyflexPublicApi(endpoint: string, params: Record<string, string> = {}, method: string = "GET") {
  try {
    const config: any = {
      method,
      url: endpoint,
      headers: {}, // No authorization header for public endpoints
    }

    if (Object.keys(params).length > 0) {
      if (method === "GET") {
        config.params = params
      } else {
        config.data = params
      }
    }

    const response = await axios(config)
    return response.data
  } catch (error) {
    console.error("Peyflex Public API call failed:", error)
    throw error
  }
}

// Function to call Peyflex API with query parameters (for GET requests that require API key)
export async function callPeyflexApiWithParams(endpoint: string, params: Record<string, string> = {}) {
  try {
    const response = await apiClient.get(endpoint, { params })
    return response.data
  } catch (error) {
    console.error("Peyflex API call failed:", error)
    throw error
  }
}