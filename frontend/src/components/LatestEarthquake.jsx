/**
 * LatestEarthquake — kartu utama gempa terbaru dari BMKG.
 * Menampilkan semua field penting + prediksi RF + shakemap link.
 */

import React from 'react'
import { RISK_CONFIG, getMagnitudeColor, getMagnitudeLabel, formatTime } from '../utils/formatters'

export default function LatestEarthquake({ data, isNew }) {
  if (!data) {
    return (
      <div className="rounded-2xl p-8 bg-gray-900 border border-gray-700 animate-pulse flex items-center justify-center h-48">
        <span className="text-gray-500">Memuat data BMKG...</span>
      </div>
    )
  }

  const pred = data.prediction || {}
  const riskCfg = RISK_CONFIG[pred.risiko] || RISK_CONFIG['Rendah']
  const magColor = getMagnitudeColor(data.magnitude)

  return (
    <div
      className={`rounded-2xl border transition-all duration-500 overflow-hidden ${riskCfg.border} ${riskCfg.bg} ${isNew ? 'ring-2 ring-offset-2 ring-offset-gray-950 ring-white/20' : ''}`}
    >
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌏</span>
          <span className="text-sm font-semibold text-gray-200">Gempa Terbaru — BMKG</span>
        </div>
        <div className="flex items-center gap-3">
          {isNew && (
            <span className="text-xs bg-blue-500/30 text-blue-300 border border-blue-500/50 px-2 py-0.5 rounded-full animate-pulse">
              ✨ Baru
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium`}
            style={{ background: riskCfg.color + '33', color: riskCfg.color }}>
            {riskCfg.emoji} {pred.risiko}
          </span>
        </div>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Kiri: info gempa */}
        <div className="space-y-3">
          {/* Magnitudo besar */}
          <div className="flex items-end gap-2">
            <span className="text-6xl font-black tabular-nums" style={{ color: magColor }}>
              {data.magnitude?.toFixed(1)}
            </span>
            <div className="mb-2">
              <div className="text-xs text-gray-500">Magnitudo (SR)</div>
              <div className="text-sm font-medium" style={{ color: magColor }}>
                {getMagnitudeLabel(data.magnitude)}
              </div>
            </div>
          </div>

          {/* Detail */}
          <div className="space-y-1.5 text-sm">
            <Row icon="⬇️" label="Kedalaman" value={`${data.kedalaman_km} km`} />
            <Row icon="📍" label="Lokasi" value={data.wilayah} />
            <Row icon="🕐" label="Waktu" value={`${data.tanggal} ${data.jam}`} />
            <Row icon="🌊" label="Tsunami"
              value={data.tsunami ? 'BERPOTENSI' : 'Tidak berpotensi'}
              valueClass={data.tsunami ? 'text-red-400 font-bold' : 'text-gray-300'}
            />
            {data.dirasakan && data.dirasakan !== '-' && (
              <Row icon="📡" label="Dirasakan" value={data.dirasakan} />
            )}
          </div>

          {data.shakemap_url && (
            <a
              href={data.shakemap_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
            >
              🗺️ Lihat Shakemap BMKG ↗
            </a>
          )}
        </div>

        {/* Kanan: prediksi RF */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
              Prediksi Random Forest
            </p>
            <div className={`text-2xl font-bold ${riskCfg.text}`}>
              {riskCfg.emoji} Risiko {pred.risiko}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{riskCfg.description}</div>
          </div>

          {/* Confidence */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">Kepercayaan model</span>
              <span className={riskCfg.text}>{pred.confidence}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${pred.confidence}%`, background: riskCfg.color }}
              />
            </div>
          </div>

          {/* Probabilitas per kelas */}
          {pred.probabilities && (
            <div className="space-y-1.5">
              {Object.entries(pred.probabilities).map(([label, prob]) => {
                const c = RISK_CONFIG[label]
                return (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-14">{label}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${prob}%`, background: c?.color ?? '#666' }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-9 text-right">{prob}%</span>
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-xs text-gray-600">
            Fitur: Magnitudo · Kedalaman · Potensi Tsunami
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({ icon, label, value, valueClass = 'text-gray-200' }) {
  return (
    <div className="flex gap-2">
      <span className="w-5 text-center flex-shrink-0">{icon}</span>
      <span className="text-gray-500 flex-shrink-0 w-24">{label}</span>
      <span className={`${valueClass} flex-1`}>{value}</span>
    </div>
  )
}
