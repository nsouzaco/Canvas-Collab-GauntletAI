import React from 'react';
import { SplashCursor } from '../ui/splash-cursor';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Fluid Background */}
      <SplashCursor 
        SIM_RESOLUTION={128}
        DYE_RESOLUTION={1440}
        DENSITY_DISSIPATION={3.5}
        VELOCITY_DISSIPATION={2}
        PRESSURE={0.1}
        CURL={3}
        SPLAT_RADIUS={0.2}
        SPLAT_FORCE={6000}
        SHADING={true}
        COLOR_UPDATE_SPEED={10}
        BACK_COLOR={{ r: 0.5, g: 0, b: 0 }}
        TRANSPARENT={true}
      />
      
      {/* Content */}
      <div className="text-center relative z-10">
        {/* Logo */}
        <h1 
          className="text-8xl font-bold text-blue-600 mb-8 drop-shadow-2xl" 
          style={{ fontFamily: "'Borel', cursive" }}
        >
          Startup Collab
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-gray-700 mb-12 drop-shadow-lg max-w-2xl mx-auto font-medium">
          Create, collaborate, and bring your ideas to life with AI-powered canvas tools
        </p>
        
        {/* Get Started Button */}
        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl relative z-50"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
