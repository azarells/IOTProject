/**
 * useRecentEarthquakes — fetch 15 gempa terkini dari REST API backend.
 * Refresh otomatis setiap 60 detik.
 */

import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000/api/recent'

export function useRecentEarthquakes() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60_000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading, error, refetch: fetchData }
}
