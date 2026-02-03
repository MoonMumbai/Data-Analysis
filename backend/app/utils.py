import pandas as pd

def basic_eda(df):
    missing = df.isnull().sum().to_dict()
    duplicates = int(df.duplicated().sum())
    numeric = df.select_dtypes(include=['int64','float64']).columns.tolist()
    outliers = {}
    for col in numeric:
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower = q1 - 1.5*iqr
        upper = q3 + 1.5*iqr
        outliers[col] = int(df[(df[col] < lower) | (df[col] > upper)].shape[0])
    summary = {
        'shape': df.shape,
        'missing': missing,
        'duplicates': duplicates,
        'outliers': outliers,
        'head': df.head(5).to_dict(orient='records')
    }
    return summary
