import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
import joblib
try:
    import lightgbm as lgb
    USE_LGB = True
except Exception:
    USE_LGB = False

from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

def discover_target(df):
    candidates = ['target', 'label', 'clicked', 'click', 'purchase', 'purchased', 'y']
    for c in candidates:
        if c in df.columns:
            return c
    for col in df.columns:
        if df[col].dropna().nunique() == 2:
            return col
    return None

def train_supervised(df, target_col, model_path, onnx_path=None):
    X = df.drop(columns=[target_col]).copy()
    y = df[target_col].copy()
    num_cols = X.select_dtypes(include=['int64','float64']).columns.tolist()
    cat_cols = X.select_dtypes(include=['object','category','bool']).columns.tolist()

    num_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    cat_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    preprocessor = ColumnTransformer(transformers=[
        ('num', num_pipeline, num_cols),
        ('cat', cat_pipeline, cat_cols)
    ], remainder='drop')

    if USE_LGB:
        model = lgb.LGBMClassifier(n_estimators=200, n_jobs=-1)
    else:
        model = RandomForestClassifier(n_estimators=200, n_jobs=-1)

    pipeline = Pipeline(steps=[('pre', preprocessor), ('model', model)])

    if len(np.unique(y)) > 1:
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15, random_state=42, stratify=y)
    else:
        X_train, y_train = X, y

    pipeline.fit(X_train, y_train)
    joblib.dump(pipeline, model_path)

    if onnx_path:
        try:
            n_features = X_train.shape[1]
            initial_type = [('float_input', FloatTensorType([None, n_features]))]
            onx = convert_sklearn(pipeline, initial_types=initial_type)
            with open(onnx_path, 'wb') as f:
                f.write(onx.SerializeToString())
        except Exception as e:
            print('ONNX export failed:', e)
    return pipeline

def train_unsupervised(df, model_path):
    X = df.select_dtypes(include=['int64','float64']).fillna(0)
    iso = IsolationForest(n_estimators=200, contamination='auto', random_state=42, n_jobs=-1)
    iso.fit(X)
    joblib.dump((iso, X.columns.tolist()), model_path)
    return iso
