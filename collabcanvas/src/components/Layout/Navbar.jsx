import React, { useState } from 'react';
import { signOutUser, getDisplayName } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useCanvas } from '../../contexts/CanvasContext';
import { clearUserSelections, clearUserLocks } from '../../services/canvas';
import { setUserOffline } from '../../services/presence';
import { Trash2, AlertTriangle } from 'lucide-react';

const Navbar = ({ onBackToDashboard, onDeleteCanvas = null, canvasName }) => {
  const { currentUser } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Try to get canvasId from CanvasContext, but don't fail if not available
  let canvasId = null;
  try {
    const canvasContext = useCanvas();
    canvasId = canvasContext?.canvasId;
  } catch (error) {
    // CanvasContext not available (e.g., in dashboard view)
  }

  const handleSignOut = async () => {
    if (!currentUser) return;
    
    const userId = currentUser.uid;
    
    try {
      // Clear all user's locks and selections before signing out (only if canvasId is available)
      if (canvasId) {
        await clearUserLocks(canvasId, userId);
        await clearUserSelections(canvasId, userId);
        await setUserOffline(canvasId, userId);
      }
      
    } catch (error) {
      console.error('Error during sign out cleanup:', error);
      // Continue with sign out even if cleanup fails
    }
    
    // Sign out the user
    await signOutUser();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDeleteCanvas) {
      onDeleteCanvas();
    }
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <nav className="bg-transparent">
      <div className="px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center pt-8">
            <h1 className="text-3xl font-bold text-blue-600 leading-tight" style={{ fontFamily: "'Borel', cursive" }}>
              Startup Collab
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Back to Dashboard button */}
            {onBackToDashboard && (
              <button
                onClick={onBackToDashboard}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            )}

            {/* Delete Canvas button */}
            {onDeleteCanvas && (
              <button
                onClick={handleDeleteClick}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                title="Delete Canvas"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Canvas
              </button>
            )}
            
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

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">
                    Delete Canvas
                  </h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete "{canvasName || 'this canvas'}"? 
                  This action cannot be undone and will permanently remove the canvas and all its contents.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Canvas
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
