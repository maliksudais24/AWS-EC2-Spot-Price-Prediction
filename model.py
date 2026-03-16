# trainer.py

import boto3
import pandas as pd
import numpy as np
import datetime
import os
import joblib
import warnings
warnings.filterwarnings("ignore")



from statsmodels.tsa.arima.model import ARIMA
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import classification_report, accuracy_score
from dotenv import load_dotenv

load_dotenv()
# ==============================
# FETCH DATA
# ==============================
def fetch_spot_data(region, days=365):

    end_time = datetime.datetime.utcnow()
    start_time = end_time - datetime.timedelta(days=days)

    ec2 = boto3.client(
        "ec2",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=region
    )

    paginator = ec2.get_paginator("describe_spot_price_history")
    pages = paginator.paginate(
        InstanceTypes=["t3.micro"],
        ProductDescriptions=["Linux/UNIX"],
        StartTime=start_time,
        EndTime=end_time
    )

    spot_data = []
    for page in pages:
        for item in page["SpotPriceHistory"]:
            spot_data.append({
                "Timestamp": item["Timestamp"],
                "SpotPrice": float(item["SpotPrice"])
            })

    df = pd.DataFrame(spot_data)
    return df

# ==============================
# PREPROCESS + FEATURE ENGINEERING
# ==============================
def preprocess_data(df):

    df["Timestamp"] = pd.to_datetime(df["Timestamp"])
    df = df.sort_values("Timestamp")
    df = df.set_index("Timestamp")

    df = df["SpotPrice"].resample("h").mean().to_frame()
    df["SpotPrice"] = df["SpotPrice"].interpolate(method="time").ffill().bfill()
    
    Q1 = df["SpotPrice"].quantile(0.25)
    Q3 = df["SpotPrice"].quantile(0.75)
    IQR = Q3 - Q1

    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR

    df["SpotPrice"] = np.where(df["SpotPrice"] < lower_bound, lower_bound, df["SpotPrice"])
    df["SpotPrice"] = np.where(df["SpotPrice"] > upper_bound, upper_bound, df["SpotPrice"])

    # Lag features
    for lag in [1,3,6,12,24]:
        df[f"lag{lag}"] = df["SpotPrice"].shift(lag)

    # Rolling features
    df["roll_mean_6"] = df["SpotPrice"].rolling(6).mean()
    df["roll_std_6"] = df["SpotPrice"].rolling(6).std()
    df["roll_mean_24"] = df["SpotPrice"].rolling(24).mean()

    # Classification target
    df["future_price"] = df["SpotPrice"].shift(-1)
    df["target"] = np.where(df["future_price"] < df["SpotPrice"], 1, 0)

    # Momentum, volatility, percentage change
    df["diff1"] = df["SpotPrice"] - df["lag1"]
    df["diff3"] = df["SpotPrice"] - df["lag3"]
    df["pct_change"] = df["SpotPrice"].pct_change()
    df["volatility_6"] = df["SpotPrice"].rolling(6).std()

    df = df.dropna()
    return df

# ==============================
# TRAIN MODELS FOR REGION
# ==============================
def train_region(region):

    print(f"\n=== Training models for region: {region} ===")
    df = fetch_spot_data(region)
    df = preprocess_data(df)

    os.makedirs("models", exist_ok=True)

    # -----------------
    # REGRESSION PART
    # -----------------
    y = df["SpotPrice"]
    split = int(len(y)*0.8)
    y_train, y_test = y[:split], y[split:]

    # ARIMA
    arima_model = ARIMA(y_train, order=(2,1,3))
    arima_fit = arima_model.fit()
    arima_pred_train = arima_fit.forecast(steps=len(y_train))
    arima_pred_test = arima_fit.forecast(steps=len(y_test))

    # ARIMA metrics
    arima_mae = mean_absolute_error(y_test, arima_pred_test)
    arima_rmse = np.sqrt(mean_squared_error(y_test, arima_pred_test))
    arima_r2 = r2_score(y_test, arima_pred_test)
    print("\nARIMA Metrics:")
    print(f"MAE: {arima_mae:.6f}, RMSE: {arima_rmse:.6f}, R2: {arima_r2:.4f}")

    # Residuals for LSTM
    residuals_train = y_train.values - arima_pred_train.values
    residuals_test = y_test.values - arima_pred_test.values

    scaler = StandardScaler()
    residuals_train_scaled = scaler.fit_transform(residuals_train.reshape(-1,1))
    residuals_test_scaled = scaler.transform(residuals_test.reshape(-1,1))

    # LSTM
    SEQ_LEN = 24
    def create_sequences(data, seq_len=SEQ_LEN):
        X, y = [], []
        for i in range(len(data)-seq_len):
            X.append(data[i:i+seq_len])
            y.append(data[i+seq_len])
        return np.array(X), np.array(y)

    X_train_seq, y_train_seq = create_sequences(residuals_train_scaled)
    X_test_seq, y_test_seq = create_sequences(residuals_test_scaled)

    model_lstm = Sequential()
    model_lstm.add(LSTM(64, input_shape=(SEQ_LEN,1)))
    model_lstm.add(Dropout(0.2))
    model_lstm.add(Dense(1))
    model_lstm.compile(optimizer="adam", loss="mse")

    early_stop = EarlyStopping(patience=5, restore_best_weights=True)

    model_lstm.fit(X_train_seq, y_train_seq, epochs=50, batch_size=32,
                   validation_split=0.1, verbose=1, callbacks=[early_stop])

    lstm_pred_scaled = model_lstm.predict(X_test_seq)
    lstm_pred = scaler.inverse_transform(lstm_pred_scaled)

    arima_adjusted = arima_pred_test.iloc[SEQ_LEN:]
    actual_adjusted = y_test.iloc[SEQ_LEN:]
    final_pred_lstm = arima_adjusted.values + lstm_pred.flatten()

    # ARIMA + LSTM metrics
    final_mae = mean_absolute_error(actual_adjusted, final_pred_lstm)
    final_rmse = np.sqrt(mean_squared_error(actual_adjusted, final_pred_lstm))
    final_r2 = r2_score(actual_adjusted, final_pred_lstm)
    print("\nARIMA + LSTM Metrics:")
    print(f"MAE: {final_mae:.6f}, RMSE: {final_rmse:.6f}, R2: {final_r2:.4f}")

    # -----------------
    # CLASSIFICATION PART
    # -----------------
    features = [
        "lag1","lag3","lag6","lag12","lag24",
        "roll_mean_6","roll_std_6","roll_mean_24",
        "diff1","diff3","pct_change","volatility_6"
    ]
    X_cls = df[features]
    y_cls = df["target"]
    split_cls = int(len(X_cls)*0.8)
    X_train_cls, y_train_cls = X_cls[:split_cls], y_cls[:split_cls]
    X_test_cls, y_test_cls = X_cls[split_cls:], y_cls[split_cls:]

    rf_model = RandomForestClassifier(random_state=42, class_weight="balanced")
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [5, 10, 15],
        'min_samples_split': [2,5,10],
        'min_samples_leaf': [1,2,4],
        'max_features': ['auto','sqrt']
    }
    grid_search = GridSearchCV(rf_model, param_grid, cv=3, n_jobs=-1, scoring='accuracy', verbose=1)
    grid_search.fit(X_train_cls, y_train_cls)

    best_rf = grid_search.best_estimator_
    y_pred_cls = best_rf.predict(X_test_cls)

    print("\nRandom Forest Classification Metrics:")
    print("Accuracy:", accuracy_score(y_test_cls, y_pred_cls))
    print(classification_report(y_test_cls, y_pred_cls))

    # -----------------
    # SAVE MODELS
    # -----------------
    os.makedirs("models", exist_ok=True)
    joblib.dump(arima_fit, f"models/{region}_arima.joblib")
    joblib.dump(best_rf, f"models/{region}_rf.joblib")
    joblib.dump(scaler, f"models/{region}_scaler.joblib")
    model_lstm.save(f"models/{region}_lstm.h5")

    print(f"\n✅ Models saved for region: {region}\n")

    # Return metrics
    return {
        "arima": {"MAE": arima_mae, "RMSE": arima_rmse, "R2": arima_r2},
        "arima_lstm": {"MAE": final_mae, "RMSE": final_rmse, "R2": final_r2},
        "rf": {"accuracy": accuracy_score(y_test_cls, y_pred_cls)}
    }

# ==============================
# Run example
# ==============================
if __name__ == "__main__":
    # Example: train for one region
    train_region("us-east-1")