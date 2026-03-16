import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="flex items-center justify-between px-10 py-6 bg-black shadow-[0_1px_0_rgba(255,255,255,0.1)]">
      
      {/* Logo */}
      <div className="text-lg font-semibold tracking-wide opacity-90 text-white">
        ☁ AetherCast
      </div>

      {/* Buttons Container */}
      <div className="flex gap-1 p-1 rounded-full bg-[#1a1a1a]">
        <Link to="/">
          <button 
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
              location.pathname === '/' 
                ? 'bg-[#2a2a2a] text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-[#252525]'
            }`}
          >
            Overview
          </button>
        </Link>

        <Link to="/predict">
          <button 
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
              location.pathname === '/predict' 
                ? 'bg-[#2a2a2a] text-white shadow-lg' 
                : 'text-slate-400 hover:text-white hover:bg-[#252525]'
            }`}
          >
            Predict
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
