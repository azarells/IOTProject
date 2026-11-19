"""
FastAPI Backend — IOT Earthquake Risk Monitor Dashboard

Sumber data: BMKG (data.bmkg.go.id) — data gempa resmi Indonesia
ML Model   : Random Forest → prediksi tingkat risiko (Rendah/Sedang/Tinggi/Kritis)

Endpoints:
  GET /                   → health check
  GET /api/latest         → gempa terbaru + prediksi RF
  GET /api/recent         → 15 gempa terkini + prediksi masing-masing
  GET /api/model-info     → info model & feature importance
  WS  /ws                 → stream real-time (polling BMKG tiap 30 detik)
"""

import asyncio
import sys
from pathlib import Path
from collections import deque

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from scrapers.bmkg_scraper import fetch_latest, fetch_recent
from ml.rf_model import predict, get_model, FEATURE_NAMES, LABEL_NAMES

app = FastAPI(
    title="IOT Earthquake Risk Monitor",
    description="Dashboard monitoring gempa bumi real-time BMKG dengan prediksi risiko Random Forest",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache gempa terakhir (agar tidak spam BMKG setiap request)
_cache_latest: dict | None = None
_cache_recent: list[dict] = []
_last_fetch_time: float = 0.0
CACHE_TTL = 30  # detik

active_ws: list[WebSocket] = []


# ── Helpers ────────────────────────────────────────────────────────────────────

def _enrich_with_prediction(gempa: dict) -> dict:
    """Tambahkan prediksi RF ke objek gempa."""
    pred = predict(
        magnitude=gempa["magnitude"],
        kedalaman_km=gempa["kedalaman_km"],
        tsunami=gempa["tsunami"],
    )
    return {**gempa, "prediction": pred}


async def _refresh_cache():
    """Ambil data terbaru dari BMKG dan perbarui cache."""
    global _cache_latest, _cache_recent, _last_fetch_time
    import time
    if time.time() - _last_fetch_time < CACHE_TTL:
        return  # masih fresh

    latest = await fetch_latest()
    recent = await fetch_recent()

    if latest:
        _cache_latest = _enrich_with_prediction(latest)
    if recent:
        _cache_recent = [_enrich_with_prediction(g) for g in recent]

    _last_fetch_time = time.time()
    print(f"[Cache] Diperbarui — {len(_cache_recent)} gempa terkini")


# ── REST Endpoints ─────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "IOT Earthquake Risk Monitor",
        "source": "BMKG Indonesia",
    }


@app.get("/api/latest")
async def get_latest():
    """Gempa terbaru dari BMKG beserta prediksi risiko Random Forest."""
    await _refresh_cache()
    if not _cache_latest:
        return {"error": "Data BMKG tidak tersedia saat ini"}
    return _cache_latest


@app.get("/api/recent")
async def get_recent():
    """15 gempa terkini beserta prediksi risiko masing-masing."""
    await _refresh_cache()
    return _cache_recent


@app.get("/api/model-info")
async def model_info():
    """Informasi model Random Forest dan feature importance."""
    model = get_model()
    importances = {
        name: round(float(imp), 4)
        for name, imp in zip(FEATURE_NAMES, model.feature_importances_)
    }
    return {
        "model": "Random Forest Classifier",
        "n_estimators": model.n_estimators,
        "max_depth": model.max_depth,
        "features": FEATURE_NAMES,
        "feature_importance": importances,
        "labels": LABEL_NAMES,
        "source": "data.bmkg.go.id",
    }


# ── WebSocket ──────────────────────────────────────────────────────────────────

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Stream data gempa real-time.
    Kirim snapshot ke client setiap 30 detik (sinkron dengan BMKG refresh rate).
    Jika ada gempa baru (berbeda dari sebelumnya), tandai sebagai 'new_event'.
    """
    await websocket.accept()
    active_ws.append(websocket)
    last_datetime = None

    try:
        while True:
            await _refresh_cache()

            if _cache_latest:
                payload = dict(_cache_latest)
                # Tandai jika ini gempa baru (beda dengan pengiriman sebelumnya)
                payload["is_new_event"] = (
                    payload.get("datetime_iso") != last_datetime
                )
                last_datetime = payload.get("datetime_iso")
                await websocket.send_text(json.dumps(payload))

            await asyncio.sleep(30)

    except WebSocketDisconnect:
        active_ws.remove(websocket)
    except Exception as e:
        print(f"[WS] Error: {e}")
        if websocket in active_ws:
            active_ws.remove(websocket)


# ── Entry ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
