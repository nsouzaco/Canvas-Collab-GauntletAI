import React from 'react';
import { useCanvas } from '../../contexts/CanvasContext';
import { usePresence } from '../../hooks/usePresence';
import PresenceList from '../Collaboration/PresenceList';

const CanvasControls = () => {
  const { shapes } = useCanvas();
  
  // Get online users for editing indicators
  const { onlineUsers } = usePresence();

  // Check if any shape is being edited
  const anyShapeBeingEdited = shapes.some(shape => shape.isLocked && shape.lockedBy);
  const editingShapes = shapes.filter(shape => shape.isLocked && shape.lockedBy);
  
  // Check if any shape is selected
  const anyShapeSelected = shapes.some(shape => shape.isSelected && shape.selectedBy);
  const selectedShapes = shapes.filter(shape => shape.isSelected && shape.selectedBy);

  return (
    <div className="bg-white rounded-lg shadow-md p-3 space-y-2 w-48">
      {/* Online Users Section */}
      <PresenceList />
      
      {/* Show selected shapes */}
      {anyShapeSelected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2">
          <h4 className="text-xs font-semibold text-green-800 mb-1">Selected</h4>
          {selectedShapes.map(shape => {
            const user = onlineUsers.find(u => u.userId === shape.selectedBy);
            const userName = user ? user.displayName : 'Unknown User';
            return (
              <div key={shape.id} className="text-xs text-green-700">
                👤 {userName}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Global editing indicator */}
      {anyShapeBeingEdited && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <h4 className="text-xs font-semibold text-blue-800 mb-1">Editing</h4>
          {editingShapes.map(shape => {
            const user = onlineUsers.find(u => u.userId === shape.lockedBy);
            const userName = user ? user.displayName : 'Unknown User';
            return (
              <div key={shape.id} className="text-xs text-blue-700">
                👤 {userName}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CanvasControls;
