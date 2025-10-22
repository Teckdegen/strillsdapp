// Peyflex API Client
// Authentication: Bearer token in Authorization header

import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

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
  (config: InternalAxiosRequestConfig) => {
    const apiKey = process.env.PEYFLEX_API_KEY
    if (apiKey && apiKey !== "your_actual_peyflex_api_key_here") {
      if (!config.headers) {
        config.headers = axios.AxiosHeaders.from({})
      }
      config.headers.set('Authorization', `Token ${apiKey}`)
    }
    return config
  },
  (error: any) => {
    return Promise.reject(error)
  }
)

// Function to call Peyflex API with authentication (for endpoints that require API key)
export async function callPeyflexApi(endpoint: string, payload: any = {}, method: string = "POST") {
  try {
    const config: AxiosRequestConfig = {
      method,
      url: endpoint,
    }

    if (method === "POST" && payload) {
      config.data = payload
    }

    const response = await apiClient(config)
    return response.data
  } catch (error: any) {
    console.error("Peyflex API call failed:", error)
    throw error
  }
}

// Function to call Peyflex API without authentication (for public endpoints)
export async function callPeyflexPublicApi(endpoint: string, params: Record<string, string> = {}, method: string = "GET") {
  try {
    // For public endpoints, use axios directly without authentication
    if (method === "GET" && Object.keys(params).length > 0) {
      // For GET requests with query parameters
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, { params })
      return response.data
    } else if (method === "POST" && Object.keys(params).length > 0) {
      // For POST requests with data
      const response = await axios.post(`${API_BASE_URL}${endpoint}`, params)
      return response.data
    } else {
      // For simple GET requests without parameters
      const response = await axios.get(`${API_BASE_URL}${endpoint}`)
      return response.data
    }
  } catch (error: any) {
    console.error("Peyflex Public API call failed:", error)
    throw error
  }
}

// Function to call Peyflex API with query parameters (for GET requests that require API key)
export async function callPeyflexApiWithParams(endpoint: string, params: Record<string, string> = {}) {
  try {
    const response = await apiClient.get(endpoint, { params })
    return response.data
  } catch (error: any) {
    console.error("Peyflex API call failed:", error)
    throw error
  }
}