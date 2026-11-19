/**
 * MagnitudeChart — bar chart magnitudo dari 15 gempa terkini.
 * Warna bar disesuaikan dengan tingkat risiko prediksi RF.
 */

import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts'
import { RISK_CONFIG } from '../utils/formatters'

export default function MagnitudeChart({ data }) {
  if (!data || data.length === 0) return null

  const chartData = [...data]
    .reverse()
    .map((q) => ({
      label: q.wilayah?.split(' ').slice(-2).join(' ') ?? '-',
      magnitude: q.magnitude,
      risiko: q.prediction?.risiko ?? 'Rendah',
      wilayah: q.wilayah,
      waktu: `${q.tanggal} ${q.jam}`,
    }))

  return (
    <div className="rounded-2xl p-5 bg-gray-900/80 border border-gray-700">
      <h3 className="text-sm text-gray-400 font-medium mb-4">
        📊 Magnitudo 15 Gempa Terkini
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7280', fontSize: 9 }}
            interval={0}
            angle={-40}
            textAnchor="end"
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 9]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={25}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              const cfg = RISK_CONFIG[d.risiko] || RISK_CONFIG['Rendah']
              return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs max-w-xs shadow-lg">
                  <div className="font-medium text-white mb-1">M {d.magnitude}</div>
                  <div className="text-gray-300 mb-1">{d.wilayah}</div>
                  <div className="text-gray-400 mb-1">{d.waktu}</div>
                  <span style={{ color: cfg.color }}>{cfg.emoji} Risiko {d.risiko}</span>
                </div>
              )
            }}
          />
          {/* Garis referensi M5 dan M7 */}
          <ReferenceLine y={5} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={7} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Bar dataKey="magnitude" radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {chartData.map((entry, i) => {
              const cfg = RISK_CONFIG[entry.risiko] || RISK_CONFIG['Rendah']
              return <Cell key={i} fill={cfg.color} fillOpacity={0.8} />
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center text-xs text-gray-600 mt-1">
        <span>— M5.0 (batas signifikan)</span>
        <span>— M7.0 (batas besar)</span>
      </div>
    </div>
  )
}
