/**
 * RecentEarthquakeTable — tabel 15 gempa terkini dengan warna risiko.
 */

import React from 'react'
import { RISK_CONFIG, getMagnitudeColor } from '../utils/formatters'

export default function RecentEarthquakeTable({ data, loading }) {
  if (loading && data.length === 0) {
    return (
      <div className="rounded-2xl p-6 bg-gray-900 border border-gray-700 animate-pulse h-40 flex items-center justify-center">
        <span className="text-gray-500 text-sm">Memuat riwayat gempa...</span>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gray-900/80 border border-gray-700 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-300">
          📋 15 Gempa Terkini (M ≥ 5.0) — BMKG
        </h3>
        <span className="text-xs text-gray-600">Refresh tiap 60 detik</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500">
              <th className="text-left px-4 py-2.5 font-medium">Waktu</th>
              <th className="text-center px-3 py-2.5 font-medium">Mag</th>
              <th className="text-center px-3 py-2.5 font-medium">Kedalaman</th>
              <th className="text-left px-3 py-2.5 font-medium">Wilayah</th>
              <th className="text-center px-3 py-2.5 font-medium">Tsunami</th>
              <th className="text-center px-3 py-2.5 font-medium">Risiko RF</th>
            </tr>
          </thead>
          <tbody>
            {data.map((quake, i) => {
              const pred = quake.prediction || {}
              const riskCfg = RISK_CONFIG[pred.risiko] || RISK_CONFIG['Rendah']
              const magColor = getMagnitudeColor(quake.magnitude)

              return (
                <tr
                  key={quake.datetime_iso || i}
                  className="border-b border-gray-800/60 hover:bg-gray-800/40 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">
                    {quake.tanggal} {quake.jam}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className="font-bold tabular-nums" style={{ color: magColor }}>
                      {quake.magnitude?.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center text-gray-300">
                    {quake.kedalaman_km} km
                  </td>
                  <td className="px-3 py-2.5 text-gray-300 max-w-xs truncate">
                    {quake.wilayah}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    {quake.tsunami ? (
                      <span className="text-red-400 font-bold">⚠️ Ya</span>
                    ) : (
                      <span className="text-gray-600">Tidak</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: riskCfg.color + '22',
                        color: riskCfg.color,
                        border: `1px solid ${riskCfg.color}44`,
                      }}
                    >
                      {riskCfg.emoji} {pred.risiko}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
