import React, { useState, useContext, useEffect } from "react";
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
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 md:px-10 py-8 sm:py-12 lg:py-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* LEFT SIDE */}
          <div className="lg:order-1">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">Run Prediction</h2>
            <p className="text-gray-400 mb-8 sm:mb-10 max-w-md lg:max-w-lg text-sm sm:text-base">
              Select an AWS region to fetch real-time instance data and
              generate an AI-powered spot price forecast.
            </p>

            {/* Card */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 max-w-md mx-auto lg:mx-0 shadow-xl">
              <label className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 block">
                Target AWS Region
              </label>

              {/* Dropdown */}
              <div className="relative mb-6 sm:mb-8">
                <div
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex justify-between items-center bg-black border border-[#2a2a2a] rounded-xl px-3 sm:px-4 py-3 sm:py-3.5 cursor-pointer text-gray-300 hover:border-white/50 transition-colors"
                >
                  <span className="text-sm sm:text-base text-gray-300 truncate">
                    {region ? getRegionName(region) : "Select a region..."}
                  </span>
                  <ChevronDown size={18} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </div>

                {showDropdown && (
                  <div className="absolute mt-1 sm:mt-2 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto">
                    {regions.map((r, index) => (
                      <div
                        key={index}
                        onClick={() => handleRegionSelect(r.code)}
                        className="px-3 sm:px-4 py-3 hover:bg-[#252525] cursor-pointer border-b border-[#2a2a2a] last:border-b-0 transition-colors"
                      >
                        <p className="text-white text-sm font-medium truncate">{r.name}</p>
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
                className="w-full py-3 sm:py-3.5 bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-all duration-300 rounded-xl border border-[#2a2a2a] disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium shadow-lg hover:shadow-xl"
              >
                {loading ? "Predicting..." : "Generate Forecast →"}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-600 text-red-400 px-4 sm:px-6 py-3 sm:py-4 rounded-xl mt-6 sm:mt-8 max-w-md mx-auto lg:mx-0 text-sm">
                <p>Error: {error}</p>
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col items-center justify-center lg:order-2 min-h-[400px] lg:min-h-[500px]">
            {!result ? (
              <div className="w-full max-w-md lg:max-w-lg h-80 sm:h-96 lg:h-[380px] border border-dashed border-gray-700 rounded-2xl flex flex-col items-center justify-center text-center text-gray-500 p-6">
                <Activity size={32} sm:size={40} className="mb-4 opacity-50" />
                <p className="text-lg sm:text-xl font-medium mb-2">Awaiting Input</p>
                <p className="text-sm max-w-xs">
                  Select a region and start the prediction engine to see the
                  forecast here.
                </p>
              </div>
            ) : (
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 w-full max-w-md lg:max-w-lg shadow-xl">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 sm:mb-8 gap-4 sm:gap-0">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-400">
                      FORECAST RESULT
                    </p>
                    <h3 className="text-base sm:text-lg font-semibold mt-1">
                      {getRegionName(result.region)}
                    </h3>
                  </div>

                  <button
                    className={`px-4 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm border font-medium ${
                      result.recommendation === "BUY"
                        ? "bg-green-900/30 text-green-400 border-green-600 hover:bg-green-900/50"
                        : "bg-yellow-900/30 text-yellow-400 border-yellow-600 hover:bg-yellow-900/50"
                    } transition-all`}
                  >
                    {result.recommendation === "BUY" ? "✓ BUY INSTANCE" : "○ WAIT"}
                  </button>
                </div>

                <div className="bg-black border border-[#2a2a2a] rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 lg:gap-0">
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Current Price</p>
                      <h2 className="text-2xl sm:text-3xl lg:text-[28px] font-bold tracking-wide">
                        ${Number(result.current_price).toFixed(5)}
                      </h2>
                    </div>
                    <div className="text-right lg:min-w-[140px]">
                      <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">Predicted Next Price</p>
                      <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-bold tracking-wide">
                        ${Number(result.predicted_next_price).toFixed(5)}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="bg-black border border-[#2a2a2a] rounded-xl p-4 sm:p-5 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
                  <span className="font-semibold text-gray-300">Confidence:</span>{" "}
                  {(result.confidence * 100).toFixed(2)}%
                </div>

                <div className="bg-black border border-[#2a2a2a] rounded-xl p-4 sm:p-5 text-xs sm:text-sm text-gray-400">
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
    </div>
  );
}

export default Prediction;
