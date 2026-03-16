import React, { createContext, useState } from "react";
import axios from "axios";

export const PredictionContext = createContext();

export const PredictionProvider = ({ children }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const predict = async (region) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/predict?region=${region}`
      );
      setResult(response.data);
    } catch (error) {
      alert("Error fetching prediction");
    }
    setLoading(false);
  };

  return (
    <PredictionContext.Provider value={{ result, loading, predict }}>
      {children}
    </PredictionContext.Provider>
  );
};