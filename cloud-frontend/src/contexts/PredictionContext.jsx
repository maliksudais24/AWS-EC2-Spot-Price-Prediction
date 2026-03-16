import React, { createContext, useState, useContext } from "react";
import axios from "axios";

const PredictionContext = createContext();

export function PredictionProvider({ children }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async (region) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`Sending prediction request for region: ${region}`);
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        region: region,
      });
      console.log("Prediction response:", response.data);
      setResult(response.data);
    } catch (err) {
      console.error("Prediction error:", err);
      const errorData = err.response?.data;
      const errorMessage = errorData?.error || errorData?.details || err.message || "Prediction failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PredictionContext.Provider value={{ result, loading, error, predict }}>
      {children}
    </PredictionContext.Provider>
  );
}

export { PredictionContext };
