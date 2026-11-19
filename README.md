# 🌏 IOT Earthquake Risk Monitor Dashboard

Dashboard monitoring gempa bumi **real-time** dari BMKG Indonesia dengan prediksi tingkat risiko menggunakan **Random Forest Classifier**.

---

## Konsep Project

**Tema:** Sistem monitoring gempa bumi berbasis IoT dengan machine learning.

**Sumber data:** API resmi BMKG (`data.bmkg.go.id`) — data gempa bumi Indonesia update real-time.

**Machine Learning (Random Forest):**
- Input fitur: **Magnitudo**, **Kedalaman (km)**, **Potensi Tsunami**
- Output: Tingkat risiko → `Rendah / Sedang / Tinggi / Kritis`
- Akurasi model: ~97% (dataset sintetis berlabel berbasis aturan domain)

**Stack:**
- **Backend:** Python FastAPI + WebSocket + scikit-learn
- **Frontend:** React + Vite + Tailwind CSS + Recharts

---

## Struktur Project

```
IOT Project/
├── backend/
│   ├── api/
│   │   └── main.py          # FastAPI + WebSocket server
│   ├── ml/
│   │   └── rf_model.py      # Random Forest model
│   ├── scrapers/
│   │   └── bmkg_scraper.py  # Scraper API BMKG
│   ├── venv/                # Python virtual environment
│   ├── requirements.txt
│   └── run.sh               # Script jalankan backend
│
└── frontend/
    ├── src/
    │   ├── components/      # Komponen UI
    │   ├── hooks/           # Custom React hooks (WebSocket, fetch)
    │   ├── pages/           # Dashboard page
    │   └── utils/           # Formatter & konfigurasi
    ├── package.json
    └── vite.config.js
```

---

## Cara Menjalankan

### 1. Backend (Terminal 1)

```bash
cd "IOT Project/backend"
bash run.sh
```

Atau manual:
```bash
cd "IOT Project/backend"
source venv/bin/activate
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend tersedia di: `http://localhost:8000`
API Docs (Swagger): `http://localhost:8000/docs`

### 2. Frontend (Terminal 2)

```bash
cd "IOT Project/frontend"
npm run dev
```

Dashboard tersedia di: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Health check |
| GET | `/api/latest` | Gempa terbaru + prediksi RF |
| GET | `/api/recent` | 15 gempa terkini + prediksi masing-masing |
| GET | `/api/model-info` | Info model & feature importance |
| WS | `/ws` | Stream real-time (push tiap 30 detik) |

---

## Random Forest — Detail Model

| Parameter | Nilai |
|-----------|-------|
| n_estimators | 150 |
| max_depth | 10 |
| Fitur | magnitude, kedalaman_km, tsunami |
| Label | Rendah (0), Sedang (1), Tinggi (2), Kritis (3) |
| Akurasi | ~97% |

**Feature Importance:**
- Magnitudo: ~62% (faktor paling dominan)
- Kedalaman: ~30% (semakin dangkal → lebih berbahaya)
- Tsunami: ~8% (trigger Kritis jika ada)

---

## Sumber Data

Data gempa dari **BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)** Indonesia:
- https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json
- https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json

> ⚠️ Project ini untuk keperluan akademis. Selalu ikuti arahan resmi BMKG untuk keselamatan.
