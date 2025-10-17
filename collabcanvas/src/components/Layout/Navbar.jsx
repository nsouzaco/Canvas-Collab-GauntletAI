import React from 'react';
import { signOutUser, getDisplayName } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser } = useAuth();

  const handleSignOut = async () => {
    await signOutUser();
  };

  return (
    <nav className="bg-transparent">
      <div className="px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center pt-8">
            <h1 className="text-3xl font-bold text-blue-600 leading-tight" style={{ fontFamily: "'Borel', cursive" }}>
              Canvas Collab
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* User indicator with green light */}
            <div className="flex items-center gap-2 bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                {getDisplayName(currentUser)}
              </span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
