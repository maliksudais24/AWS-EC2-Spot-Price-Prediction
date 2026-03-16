import React, { useState, useContext } from "react";
import { PredictionContext } from "../contexts/PredictionContext.jsx";
import { ChevronDown, Activity } from "lucide-react";

function Prediction() {
  const [region, setRegion] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const { result, loading, error, predict } = useContext(PredictionContext);

  // Regions from backend
  const regions = [
    { name: "US East (N. Virginia)", code: "us-east-1" },
    { name: "US West (Oregon)", code: "us-west-2" },
    { name: "Europe (Ireland)", code: "eu-west-1" },
  ];

  const handleGenerate = () => {
    if (!region) return;
    predict(region);
  };

  const handleRegionSelect = (regionCode) => {
    setRegion(regionCode);
    setShowDropdown(false);
  };

  const getRegionName = (code) => {
    const r = regions.find((reg) => reg.code === code);
    return r ? r.name : code;
  };

  return (
    <div className="min-h-screen bg-black text-white px-10 py-6">

      <div className="grid grid-cols-2 gap-16">
        {/* LEFT SIDE */}
        <div>
          <h2 className="text-4xl font-bold mb-4">Run Prediction</h2>
          <p className="text-gray-400 mb-10 max-w-md">
            Select an AWS region to fetch real-time instance data and
            generate an AI-powered spot price forecast.
          </p>

          {/* Card */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 w-[420px] shadow-xl">
            <label className="text-sm text-gray-400 mb-3 block">
              Target AWS Region
            </label>

            {/* Dropdown */}
            <div className="relative mb-6">
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex justify-between items-center bg-black border border-[#2a2a2a] rounded-xl px-4 py-3 cursor-pointer text-gray-300"
              >
                <span className="text-gray-300">
                  {region ? getRegionName(region) : "Select a region..."}
                </span>
                <ChevronDown size={18} />
              </div>

              {showDropdown && (
                <div className="absolute mt-2 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-lg z-10">
                  {regions.map((r, index) => (
                    <div
                      key={index}
                      onClick={() => handleRegionSelect(r.code)}
                      className="px-4 py-3 hover:bg-[#1F2937] cursor-pointer"
                    >
                      <p className="text-white">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.code}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !region}
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#2a2a2a] transition rounded-xl border border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Predicting..." : "Generate Forecast →"}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 py-3 rounded-xl mt-4 w-[420px]">
              <p>Error: {error}</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center">
          {!result ? (
            <div className="w-[500px] h-[380px] border border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center text-center text-gray-500">
              <Activity size={40} className="mb-4 opacity-50" />
              <p className="text-lg font-medium">Awaiting Input</p>
              <p className="text-sm mt-2 max-w-xs">
                Select a region and start the prediction engine to see the
                forecast here.
              </p>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8 w-[500px] shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <p className="text-xs text-gray-400 tracking-widest">
                    FORECAST RESULT
                  </p>
                  <h3 className="text-lg font-semibold">
                    {getRegionName(result.region)}
                  </h3>
                </div>

                <button
                  className={`px-4 py-2 rounded-full text-sm border ${
                    result.recommendation === "BUY"
                      ? "bg-green-900/30 text-green-400 border-green-600"
                      : "bg-yellow-900/30 text-yellow-400 border-yellow-600"
                  }`}
                >
                  {result.recommendation === "BUY" ? "✓ BUY INSTANCE" : "○ WAIT"}
                </button>
              </div>

              <div className="bg-black border border-[#2a2a2a] rounded-xl p-6 mb-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Current Price</p>
                    <h2 className="text-3xl font-bold tracking-wide">
                      ${Number(result.current_price).toFixed(5)}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm mb-2">Predicted Next Price</p>
                    <h1 className="text-5xl font-bold tracking-wide">
                      ${Number(result.predicted_next_price).toFixed(5)}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="bg-black border border-[#2a2a2a] rounded-xl p-5 text-sm text-gray-400 mb-4">
                <span className="font-semibold text-gray-300">Confidence:</span>{" "}
                {(result.confidence * 100).toFixed(2)}%
              </div>

              <div className="bg-black border border-[#2a2a2a] rounded-xl p-5 text-sm text-gray-400">
                <span className="font-semibold text-gray-300">Insight:</span>{" "}
                This prediction is generated by ensembling ARIMA, LSTM,
                and RandomForest models based on the trailing  hourly data 
                of spot market volatility for the selected region.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Prediction;
