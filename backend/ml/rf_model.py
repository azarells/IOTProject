"""
Random Forest Model — Prediksi Tingkat Risiko Gempa Bumi

Fitur input (dari data BMKG):
  - magnitude     : skala Richter (2.0–9.0)
  - kedalaman_km  : kedalaman hiposenter (km), semakin dangkal → lebih berbahaya
  - tsunami       : 0/1, potensi tsunami

Label output:
  0 = Rendah   (M < 4, kedalaman > 60, tanpa tsunami)
  1 = Sedang   (M 4–5.5, kedalaman 30–60)
  2 = Tinggi   (M 5.5–7, kedalaman < 30)
  3 = Kritis   (M > 7 ATAU ada tsunami)

Model disimpan ke disk setelah dilatih pertama kali.
"""

import pickle
import numpy as np
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

MODEL_PATH = Path(__file__).parent / "rf_earthquake_model.pkl"

LABEL_NAMES = {0: "Rendah", 1: "Sedang", 2: "Tinggi", 3: "Kritis"}
FEATURE_NAMES = ["magnitude", "kedalaman_km", "tsunami"]


# ── Training Data ──────────────────────────────────────────────────────────────

def _generate_training_data(n: int = 8000):
    """
    Generate dataset sintetis berlabel berdasarkan aturan domain gempa bumi.
    Returns (X, y) sebagai numpy arrays.
    """
    np.random.seed(42)
    X_list, y_list = [], []

    for _ in range(n):
        r = np.random.rand()

        if r < 0.40:
            # Rendah: gempa kecil, dalam, tanpa tsunami
            mag = np.random.uniform(2.0, 4.0)
            depth = np.random.uniform(60, 300)
            tsunami = 0
            label = 0

        elif r < 0.65:
            # Sedang: gempa menengah
            mag = np.random.uniform(4.0, 5.5)
            depth = np.random.uniform(30, 100)
            tsunami = int(np.random.rand() < 0.05)
            label = 1

        elif r < 0.88:
            # Tinggi: gempa kuat, dangkal
            mag = np.random.uniform(5.5, 7.0)
            depth = np.random.uniform(5, 50)
            tsunami = int(np.random.rand() < 0.20)
            label = 2

        else:
            # Kritis: M > 7 atau ada tsunami
            if np.random.rand() < 0.5:
                mag = np.random.uniform(7.0, 9.5)
                depth = np.random.uniform(5, 80)
                tsunami = int(np.random.rand() < 0.60)
            else:
                mag = np.random.uniform(5.0, 8.0)
                depth = np.random.uniform(5, 40)
                tsunami = 1
            label = 3

        X_list.append([round(mag, 2), round(depth, 1), float(tsunami)])
        y_list.append(label)

    return np.array(X_list), np.array(y_list)


# ── Model Lifecycle ────────────────────────────────────────────────────────────

def train_and_save() -> RandomForestClassifier:
    print("[RF] Melatih Random Forest model prediksi risiko gempa...")
    X, y = _generate_training_data()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_leaf=3,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    report = classification_report(
        y_test, y_pred,
        target_names=[LABEL_NAMES[i] for i in range(4)]
    )
    print("[RF] Classification Report:\n", report)

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(clf, f)
    print(f"[RF] Model disimpan → {MODEL_PATH}")
    return clf


def load_model() -> RandomForestClassifier:
    if not MODEL_PATH.exists():
        return train_and_save()
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


_model: RandomForestClassifier | None = None


def get_model() -> RandomForestClassifier:
    global _model
    if _model is None:
        _model = load_model()
    return _model


# ── Inference ──────────────────────────────────────────────────────────────────

def predict(magnitude: float, kedalaman_km: float, tsunami: bool) -> dict:
    """
    Prediksi tingkat risiko dari satu data gempa.

    Args:
        magnitude   : skala Richter
        kedalaman_km: kedalaman dalam km
        tsunami     : apakah ada potensi tsunami

    Returns:
        dict berisi risiko, skor, probabilitas per kelas, dan feature importance
    """
    model = get_model()
    tsunami_val = 1.0 if tsunami else 0.0
    X = np.array([[magnitude, kedalaman_km, tsunami_val]])

    label_idx = int(model.predict(X)[0])
    proba = model.predict_proba(X)[0]

    importances = {
        name: round(float(imp), 4)
        for name, imp in zip(FEATURE_NAMES, model.feature_importances_)
    }

    return {
        "risiko": LABEL_NAMES[label_idx],
        "risiko_code": label_idx,
        "confidence": round(float(proba[label_idx]) * 100, 1),
        "probabilities": {
            LABEL_NAMES[i]: round(float(p) * 100, 1)
            for i, p in enumerate(proba)
        },
        "feature_importance": importances,
    }


if __name__ == "__main__":
    train_and_save()
    # Test dengan gempa M 6.4, kedalaman 10 km, ada tsunami
    result = predict(magnitude=6.4, kedalaman_km=10, tsunami=True)
    print("Contoh prediksi:", result)
