import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        {/* Logo */}
        <h1 
          className="text-8xl font-bold text-blue-600 mb-8" 
          style={{ fontFamily: "'Borel', cursive" }}
        >
          Canvas Collab
        </h1>
        
        {/* Get Started Button */}
        <button
          onClick={onGetStarted}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
