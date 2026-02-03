# DataQC + ML Platform 🚀

A full-stack web application to **analyze CSV data quality**, **train machine learning models**, **run predictions**, and **track prediction trends over time**.

This project provides an end-to-end **Data Quality + ML lifecycle platform**, covering EDA, automated model selection, persistence, inference, and visualization.

---

## ✨ Features

- 📂 **CSV Upload & Data Quality Analysis**
  - Dataset shape
  - Missing values
  - Duplicate rows
  - IQR-based outlier detection
  - Data preview

- 🎯 **Automatic Target Detection**
  - Detects target-like columns automatically

- 🤖 **Adaptive ML Training**
  - **Supervised learning** if a target column is detected
  - **Unsupervised anomaly detection** otherwise

- 🔁 **Train & Predict Workflow**
  - Persisted models
  - Schema-aware prediction

- 📈 **Prediction Trend Tracking**
  - Stores last **10 prediction points per model**
  - Visualized using Chart.js

- 💾 **Model Persistence**
  - Joblib models
  - Optional ONNX export for inference

---

## 🧱 Tech Stack

### Backend
- FastAPI
- Pandas
- scikit-learn
- ONNX Runtime (optional)
- Joblib

### Frontend
- React (Vite)
- Tailwind CSS
- Axios
- Chart.js (`react-chartjs-2`)

---

## 📁 Project Structure

```text
webapp_project/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI routes (/analyze, /train, /predict)
│   │   ├── ml_pipeline.py       # Supervised & unsupervised ML pipelines
│   │   └── utils.py             # EDA and data quality helpers
│   ├── uploads/                 # Uploaded CSV files (runtime)
│   ├── model_store/             # Saved models (runtime)
│   ├── prediction_history/      # Per-model prediction history JSON
│   ├── requirements.txt
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── components/          # Dashboard, charts, UI components
    │   └── services/api.js      # Backend API client
    ├── package.json
    └── vite.config.js
