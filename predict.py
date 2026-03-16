# predictor.py

import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from model import fetch_spot_data, preprocess_data
from sklearn.preprocessing import StandardScaler

def predict_region(region):
    print(f"\nPredicting for region: {region}")

    # -------------------------------
    # Load models
    # -------------------------------
    arima_model = joblib.load(f"models/{region}_arima.joblib")
    lstm_model = load_model(f"models/{region}_lstm.h5",compile=False)
    rf_model = joblib.load(f"models/{region}_rf.joblib")
    scaler = joblib.load(f"models/{region}_scaler.joblib")

    # -------------------------------
    # Fetch latest data
    # -------------------------------
    df = fetch_spot_data(region, days=30)  # last 30 days
    df = preprocess_data(df)

    # -------------------------------
    # Regression prediction (ARIMA + LSTM)
    # -------------------------------
    y = df["SpotPrice"]
    SEQ_LEN = 24

    # ARIMA forecast
    arima_pred = arima_model.forecast(steps=len(y))
    residuals = y.values - arima_pred.values
    residuals_scaled = scaler.transform(residuals.reshape(-1,1))

    # Prepare sequences for LSTM
    def create_sequences(data, seq_len=SEQ_LEN):
        X, y_seq = [], []
        for i in range(len(data)-seq_len):
            X.append(data[i:i+seq_len])
            y_seq.append(data[i+seq_len])
        return np.array(X), np.array(y_seq)

    X_seq, _ = create_sequences(residuals_scaled)
    lstm_pred_scaled = lstm_model.predict(X_seq)
    lstm_pred = scaler.inverse_transform(lstm_pred_scaled)

    arima_adjusted = arima_pred.iloc[SEQ_LEN:]
    final_pred = arima_adjusted.values + lstm_pred.flatten()
    predicted_next_price = final_pred[-1]

    # -------------------------------
    # Classification prediction (BUY / WAIT)
    # -------------------------------
    features = [
        "lag1","lag3","lag6","lag12","lag24",
        "roll_mean_6","roll_std_6","roll_mean_24",
        "diff1","diff3","pct_change","volatility_6"
    ]
    latest_features = df[features].iloc[-1:].values
    cls_pred = rf_model.predict(latest_features)[0]
    cls_prob = rf_model.predict_proba(latest_features)[0]

    current_price = df["SpotPrice"].iloc[-1]

    print("\n=== FINAL DECISION ===")
    print("Current Price:", current_price)
    print("Predicted Next Price (ARIMA + LSTM):", predicted_next_price)
    if cls_pred == 1:
        print("Recommendation: BUY NOW")
        print("Confidence:", round(cls_prob[1]*100,2), "%")
    else:
        print("Recommendation: WAIT")
        print("Confidence:", round(cls_prob[0]*100,2), "%")

    return predicted_next_price, cls_pred, cls_prob, current_price

if __name__ == "__main__":
    # Example: predict for US East region
    predict_region("us-east-1")