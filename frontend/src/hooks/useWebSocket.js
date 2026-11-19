/**
 * useWebSocket — koneksi ke backend WebSocket untuk stream data gempa BMKG.
 * Auto-reconnect setiap 5 detik jika koneksi putus.
 * Data baru dari BMKG datang setiap ~30 detik.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = 'ws://localhost:8000/ws'

export function useWebSocket() {
  const [latest, setLatest] = useState(null)
  const [connected, setConnected] = useState(false)
  const [isNewEvent, setIsNewEvent] = useState(false)
  const wsRef = useRef(null)
  const retryRef = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      clearTimeout(retryRef.current)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLatest(data)
        setIsNewEvent(data.is_new_event === true)
      } catch (e) {
        console.error('[WS] Parse error:', e)
      }
    }

    ws.onclose = () => {
      setConnected(false)
      retryRef.current = setTimeout(connect, 5000)
    }

    ws.onerror = () => ws.close()
  }, [])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  return { latest, connected, isNewEvent }
}
