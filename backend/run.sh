#!/bin/bash
# Script untuk menjalankan backend IOT Earthquake Monitor

cd "$(dirname "$0")"

# Aktifkan virtual environment
source venv/bin/activate

echo "🌏 Memulai IOT Earthquake Risk Monitor Backend..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""

# Jalankan FastAPI
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
