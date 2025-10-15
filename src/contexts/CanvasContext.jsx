import React, { createContext, useContext, useState, useRef } from 'react';
import { useCanvas as useCanvasHook } from '../hooks/useCanvas';
import { useAuth } from './AuthContext';

const CanvasContext = createContext();

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

export const CanvasProvider = ({ children }) => {
  const [selectedId, setSelectedId] = useState(null);
  const stageRef = useRef(null);
  const { currentUser } = useAuth();
  
  // Use the real-time canvas hook
  const {
    shapes,
    loading,
    addShape: addShapeToFirebase,
    updateShape: updateShapeInFirebase,
    deleteShape: deleteShapeFromFirebase,
    lockShape: lockShapeInFirebase,
    unlockShape: unlockShapeInFirebase,
    selectShape: selectShapeInFirebase,
    deselectShape: deselectShapeInFirebase,
    clearAllSelections: clearAllSelectionsInFirebase,
    clearAllLocks: clearAllLocksInFirebase
  } = useCanvasHook();

  const addShape = async (type, position) => {
    return await addShapeToFirebase(type, position);
  };

  const updateShape = async (id, updates) => {
    await updateShapeInFirebase(id, updates);
  };

  const deleteShape = async (id) => {
    await deleteShapeFromFirebase(id);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const selectShape = async (id) => {
    // First unlock any currently locked shapes by this user
    const currentUserShapes = shapes.filter(shape => 
      shape.lockedBy === currentUser?.uid && shape.id !== id
    );
    
    for (const shape of currentUserShapes) {
      try {
        await unlockShapeInFirebase(shape.id);
      } catch (error) {
        console.error('Error unlocking previous shape:', error);
      }
    }
    
    // Then deselect any currently selected shape
    if (selectedId && selectedId !== id) {
      await deselectShapeInFirebase(selectedId);
    }
    
    setSelectedId(id);
    await selectShapeInFirebase(id);
  };

  const deselectAll = async () => {
    try {
      await clearAllSelectionsInFirebase();
    } catch (error) {
      console.error('Error clearing selections:', error);
    }
    
    try {
      await clearAllLocksInFirebase();
    } catch (error) {
      console.error('Error clearing locks:', error);
    }
    
    setSelectedId(null);
  };

  const value = {
    shapes,
    selectedId,
    stageRef,
    loading,
    addShape,
    updateShape,
    deleteShape,
    selectShape,
    deselectAll,
    lockShape: lockShapeInFirebase,
    unlockShape: unlockShapeInFirebase
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};
