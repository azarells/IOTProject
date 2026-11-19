/**
 * StatsSummary — 4 kartu statistik ringkasan dari 15 gempa terkini.
 */

import React from 'react'
import { RISK_CONFIG } from '../utils/formatters'

export default function StatsSummary({ data }) {
  if (!data || data.length === 0) return null

  const magnitudes = data.map(q => q.magnitude)
  const maxMag = Math.max(...magnitudes)
  const avgMag = (magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length).toFixed(1)
  const tsunamiCount = data.filter(q => q.tsunami).length
  const riskCounts = { Rendah: 0, Sedang: 0, Tinggi: 0, Kritis: 0 }
  data.forEach(q => {
    const r = q.prediction?.risiko
    if (r && riskCounts[r] !== undefined) riskCounts[r]++
  })
  const topRisk = Object.entries(riskCounts).sort((a, b) => b[1] - a[1])[0]

  const stats = [
    { icon: '📊', label: 'Mag Tertinggi', value: maxMag.toFixed(1), sub: 'skala Richter', color: '#f97316' },
    { icon: '📈', label: 'Rata-rata Mag', value: avgMag, sub: 'dari 15 gempa', color: '#38bdf8' },
    { icon: '🌊', label: 'Potensi Tsunami', value: tsunamiCount, sub: 'gempa berisiko', color: '#a78bfa' },
    {
      icon: RISK_CONFIG[topRisk[0]]?.emoji ?? '⚡',
      label: 'Risiko Dominan',
      value: topRisk[0],
      sub: `${topRisk[1]} dari 15 gempa`,
      color: RISK_CONFIG[topRisk[0]]?.color ?? '#fff',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="rounded-2xl p-4 bg-gray-900/80 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{s.icon}</span>
            <span className="text-xs text-gray-500">{s.label}</span>
          </div>
          <div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>
            {s.value}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
        </div>
      ))}
    </div>
  )
}
