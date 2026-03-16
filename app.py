# app.py

from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import predict_region
import traceback

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return jsonify({
        "message": "Cloud Spot Price Prediction API is running"
    })


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    region = data.get("region")

    if not region:
        return jsonify({"error": "Region parameter is required"}), 400

    try:
        print(f"Processing prediction for region: {region}")
        predicted_price, cls_pred, cls_prob, current_price = predict_region(region)
        
        print(f"Prediction successful - Current: {current_price}, Predicted: {predicted_price}")

        response = {
            "region": region,
            "current_price": float(current_price),
            "predicted_next_price": float(predicted_price),
            "recommendation": "BUY" if cls_pred == 1 else "WAIT",
            "confidence": float(cls_prob[1] if cls_pred == 1 else cls_prob[0])
        }

        return jsonify(response)

    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e), "details": traceback.format_exc()}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
