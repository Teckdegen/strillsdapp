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
  options: { pollInterval?: number; fallbackData?: T } = {},
) {
  const { pollInterval = 60000, fallbackData } = options
  const [data, setData] = useState<T | undefined>(fallbackData)
  const [loading, setLoading] = useState(!fallbackData)
  const [error, setError] = useState<string>("")
  const pollTimeoutRef = useRef<NodeJS.Timeout>()
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

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

    // Poll at specified interval
    pollTimeoutRef.current = setInterval(fetchData, pollInterval)

    return () => {
      isMountedRef.current = false
      if (pollTimeoutRef.current) {
        clearInterval(pollTimeoutRef.current)
      }
    }
  }, [key, fetchFn, pollInterval, fallbackData])

  return { data, loading, error }
}
