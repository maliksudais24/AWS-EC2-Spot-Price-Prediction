import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <section className="text-center px-4 sm:px-6 md:px-8 lg:px-10 py-20 md:py-24 lg:py-28 max-w-7xl mx-auto">
      
      {/* Badge */}
      <div 
        className={`inline-block bg-black border border-white text-xs sm:text-sm py-1 sm:py-2 px-3 sm:px-2 rounded-full mb-4 sm:mb-6 text-slate-300 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
      >
        ⚡ Live Spot Price Intelligence
      </div>

      {/* Heading */}
      <h1 
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 text-white transition-all duration-700 ease-out delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        Predict AWS Spot Prices <br className="hidden md:block" /> with Intelligence
      </h1>  

      {/* Description */}
      <p 
        className={`text-white text-lg sm:text-xl md:text-[20px] leading-relaxed mb-6 sm:mb-10 max-w-2xl mx-auto px-2 transition-all duration-700 ease-out delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      >
        Optimize your cloud compute spend. We combine traditional statistical
        models with advanced neural networks to forecast EC2 spot pricing
        across global regions.
      </p>

      {/* CTA */}
      <div className={`transition-all duration-700 ease-out delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <Link to="/predict">
          <button className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base hover:scale-105 transition-all duration-300 shadow-lg">
            Start Predicting →
          </button>
        </Link>
      </div>
    </section>
  );
};

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: "📈",
      title: "ARIMA Models",
      description: "AutoRegressive Integrated Moving Average provides our baseline statistical analysis, capturing seasonal trends and historical price movements with high confidence.",
      bgColor: "bg-blue-900"
    },
    {
      icon: "🧠",
      title: "LSTM Networks",
      description: "Long Short-Term Memory neural networks process sequential spot price data to identify complex, non-linear patterns that traditional algorithms miss.",
      bgColor: "bg-purple-900"
    },
    {
      icon: "🌳",
      title: "Random Forest",
      description: "Ensemble learning algorithms combine multiple decision trees to mitigate overfitting and provide robust, resilient recommendations on when to bid.",
      bgColor: "bg-green-900"
    }
  ];

  return (
    <section className="px-4 sm:px-6 md:px-10 pb-16 md:pb-20 lg:pb-24">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-7xl mx-auto">
        
        {features.map((feature, index) => (
          <div 
            key={index}
            className={`bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 hover:-translate-y-2 transition-all duration-500 hover:shadow-xl group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: `${600 + (index * 150)}ms` }}
          >
            <div className={`${feature.bgColor} w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-300 mx-auto mb-4`}>
              {feature.icon}
            </div>
            <h3 className="mt-2 sm:mt-4 text-lg sm:text-xl md:text-2xl font-bold text-white text-center mb-3 sm:mb-4">{feature.title}</h3>
            <p className="text-slate-400 text-sm sm:text-base md:text-[16px] leading-relaxed text-center px-1">
              {feature.description}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
};

function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
    </div>
  );
}

export default Home;
