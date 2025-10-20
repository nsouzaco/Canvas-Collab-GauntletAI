import React, { useState } from 'react';
import { useCanvas } from '../../contexts/CanvasContext';
import { usePresence } from '../../hooks/usePresence';
import PresenceList from '../Collaboration/PresenceList';
import AIChatInput from '../AI/AIChatInput';

const CanvasControls = () => {
  const { shapes, executeAIOperation, isOffline, lastSyncTime, canvasMetadata } = useCanvas();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Get online users for editing indicators
  const { onlineUsers, isOffline: presenceOffline } = usePresence();

  // Check if any shape is being edited (locked)
  const anyShapeBeingEdited = shapes.some(shape => shape.lockedBy);
  const editingShapes = shapes.filter(shape => shape.lockedBy);

  const isOfflineMode = isOffline || presenceOffline;

  return (
    <div className="relative">
      {/* Collapse/Expand Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 z-20 bg-white border border-gray-200 rounded-full p-1.5 shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Sidebar Content */}
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-64 opacity-100'}`}>
      {/* Connection Status */}
      {isOfflineMode && (
        <div className="p-3 bg-amber-50 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-amber-800">Offline Mode</span>
          </div>
          {lastSyncTime && (
            <div className="text-xs text-amber-600 mt-1">
              Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Online Users Section */}
      <div className="p-4 border-b border-gray-100">
        <PresenceList />
      </div>
      
      {/* Activity Indicators */}
      {anyShapeBeingEdited && (
        <div className="p-4 border-b border-gray-100">
          {/* Global editing indicator */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h4 className="text-xs font-medium text-blue-800">Editing</h4>
            </div>
            <div className="space-y-1">
              {editingShapes.map(shape => {
                const user = onlineUsers.find(u => u.userId === shape.lockedBy);
                const userName = user ? user.displayName : 'Unknown User';
                return (
                  <div key={shape.id} className="text-xs text-blue-700 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    {userName}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* AI Assistant */}
      <div className="p-4">
        <AIChatInput
          isVisible={true}
          onToggle={() => {}} // No toggle needed since it's always visible in sidebar
          canvasMetadata={canvasMetadata}
          onShapeCreate={(parsedCommand, originalCommand, conversationHistory) => executeAIOperation(parsedCommand, originalCommand, conversationHistory, canvasMetadata)}
        />
      </div>
      </div>
    </div>
  );
};

export default CanvasControls;
