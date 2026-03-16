import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PredictionProvider } from "./contexts/PredictionContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Prediction from "./pages/predictionpage.jsx";
import "./App.css";

function App() {
  return (
    <PredictionProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/predict" element={<Prediction />} />
        </Routes>
      </Router>
    </PredictionProvider>
  );
}

export default App;
