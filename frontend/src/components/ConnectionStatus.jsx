/**
 * ConnectionStatus — indikator status koneksi WebSocket + sumber data.
 */

import React from 'react'

export default function ConnectionStatus({ connected, lastUpdate }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-3 h-3">
          <span className={`absolute w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          {connected && (
            <span className="absolute w-3 h-3 rounded-full bg-green-500 animate-ping opacity-60" />
          )}
        </div>
        <span className={connected ? 'text-green-400' : 'text-red-400'}>
          {connected ? 'LIVE' : 'Reconnecting...'}
        </span>
      </div>

      {lastUpdate && (
        <span className="text-gray-600 sm:before:content-['·'] sm:before:mr-1.5">
          Sumber: BMKG · Update tiap 30 detik
        </span>
      )}
    </div>
  )
}
