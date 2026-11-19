/**
 * Dashboard — Halaman utama IOT Earthquake Risk Monitor.
 *
 * Layout:
 *   - Header + status koneksi live
 *   - Kartu gempa terbaru + prediksi RF (realtime WS)
 *   - Statistik ringkasan 15 gempa terkini
 *   - Chart magnitudo 15 gempa
 *   - Feature importance RF
 *   - Tabel 15 gempa terkini
 */

import React from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useRecentEarthquakes } from '../hooks/useRecentEarthquakes'
import LatestEarthquake from '../components/LatestEarthquake'
import StatsSummary from '../components/StatsSummary'
import MagnitudeChart from '../components/MagnitudeChart'
import FeatureImportanceChart from '../components/FeatureImportanceChart'
import RecentEarthquakeTable from '../components/RecentEarthquakeTable'
import ConnectionStatus from '../components/ConnectionStatus'

export default function Dashboard() {
  const { latest, connected, isNewEvent } = useWebSocket()
  const { data: recent, loading } = useRecentEarthquakes()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 10% 10%, rgba(249,115,22,0.05) 0%, transparent 50%), ' +
            'radial-gradient(ellipse at 90% 90%, rgba(239,68,68,0.04) 0%, transparent 50%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* ── Header ── */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              🌏 Earthquake Risk Monitor
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Data Real-Time BMKG Indonesia · Prediksi Risiko Random Forest
            </p>
          </div>
          <ConnectionStatus connected={connected} lastUpdate={latest?.datetime_iso} />
        </header>

        {/* ── Gempa Terbaru (Live WS) ── */}
        <LatestEarthquake data={latest} isNew={isNewEvent} />

        {/* ── Statistik 15 Gempa ── */}
        <StatsSummary data={recent} />

        {/* ── Chart Magnitudo + Feature Importance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <MagnitudeChart data={recent} />
          </div>
          <div className="lg:col-span-2">
            <FeatureImportanceChart
              featureImportance={latest?.prediction?.feature_importance}
            />
          </div>
        </div>

        {/* ── Tabel 15 Gempa Terkini ── */}
        <RecentEarthquakeTable data={recent} loading={loading} />

        {/* ── Footer ── */}
        <footer className="text-center text-gray-700 text-xs pb-4 space-y-1">
          <div>
            Sumber data: <a href="https://data.bmkg.go.id" target="_blank" rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-400 transition-colors">BMKG Indonesia</a>
            {' '}· Random Forest Classifier · FastAPI + WebSocket · React
          </div>
          <div>⚠️ Dashboard ini untuk keperluan akademis. Ikuti arahan resmi BMKG untuk evakuasi.</div>
        </footer>

      </div>
    </div>
  )
}
