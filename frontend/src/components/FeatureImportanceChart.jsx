/**
 * FeatureImportanceChart — bar chart horizontal feature importance dari RF model gempa.
 */

import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { FEATURE_CONFIG } from '../utils/formatters'

const COLORS = ['#f97316', '#38bdf8', '#a78bfa']

export default function FeatureImportanceChart({ featureImportance }) {
  if (!featureImportance) return null

  const data = Object.entries(featureImportance)
    .map(([key, value], i) => ({
      name: FEATURE_CONFIG[key]?.label ?? key,
      value: Math.round(value * 100),
      color: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="rounded-2xl p-5 bg-gray-900/80 border border-gray-700">
      <h3 className="text-sm text-gray-400 font-medium mb-1">
        🌲 Feature Importance — Random Forest
      </h3>
      <p className="text-xs text-gray-600 mb-4">
        Kontribusi tiap fitur terhadap prediksi tingkat risiko gempa
      </p>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 40 }}>
          <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`}
            tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name"
            tick={{ fill: '#d1d5db', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
          <Tooltip
            formatter={(v) => [`${v}%`, 'Kontribusi']}
            contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#f9fafb' }}
          />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} isAnimationActive={false}
            label={{ position: 'right', fill: '#9ca3af', fontSize: 11, formatter: v => `${v}%` }}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
