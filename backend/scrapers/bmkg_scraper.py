"""
BMKG Scraper — mengambil data gempa bumi real-time dari API resmi BMKG.

Endpoints yang digunakan:
  - autogempa.json   → 1 gempa terbaru (update setiap ada gempa baru)
  - gempaterkini.json → 15 gempa terbaru signifikan (M ≥ 5.0)

Source: https://data.bmkg.go.id/DataMKG/TEWS/
"""

import httpx
from datetime import datetime

BASE_URL = "https://data.bmkg.go.id/DataMKG/TEWS"
SHAKEMAP_BASE = "https://data.bmkg.go.id/DataMKG/TEWS/"

HEADERS = {
    "User-Agent": "IOT-EarthquakeDashboard/1.0 (Academic Project)",
    "Accept": "application/json",
}


def _parse_gempa(raw: dict) -> dict:
    """
    Normalisasi satu objek gempa dari BMKG ke format standar internal.
    Field-field BMKG yang di-parse:
      Tanggal, Jam, DateTime, Coordinates, Lintang, Bujur,
      Magnitude, Kedalaman, Wilayah, Potensi, Dirasakan, Shakemap
    """
    # Koordinat: "lat,lon" sebagai string
    coords = raw.get("Coordinates", "0,0").split(",")
    lat = float(coords[0]) if len(coords) >= 1 else 0.0
    lon = float(coords[1]) if len(coords) >= 2 else 0.0

    # Kedalaman: "10 km" → 10
    kedalaman_raw = raw.get("Kedalaman", "0 km").replace("km", "").strip()
    kedalaman = float(kedalaman_raw) if kedalaman_raw.replace(".", "").isdigit() else 0.0

    potensi_raw = raw.get("Potensi", "").lower()
    tsunami = "tsunami" in potensi_raw and "tidak" not in potensi_raw

    return {
        "tanggal": raw.get("Tanggal", ""),
        "jam": raw.get("Jam", ""),
        "datetime_iso": raw.get("DateTime", ""),
        "latitude": lat,
        "longitude": lon,
        "lintang": raw.get("Lintang", ""),
        "bujur": raw.get("Bujur", ""),
        "magnitude": float(raw.get("Magnitude", 0)),
        "kedalaman_km": kedalaman,
        "wilayah": raw.get("Wilayah", "-"),
        "potensi": raw.get("Potensi", "-"),
        "tsunami": tsunami,
        "dirasakan": raw.get("Dirasakan", "-"),
        "shakemap_url": SHAKEMAP_BASE + raw.get("Shakemap", "") if raw.get("Shakemap") else None,
        "scraped_at": datetime.utcnow().isoformat() + "Z",
    }


async def fetch_latest() -> dict | None:
    """Ambil 1 gempa terbaru dari BMKG (autogempa.json)."""
    url = f"{BASE_URL}/autogempa.json"
    try:
        async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            raw = data["Infogempa"]["gempa"]
            return _parse_gempa(raw)
    except Exception as e:
        print(f"[BMKG] Error fetch_latest: {e}")
        return None


async def fetch_recent(limit: int = 15) -> list[dict]:
    """Ambil 15 gempa terkini signifikan dari BMKG (gempaterkini.json)."""
    url = f"{BASE_URL}/gempaterkini.json"
    try:
        async with httpx.AsyncClient(timeout=10.0, headers=HEADERS) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            raw_list = data["Infogempa"]["gempa"]
            return [_parse_gempa(g) for g in raw_list[:limit]]
    except Exception as e:
        print(f"[BMKG] Error fetch_recent: {e}")
        return []
