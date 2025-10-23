"use client"

import { useState, useEffect, useRef } from "react"

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<any>>()

export function useApiCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: { pollInterval?: number; fallbackData?: T; enabled?: boolean } = {},
) {
  const { pollInterval = 300000, fallbackData, enabled = true } = options // Increased default to 5 minutes (300000ms) and added enabled flag
  const [data, setData] = useState<T | undefined>(fallbackData)
  const [loading, setLoading] = useState(!fallbackData && enabled)
  const [error, setError] = useState<string>("")
  const pollTimeoutRef = useRef<NodeJS.Timeout>()
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    // Don't fetch if not enabled
    if (!enabled) {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        const result = await fetchFn()

        if (isMountedRef.current) {
          cache.set(key, {
            data: result,
            timestamp: Date.now(),
          })
          setData(result)
          setError("")
          setLoading(false)
        }
      } catch (err: any) {
        if (isMountedRef.current) {
          const cached = cache.get(key)
          if (cached?.data) {
            setData(cached.data)
          } else if (fallbackData) {
            setData(fallbackData)
          }
          if (!fallbackData && !cached?.data) {
            setError(err.message || "Failed to fetch data")
          }
          setLoading(false)
        }
      }
    }

    // Initial fetch
    fetchData()

    // Poll at specified interval (5 minutes by default, only if enabled)
    if (pollInterval > 0) {
      pollTimeoutRef.current = setInterval(fetchData, pollInterval)
    }

    return () => {
      isMountedRef.current = false
      if (pollTimeoutRef.current) {
        clearInterval(pollTimeoutRef.current)
      }
    }
  }, [key, fetchFn, pollInterval, fallbackData, enabled])

  return { data, loading, error }
}