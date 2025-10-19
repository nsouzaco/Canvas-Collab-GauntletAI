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
  const [selectedIds, setSelectedIds] = useState([]); // Multi-selection state
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

    
    if (shape && shape.lockedBy && shape.lockedBy !== currentUser?.uid) {
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
    await lockShapeInFirebase(id, currentUser.uid);
    // Set local state immediately after lock is applied
    setSelectedId(id);
    await selectShapeInFirebase(id);
  };

  const deselectAll = async () => {
    // Unlock any shapes locked by current user
    const currentUserShapes = shapes.filter(shape => 
      shape.lockedBy === currentUser?.uid
    );
    
    
    for (const shape of currentUserShapes) {
      try {
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
    setSelectedIds([]);
  };

  // Multi-selection functions
  const toggleShapeSelection = async (id) => {
    if (currentTool !== 'multiselect') return;
    
    const shape = shapes.find(s => s.id === id);
    if (shape && shape.lockedBy && shape.lockedBy !== currentUser?.uid) {
      return; // Don't allow selection if locked by another user
    }

    setSelectedIds(prev => {
      if (prev.includes(id)) {
        // Remove from selection
        const newSelection = prev.filter(shapeId => shapeId !== id);
        if (newSelection.length === 0) {
          setSelectedId(null);
        } else if (newSelection.length === 1) {
          setSelectedId(newSelection[0]);
        }
        return newSelection;
      } else {
        // Add to selection
        const newSelection = [...prev, id];
        if (newSelection.length === 1) {
          setSelectedId(id);
        }
        return newSelection;
      }
    });
  };

  const selectMultipleShapes = async (ids) => {
    if (currentTool !== 'multiselect') return;
    
    // Filter out shapes locked by other users
    const availableIds = ids.filter(id => {
      const shape = shapes.find(s => s.id === id);
      return !shape || !shape.lockedBy || shape.lockedBy === currentUser?.uid;
    });

    setSelectedIds(availableIds);
    if (availableIds.length === 1) {
      setSelectedId(availableIds[0]);
    } else if (availableIds.length > 1) {
      setSelectedId(null); // Multi-selection mode
    } else {
      setSelectedId(null);
    }
  };

  const clearMultiSelection = () => {
    setSelectedIds([]);
    setSelectedId(null);
  };

  // Bulk operations for multi-selected shapes
  const deleteSelectedShapes = async () => {
    for (const id of selectedIds) {
      await deleteShape(id);
    }
    clearMultiSelection();
  };

  const moveSelectedShapes = async (deltaX, deltaY) => {
    for (const id of selectedIds) {
      const shape = shapes.find(s => s.id === id);
      if (shape) {
        await updateShape(id, { 
          x: shape.x + deltaX, 
          y: shape.y + deltaY 
        });
      }
    }
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

      // Process the AI operation - LLM handles text extraction intelligently
      const result = await processAIOperation(parsedCommand, shapes, operations);
      
      return result;
    } catch (error) {
      console.error('Error executing AI operation:', error);
      throw error;
    }
  };

  const value = {
    shapes,
    selectedId,
    selectedIds,
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
    toggleShapeSelection,
    selectMultipleShapes,
    clearMultiSelection,
    deleteSelectedShapes,
    moveSelectedShapes,
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
