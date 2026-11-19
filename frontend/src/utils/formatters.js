/**
 * Utility — formatting & konfigurasi tampilan untuk dashboard gempa.
 */

export const RISK_CONFIG = {
  Rendah: {
    color: '#22c55e',
    bg: 'bg-green-500/20',
    border: 'border-green-500',
    text: 'text-green-400',
    emoji: '🟢',
    description: 'Gempa kecil, dampak minimal',
  },
  Sedang: {
    color: '#f59e0b',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500',
    text: 'text-yellow-400',
    emoji: '🟡',
    description: 'Perlu kewaspadaan, cek kondisi sekitar',
  },
  Tinggi: {
    color: '#f97316',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500',
    text: 'text-orange-400',
    emoji: '🟠',
    description: 'Gempa kuat, potensi kerusakan',
  },
  Kritis: {
    color: '#ef4444',
    bg: 'bg-red-500/20',
    border: 'border-red-500',
    text: 'text-red-400',
    emoji: '🔴',
    description: 'SANGAT BERBAHAYA — potensi bencana besar',
  },
}

export const FEATURE_CONFIG = {
  magnitude: { label: 'Magnitudo', icon: '📊', color: '#f97316', unit: 'SR' },
  kedalaman_km: { label: 'Kedalaman', icon: '⬇️', color: '#38bdf8', unit: 'km' },
  tsunami: { label: 'Potensi Tsunami', icon: '🌊', color: '#a78bfa', unit: '' },
}

export function formatTime(isoString) {
  if (!isoString) return '--:--'
  try {
    return new Date(isoString).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Jakarta',
    }) + ' WIB'
  } catch {
    return isoString
  }
}

export function getMagnitudeColor(mag) {
  if (mag < 3) return '#22c55e'
  if (mag < 5) return '#f59e0b'
  if (mag < 7) return '#f97316'
  return '#ef4444'
}

export function getMagnitudeLabel(mag) {
  if (mag < 3) return 'Mikro'
  if (mag < 4) return 'Kecil'
  if (mag < 5) return 'Ringan'
  if (mag < 6) return 'Sedang'
  if (mag < 7) return 'Kuat'
  if (mag < 8) return 'Besar'
  return 'Dahsyat'
}
