import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Menu } from "lucide-react";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    setMobileOpen(false); // Close on route change
  }, [location.pathname]);

  return (
    <nav className="px-4 md:px-8 lg:px-10 py-4 md:py-6 bg-black shadow-[0_1px_0_rgba(255,255,255,0.1)]">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-lg md:text-xl font-semibold tracking-wide opacity-90 text-white">
          ☁ AetherCast
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-1 p-1 rounded-full bg-[#1a1a1a]">
          <Link to="/">
            <button 
              className={`px-4 md:px-5 py-2 rounded-full font-medium text-sm md:text-base transition-all duration-300 ${
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
              className={`px-4 md:px-5 py-2 rounded-full font-medium text-sm md:text-base transition-all duration-300 ${
                location.pathname === '/predict' 
                  ? 'bg-[#2a2a2a] text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-[#252525]'
              }`}
            >
              Predict
            </button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-full hover:bg-[#1a1a1a] transition-colors text-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-[#2a2a2a]">
          <div className="flex flex-col gap-2 p-2 rounded-xl bg-[#1a1a1a]">
            <Link 
              to="/" 
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm ${
                location.pathname === '/' 
                  ? 'bg-[#2a2a2a] text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-[#252525]'
              }`}
              onClick={toggleMobileMenu}
            >
              Overview
            </Link>
            <Link 
              to="/predict"
              className={`px-4 py-3 rounded-xl font-medium transition-all duration-300 text-sm ${
                location.pathname === '/predict' 
                  ? 'bg-[#2a2a2a] text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-[#252525]'
              }`}
              onClick={toggleMobileMenu}
            >
              Predict
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
