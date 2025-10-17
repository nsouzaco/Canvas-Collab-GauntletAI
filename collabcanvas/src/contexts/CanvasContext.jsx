import React, { createContext, useContext, useState, useRef } from 'react';
import { useCanvas as useCanvasHook } from '../hooks/useCanvas';
import { useAuth } from './AuthContext';
import { processAIOperation, validateAICommand } from '../utils/aiOperationHandler';

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
  const [currentTool, setCurrentTool] = useState('select'); // Default to select tool
  const stageRef = useRef(null);
  const { currentUser } = useAuth();
  
  // Use the real-time canvas hook
  const {
    shapes,
    loading,
    realTimePositions,
    addShape: addShapeToFirebase,
    updateShape: updateShapeInFirebase,
    deleteShape: deleteShapeFromFirebase,
    lockShape: lockShapeInFirebase,
    unlockShape: unlockShapeInFirebase,
    selectShape: selectShapeInFirebase,
    deselectShape: deselectShapeInFirebase,
    clearAllSelections: clearAllSelectionsInFirebase,
    clearAllLocks: clearAllLocksInFirebase,
    updateRealTimePosition,
    clearRealTimePosition
  } = useCanvasHook();

  const addShape = async (type, position) => {
    const shapeId = await addShapeToFirebase(type, position);
    if (shapeId) {
      // Automatically select and lock the newly created shape
      await selectShape(shapeId);
    }
    return shapeId;
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
    // Check if the shape is already locked by another user
    const shape = shapes.find(s => s.id === id);
    console.log(`🎯 Attempting to select shape ${id}:`, {
      shape: shape ? { id: shape.id, lockedBy: shape.lockedBy, selectedBy: shape.selectedBy } : null,
      currentUser: currentUser?.uid
    });
    
    if (shape && shape.lockedBy && shape.lockedBy !== currentUser?.uid) {
      console.log(`🚫 Shape ${id} is locked by ${shape.lockedBy}, blocking selection for ${currentUser?.uid}`);
      return; // Don't allow selection if locked by another user
    }
    
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
    
    // Lock the shape first, then select it
    console.log(`🔒 Locking shape ${id} for user ${currentUser.uid}`);
    await lockShapeInFirebase(id, currentUser.uid);
    // Set local state immediately after lock is applied
    setSelectedId(id);
    console.log(`✅ Selecting shape ${id} for user ${currentUser.uid}`);
    await selectShapeInFirebase(id);
  };

  const deselectAll = async () => {
    // Unlock any shapes locked by current user
    const currentUserShapes = shapes.filter(shape => 
      shape.lockedBy === currentUser?.uid
    );
    
    console.log(`🔓 Deselecting all shapes for user ${currentUser?.uid}:`, currentUserShapes.map(s => s.id));
    
    for (const shape of currentUserShapes) {
      try {
        console.log(`🔓 Unlocking shape ${shape.id}`);
        await unlockShapeInFirebase(shape.id);
      } catch (error) {
        console.error('Error unlocking shape:', error);
      }
    }
    
    try {
      await clearAllSelectionsInFirebase();
    } catch (error) {
      console.error('Error clearing selections:', error);
    }
    
    setSelectedId(null);
  };

  // AI-powered operations (create, move, delete, resize)
  const executeAIOperation = async (parsedCommand) => {
    try {
      // Remove validation - let LLM handle incomplete commands
      // const validation = validateAICommand(parsedCommand);
      // if (!validation.isValid) {
      //   throw new Error(validation.errors.join(', '));
      // }

      // Define available operations
      const operations = {
        createShape: async (type, shapeData) => {
          console.log('🎨 CanvasContext: Creating shape with data:', { type, shapeData });
          const shapeId = await addShapeToFirebase(type, shapeData);
          if (shapeId) {
            // Automatically select and lock the newly created shape
            await selectShape(shapeId);
          }
          return shapeId;
        },
        moveShape: async (shapeId, x, y) => {
          return await updateShape(shapeId, { x, y });
        },
        deleteShape: async (shapeId) => {
          return await deleteShape(shapeId);
        },
        resizeShape: async (shapeId, sizeData) => {
          return await updateShape(shapeId, sizeData);
        }
      };

      // Process the AI operation
      const result = await processAIOperation(parsedCommand, shapes, operations);
      
      console.log(`🤖 AI operation completed:`, result);
      return result;
    } catch (error) {
      console.error('Error executing AI operation:', error);
      throw error;
    }
  };

  const value = {
    shapes,
    selectedId,
    currentTool,
    setCurrentTool,
    stageRef,
    loading,
    realTimePositions,
    addShape,
    updateShape,
    deleteShape,
    selectShape,
    deselectAll,
    executeAIOperation,
    lockShape: lockShapeInFirebase,
    unlockShape: unlockShapeInFirebase,
    updateRealTimePosition,
    clearRealTimePosition
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};
