# AWS Spot Instance Price Forecaster & Cost Optimizer

A hybrid time-series forecasting and classification system that predicts hourly prices of EC2 `t3.micro` spot instances across `us-east-1`, `us-west-2`, and `eu-west-1`. It generates actionable **BUY** / **WAIT** signals to help you time spot instance launches and significantly reduce cloud costs.

The system combines **ARIMA** (for linear trends) and **LSTM** (for non‑linear patterns) into a hybrid forecast, then feeds engineered features (lags, rolling statistics, volatility, and the hybrid prediction) into a **Random Forest classifier** to decide the optimal launch timing. A React frontend with a Flask API backend, plus an automated retraining scheduler, makes the solution production‑ready.

---

## Features

- **Real‑time data fetching** from AWS EC2 Spot Instance Data Feed (via boto3)
- **Hybrid forecasting model**  
  - ARIMA – captures linear components and seasonality  
  - LSTM – learns complex non‑linear dependencies  
  - Weighted combination of both forecasts
- **Feature engineering** for classification  
  - Lag features (1h, 3h, 6h, 12h, 24h)  
  - Rolling means & standard deviations (windows: 3h, 6h, 12h)  
  - Volatility (exponentially weighted moving variance)  
  - Hybrid forecast value as an additional regressor
- **Random Forest classifier**  
  - Outputs `BUY` (price expected to be low and stable) or `WAIT` (price rising / volatile)
- **Flask REST API** – serves predictions and signals to the frontend
- **React dashboard** – visualises historical prices, forecasts, and current BUY/WAIT signals
- **Automated retraining scheduler** – daily retraining of ARIMA, LSTM, and Random Forest using the latest spot price data
- **Multi‑region support** – separate models per region (`us-east-1`, `us-west-2`, `eu-west-1`)

---

## Architecture
![deepseek_mermaid_20260403_5f7055](https://github.com/user-attachments/assets/2edc60e2-2c4e-4c76-9b86-db3ab45dce19)
## Tech Stack

| Component          | Technology                                         |
|--------------------|----------------------------------------------------|
| **Data ingestion** | boto3 (AWS SDK), EC2 Spot Data Feed API           |
| **Time series**    | statsmodels (ARIMA), TensorFlow / Keras (LSTM)    |
| **Classification** | scikit-learn (Random Forest, preprocessing)       |
| **Backend API**    | Flask, Flask-CORS, APScheduler (for retraining)   |
| **Frontend**       | React, Axios, Chart.js (or Recharts), Tailwind CSS|
| **Serialisation**  | pickle (models), joblib, h5py                     |
| **Environment**    | Python 3.9+, Node.js 16+                          |

---

## Project Structure

![deepseek_svg_20260403_101e8e](https://github.com/user-attachments/assets/1dc3909d-8ab6-47f6-bce6-93e87d04ad28)

## Installation & Setup

### Prerequisites

- Python 3.9+ with `pip`
- Node.js 16+ with `npm`
- AWS account with access key / secret (or IAM role) – **only for fetching spot data**
- MongoDB or SQLite? Not required – models are stored on filesystem (can be extended)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aws-spot-price-optimizer.git
   cd aws-spot-price-optimizer/backend

Create a virtual environment

bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
Install dependencies

bash
pip install -r requirements.txt
Set up AWS credentials
Either configure the AWS CLI (aws configure) or set environment variables:

env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_DEFAULT_REGION=us-east-1
Configure environment – Create .env file:

env
FLASK_ENV=development
PORT=5000
REGIONS=us-east-1,us-west-2,eu-west-1
INSTANCE_TYPE=t3.micro
RETRAIN_HOUR=2                # 2 AM daily retraining
LOOKBACK_HOURS=720            # 30 days of historical data
FORECAST_HORIZON=24           # predict next 24 hours
Initial data download & training (run once)

bash
python src/data_fetcher.py
python src/trainer.py --region all
Start the Flask API

bash
python app.py
The API will be available at http://localhost:5000

Frontend Setup
Navigate to frontend folder

bash
cd ../frontend
Install dependencies

bash
npm install
Configure API endpoint – Create .env:

env
REACT_APP_API_URL=http://localhost:5000/api
Run the React app

bash
npm start
Open http://localhost:3000

Usage
Open the dashboard – select a region from the dropdown.

View historical spot prices (last 7 days) on the price chart.

See the hybrid forecast for the next 24 hours.

Check the current signal – BUY (green) or WAIT (orange/red).

Automated launch recommendation – when the signal turns BUY, the frontend can optionally trigger an AWS Lambda or CloudFormation template to launch a spot instance (extendable).

Example API calls (for integration)
bash
# Get latest forecast and signal for us-east-1
curl http://localhost:5000/api/predict?region=us-east-1

# Response:
{
  "region": "us-east-1",
  "timestamp": "2025-03-15T14:00:00Z",
  "historical_prices": [0.0034, 0.0035, ...],
  "hybrid_forecast": [0.0036, 0.0038, ...],
  "signal": "BUY",
  "confidence": 0.87
}
## Model Details
Data Preprocessing
Hourly spot prices from AWS EC2 Spot Instance Data Feed (last 30 days).

##Missing values interpolated linearly.

Differencing (if needed) to achieve stationarity for ARIMA.

##ARIMA (Linear Component)
Auto‑selection of (p,d,q) using AIC on the training window.

Fitted per region, updated daily.

Provides baseline forecast ŷ_arima.

## LSTM (Non‑Linear Component)
Architecture: 2 LSTM layers (50 units each) + Dropout(0.2) + Dense(1).

Input: sequence of last 48 hours.

Target: next hour price.

Trained on residuals from ARIMA (actual - ŷ_arima) to learn non‑linear patterns.

## Final LSTM output ŷ_lstm.

Hybrid Forecast
ŷ_hybrid = α * ŷ_arima + (1-α) * (ŷ_arima + ŷ_lstm)
α is optimised on validation set (typically 0.6–0.8).

## Feature Engineering for Random Forest
For each hour t, the following features are created:

Lag features: price_{t-1}, price_{t-3}, price_{t-6}, price_{t-12}, price_{t-24}

Rolling statistics:

rolling_mean_3, rolling_mean_6, rolling_mean_12

rolling_std_3, rolling_std_6, rolling_std_12

Volatility: Exponentially weighted moving variance (span=6)

Hybrid forecast at time t+1 (one step ahead)

Target variable (binary):
1 → BUY (price is below the 20th percentile of last 7 days AND rolling volatility < 0.0005)
0 → WAIT (otherwise)

## Random Forest Classifier
100 trees, max depth 10, balanced class weights.

Trained on 80% of data, validated on 20% (time‑series split).

Outputs BUY/WAIT plus probability (confidence).

## Automated Retraining Scheduler
The scheduler (APScheduler) runs daily at the hour defined in .env (RETRAIN_HOUR). It:

Fetches new spot price data from AWS for the last 7 days.

Appends to the historical CSV.

Retrains ARIMA, LSTM, and Random Forest for each region.

Saves updated models to disk (overwrites old versions).

Logs training metrics (RMSE, classification report) to a log file.

To run the scheduler independently (without Flask):

bash
python src/scheduler.py
The scheduler can also be deployed as a separate container / Lambda function.

## Frontend Dashboard (React)
Region selector – switch between us-east-1, us-west-2, eu-west-1

Price chart – dual line: historical actual + hybrid forecast (different colours)

Signal indicator – big button with BUY / WAIT and confidence percentage

Feature importance – bar chart (from Random Forest) showing top 5 features

Auto‑refresh – polls the API every 5 minutes for latest signals

## Deployment Options
Docker Compose (Local / Production)
yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    volumes:
      - ./backend/models:/app/models
  frontend:
    build: ./frontend
    ports:
      - "80:3000"
## AWS (Production)
 ## Backend – Deploy Flask app on EC2 (or Elastic Beanstalk) with a cron job for retraining.

 ## Frontend – Serve React build via S3 + CloudFront.

 ##Models – Store in S3; load on startup and after each retraining.

 ##Trigger retraining – AWS Lambda + EventBridge (cron) that calls the /retrain endpoint (protected).

##Extending the Project

 ##Add more regions / instance types – modify config.py and retrain.

## Integrate with Terraform – auto‑launch spot instances when BUY signal occurs.

Use a real database – store historical prices in InfluxDB or TimescaleDB.

Add user authentication – protect the dashboard and API endpoints.

Deploy as a managed service – with a simple subscription plan.

##Troubleshooting

##Issue	Solution
boto3 cannot fetch spot data	Check AWS credentials and IAM permissions (ec2:DescribeSpotPriceHistory).
ARIMA fails to converge	Increase LOOKBACK_HOURS or apply stronger differencing.
LSTM training is slow	Reduce epochs or use GPU instance.
Random Forest accuracy < 70%	Re‑engineer target definition; adjust class weights.
Flask scheduler runs twice	Ensure if __name__ == '__main__' guard in app.py.
Contributing

##Fork the repository.

Create a feature branch (git checkout -b feature/improve-lstm).

Commit changes (git commit -m 'Add attention to LSTM').

Push to the branch (git push origin feature/improve-lstm).

Open a Pull Request.

##License
Distributed under the MIT License. See LICENSE for more information.

##Acknowledgements
AWS EC2 Spot Instance Data Feed documentation

Statsmodels & TensorFlow communities

Inspiration from “Using ML to Save on Cloud Costs” by various FinOps practitioners

##Contact:

Malik Sudais  – maliksudais30@gmail.com
Project Link: (https://github.com/maliksudais24/AWS-EC2-Spot-Price-Prediction.git)
   
