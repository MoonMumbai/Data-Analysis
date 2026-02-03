import os
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uuid
from .utils import basic_eda
from .ml_pipeline import discover_target, train_supervised, train_unsupervised
import joblib
import onnxruntime as ort
import json
from datetime import datetime
from typing import List, Dict

app = FastAPI(title='DataQC + ML API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'uploads'))
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'model_store'))
HISTORY_DIR = os.path.abspath(os.path.join(BASE_DIR, '..', 'prediction_history'))
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(HISTORY_DIR, exist_ok=True)

EXAMPLE_PATH = '/Users/manas-kool/Desktop/Helloworld/Ads_CTR_Optimisation.csv'
if os.path.exists(EXAMPLE_PATH):
    print("Example dataset found at", EXAMPLE_PATH)

@app.post("/analyze")
async def analyze_file(file: UploadFile = File(...)):
    uid = str(uuid.uuid4())[:8]
    save_path = os.path.join(UPLOAD_DIR, f"{uid}_{file.filename}")
    with open(save_path, "wb") as f:
        content = await file.read()
        f.write(content)
    df = pd.read_csv(save_path)
    summary = basic_eda(df)
    target = discover_target(df)
    return JSONResponse({"summary": summary, "target_detected": target, "saved_path": save_path})

@app.post("/train")
async def train(saved_path: str = Form(...)):
    df = pd.read_csv(saved_path)
    target = discover_target(df)
    model_id = str(uuid.uuid4())[:8]
    model_path = os.path.join(MODEL_DIR, f"{model_id}.joblib")
    onnx_path = os.path.join(MODEL_DIR, f"{model_id}.onnx")
    if target:
        pipeline = train_supervised(df, target, model_path, onnx_path)
        return {"model_id": model_id, "type": "supervised", "target": target, "model_path": model_path, "onnx_path": onnx_path}
    else:
        iso = train_unsupervised(df, model_path)
        return {"model_id": model_id, "type": "unsupervised", "model_path": model_path}

def save_prediction_history(model_id: str, prediction_value: float, prediction_type: str):
    """Save a single prediction to history (stores average for batch predictions)"""
    history_file = os.path.join(HISTORY_DIR, f"{model_id}_history.json")
    timestamp = datetime.now().isoformat()
    
    # Load existing history
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            history = json.load(f)
    else:
        history = []
    
    # Add new prediction
    history.append({
        "timestamp": timestamp,
        "value": prediction_value,
        "type": prediction_type
    })
    
    # Keep only last 10 predictions
    history = history[-10:]
    
    # Save updated history
    with open(history_file, 'w') as f:
        json.dump(history, f, indent=2)
    
    return history

@app.post("/predict")
async def predict(model_id: str = Form(...), data: UploadFile = File(...)):
    try:
        model_joblib = os.path.join(MODEL_DIR, f"{model_id}.joblib")
        onnx_file = os.path.join(MODEL_DIR, f"{model_id}.onnx")
        content = await data.read()
        import io
        
        # Read CSV file
        try:
            df = pd.read_csv(io.BytesIO(content))
        except Exception as e:
            return JSONResponse({"error": f"Failed to read CSV file: {str(e)}"}, status_code=400)
        
        if df.empty:
            return JSONResponse({"error": "CSV file is empty"}, status_code=400)
        
        result = {}
        prediction_type = "prediction"
        
        if os.path.exists(onnx_file):
            try:
                sess = ort.InferenceSession(onnx_file)
                inp_name = sess.get_inputs()[0].name
                X = df.select_dtypes(include=['int64','float64']).astype('float32').to_numpy()
                
                if X.size == 0:
                    return JSONResponse({"error": "No numeric columns found in the data"}, status_code=400)
                
                preds = sess.run(None, {inp_name: X})[0].tolist()
                result["predictions"] = preds
                # Store average prediction value for trend tracking
                if preds:
                    try:
                        avg_pred = sum(preds) / len(preds) if isinstance(preds[0], (int, float)) else float(preds[0])
                        save_prediction_history(model_id, float(avg_pred), "prediction")
                    except Exception as e:
                        print(f"Warning: Failed to save prediction history: {e}")
            except Exception as e:
                return JSONResponse({"error": f"ONNX prediction failed: {str(e)}"}, status_code=500)
        elif os.path.exists(model_joblib):
            try:
                obj = joblib.load(model_joblib)
                if isinstance(obj, tuple):
                    # Unsupervised model (Isolation Forest)
                    iso, cols = obj
                    # Check if required columns exist
                    missing_cols = [col for col in cols if col not in df.columns]
                    if missing_cols:
                        return JSONResponse({
                            "error": f"Missing required columns: {', '.join(missing_cols)}"
                        }, status_code=400)
                    
                    X = df[cols].fillna(0)
                    scores = iso.decision_function(X).tolist()
                    result["anomaly_score"] = scores
                    prediction_type = "anomaly_score"
                    # Store average anomaly score for trend tracking
                    if scores:
                        try:
                            avg_score = sum(scores) / len(scores)
                            save_prediction_history(model_id, float(avg_score), "anomaly_score")
                        except Exception as e:
                            print(f"Warning: Failed to save prediction history: {e}")
                else:
                    # Supervised model (Pipeline)
                    # The pipeline will handle column selection and preprocessing
                    try:
                        preds = obj.predict(df).tolist()
                        result["predictions"] = preds
                        # Store average prediction value for trend tracking
                        if preds:
                            try:
                                # Handle both numeric and categorical predictions
                                if isinstance(preds[0], (int, float)):
                                    avg_pred = sum(preds) / len(preds)
                                else:
                                    # For categorical predictions, use the first value
                                    avg_pred = float(preds[0]) if str(preds[0]).isdigit() else 0.0
                                save_prediction_history(model_id, float(avg_pred), "prediction")
                            except Exception as e:
                                print(f"Warning: Failed to save prediction history: {e}")
                    except Exception as e:
                        error_msg = str(e)
                        # Provide more helpful error messages
                        if "feature" in error_msg.lower() or "column" in error_msg.lower():
                            return JSONResponse({
                                "error": f"Column mismatch: {error_msg}. Please ensure prediction data has the same structure as training data."
                            }, status_code=400)
                        return JSONResponse({"error": f"Prediction failed: {error_msg}"}, status_code=500)
            except Exception as e:
                return JSONResponse({"error": f"Failed to load model: {str(e)}"}, status_code=500)
        else:
            return JSONResponse({"error": "Model not found"}, status_code=404)
        
        # Get historical predictions for response
        history_file = os.path.join(HISTORY_DIR, f"{model_id}_history.json")
        historical_data = []
        if os.path.exists(history_file):
            try:
                with open(history_file, 'r') as f:
                    historical_data = json.load(f)
            except Exception as e:
                print(f"Warning: Failed to load prediction history: {e}")
        
        result["history"] = historical_data
        return result
        
    except Exception as e:
        return JSONResponse({"error": f"Unexpected error: {str(e)}"}, status_code=500)

@app.get("/predictions/history/{model_id}")
async def get_prediction_history(model_id: str):
    """Get historical predictions for a specific model"""
    history_file = os.path.join(HISTORY_DIR, f"{model_id}_history.json")
    if os.path.exists(history_file):
        with open(history_file, 'r') as f:
            history = json.load(f)
        return {"history": history}
    else:
        return {"history": []}

@app.get("/example")
async def example():
    if os.path.exists(EXAMPLE_PATH):
        return FileResponse(EXAMPLE_PATH)
    return JSONResponse({"error":"example dataset not found"}, status_code=404)

@app.get("/report")
async def report(path: str):
    df = pd.read_csv(path)
    s = basic_eda(df)
    html = f"<html><body><h1>Data Quality Report</h1><p>Rows: {s['shape'][0]} Columns: {s['shape'][1]}</p>"
    html += "<h2>Missing</h2><ul>"
    for k,v in s['missing'].items():
        html += f"<li>{k}: {v}</li>"
    html += "</ul></body></html>"
    return HTMLResponse(html)
