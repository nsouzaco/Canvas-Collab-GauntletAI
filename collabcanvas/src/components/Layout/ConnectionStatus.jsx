import React, { useState, useEffect } from 'react';
import { useCanvas } from '../../contexts/CanvasContext';
import { usePresence } from '../../hooks/usePresence';

const ConnectionStatus = () => {
  const { isOffline: canvasOffline, lastSyncTime } = useCanvas();
  const { isOffline: presenceOffline } = usePresence();
  const [showStatus, setShowStatus] = useState(false);

  const isOffline = canvasOffline || presenceOffline;

  useEffect(() => {
    if (isOffline) {
      setShowStatus(true);
      // Hide status after 3 seconds if connection is restored
      const timer = setTimeout(() => {
        if (!isOffline) {
          setShowStatus(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowStatus(false);
    }
  }, [isOffline]);

  if (!showStatus && !isOffline) return null;

  const formatLastSync = (timestamp) => {
    if (!timestamp) return 'Never';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isOffline ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
    }`}>
      <div className={`px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 ${
        isOffline 
          ? 'bg-amber-50 border-amber-200 text-amber-800' 
          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOffline ? 'bg-amber-500' : 'bg-emerald-500'
        }`}></div>
        
        <div className="flex flex-col">
          <div className="text-sm font-medium">
            {isOffline ? 'Connection Lost' : 'Connection Restored'}
          </div>
          {lastSyncTime && (
            <div className="text-xs opacity-75">
              Last sync: {formatLastSync(lastSyncTime)}
            </div>
          )}
        </div>

        {isOffline && (
          <div className="ml-2">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
