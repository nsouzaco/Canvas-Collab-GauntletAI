import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useCanvas as useCanvasHook } from '../hooks/useCanvas';
import { useAuth } from './AuthContext';
import { processAIOperation, validateAICommand } from '../utils/aiOperationHandler';
import { HistoryManager, createStateSnapshot, applyStateSnapshot } from '../utils/historyManager';

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
  
  // History management
  const historyManager = useRef(new HistoryManager());
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  
  // Grid visibility for exports
  const [isGridVisibleForExport, setIsGridVisibleForExport] = useState(true);
  
  // Update undo/redo state when selected shape changes
  useEffect(() => {
    if (selectedId) {
      const userOperations = historyManager.current.history.filter(op => 
        op.userId === currentUser?.uid && op.shapeId === selectedId
      );
      setCanUndo(userOperations.length > 0);
      setCanRedo(false); // Redo is disabled for now
    } else {
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [selectedId, currentUser?.uid]);
  
  // Update undo/redo state when history changes
  useEffect(() => {
    if (selectedId) {
      const userOperations = historyManager.current.history.filter(op => 
        op.userId === currentUser?.uid && op.shapeId === selectedId
      );
      setCanUndo(userOperations.length > 0);
      setCanRedo(false); // Redo is disabled for now
    }
  }, [historyManager.current.history.length, selectedId, currentUser?.uid]);
  
  // Use the real-time canvas hook
  const {
    shapes,
    loading,
    realTimePositions,
    addShape: addShapeToFirebase,
    addShapeWithoutSelection: addShapeWithoutSelectionToFirebase,
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

  // Update history state when shapes change
  useEffect(() => {
    setCanUndo(historyManager.current.canUndo());
    setCanRedo(historyManager.current.canRedo());
  }, [shapes]);

  const addShape = async (type, position) => {
    const shapeId = await addShapeToFirebase(type, position);
    if (shapeId) {
      // Add create operation to history (only for current user)
      try {
        if (historyManager.current && typeof historyManager.current.addOperation === 'function') {
          historyManager.current.addOperation({
            type: 'create',
            shapeId,
            shapeType: type,
            position,
            userId: currentUser?.uid
          });
        }
      } catch (error) {
        console.error('Error adding create operation to history:', error);
      }
      
      // Update undo/redo state (shape-scoped)
      const userOperations = historyManager.current.history.filter(op => 
        op.userId === currentUser?.uid && op.shapeId === selectedId
      );
      setCanUndo(userOperations.length > 0);
      setCanRedo(false); // Redo is disabled for now
      
      // Automatically select and lock the newly created shape
      await selectShape(shapeId);
    }
    return shapeId;
  };

  // Add shape without auto-selecting (for bulk operations)
  const addShapeWithoutSelection = async (type, position) => {
    const shapeId = await addShapeWithoutSelectionToFirebase(type, position);
    return shapeId;
  };

  const updateShape = async (id, updates) => {
    // Find the shape to get its current state
    const currentShape = shapes.find(s => s.id === id);
    if (!currentShape) return;
    
    // Save the previous state for undo
    const previousState = {
      x: currentShape.x,
      y: currentShape.y,
      width: currentShape.width,
      height: currentShape.height,
      fill: currentShape.fill,
      text: currentShape.text,
      fontSize: currentShape.fontSize
    };
    
    console.log('Saving previous state for undo:', previousState);
    console.log('Updates being applied:', updates);
    
    await updateShapeInFirebase(id, updates);
    
    // Add update operation to history (only for current user)
    try {
      if (historyManager.current && typeof historyManager.current.addOperation === 'function') {
        historyManager.current.addOperation({
          type: 'update',
          shapeId: id,
          previousState,
          newState: updates,
          userId: currentUser?.uid
        });
      }
    } catch (error) {
      console.error('Error adding operation to history:', error);
    }
    
    // Update undo/redo state
    try {
      setCanUndo(historyManager.current?.canUndo() || false);
      setCanRedo(historyManager.current?.canRedo() || false);
    } catch (error) {
      console.error('Error updating undo/redo state:', error);
      setCanUndo(false);
      setCanRedo(false);
    }
  };

  const deleteShape = async (id) => {
    // Find the shape to get its state for undo
    const shapeToDelete = shapes.find(s => s.id === id);
    if (!shapeToDelete) return;
    
    await deleteShapeFromFirebase(id);
    
    // Add delete operation to history (only for current user)
    try {
      if (historyManager.current && typeof historyManager.current.addOperation === 'function') {
        historyManager.current.addOperation({
          type: 'delete',
          shapeId: id,
          shapeData: {
            type: shapeToDelete.type,
            x: shapeToDelete.x,
            y: shapeToDelete.y,
            width: shapeToDelete.width,
            height: shapeToDelete.height,
            fill: shapeToDelete.fill,
            text: shapeToDelete.text,
            fontSize: shapeToDelete.fontSize
          },
          userId: currentUser?.uid
        });
      }
    } catch (error) {
      console.error('Error adding delete operation to history:', error);
    }
    
    // Update undo/redo state
    try {
      setCanUndo(historyManager.current?.canUndo() || false);
      setCanRedo(historyManager.current?.canRedo() || false);
    } catch (error) {
      console.error('Error updating undo/redo state:', error);
      setCanUndo(false);
      setCanRedo(false);
    }
    
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

  // Undo/Redo functionality (shape-scoped)
  const undo = async () => {
    // Only allow undo when a shape is selected
    if (!selectedId) {
      console.log('No shape selected, undo disabled');
      return;
    }
    
    console.log('Undo triggered for shape:', selectedId, 'canUndo:', canUndo);
    
    if (!canUndo) return;
    
    // Find the most recent operation by the current user for the selected shape
    const userOperations = historyManager.current.history.filter(op => 
      op.userId === currentUser?.uid && op.shapeId === selectedId
    );
    
    console.log('All operations in history:', historyManager.current.history);
    console.log('User operations for selected shape:', userOperations);
    console.log('Current user:', currentUser?.uid);
    console.log('Selected shape:', selectedId);
    
    if (userOperations.length === 0) {
      console.log('No undoable operations for selected shape');
      return;
    }
    
    const operation = userOperations[userOperations.length - 1];
    if (!operation) return;
    
    console.log('Undoing operation for shape', selectedId, ':', operation);
    
    try {
      switch (operation.type) {
        case 'create':
          // Undo create: delete the shape
          await deleteShapeFromFirebase(operation.shapeId);
          break;
          
        case 'delete':
          // Undo delete: recreate the shape
          await addShapeToFirebase(operation.shapeData.type, operation.shapeData);
          break;
          
        case 'update':
          // Undo update: restore previous state
          console.log('Undoing update for shape', operation.shapeId, 'Previous state:', operation.previousState);
          await updateShapeInFirebase(operation.shapeId, operation.previousState);
          break;
          
        default:
          console.warn('Unknown operation type:', operation.type);
      }
      
      // Remove the operation from history
      historyManager.current.history = historyManager.current.history.filter(op => op !== operation);
      historyManager.current.currentIndex = Math.max(0, historyManager.current.currentIndex - 1);
      
      // Update undo/redo state (shape-scoped)
      const remainingUserOperations = historyManager.current.history.filter(op => 
        op.userId === currentUser?.uid && op.shapeId === selectedId
      );
      setCanUndo(remainingUserOperations.length > 0);
      setCanRedo(false); // Redo is disabled for now
      
    } catch (error) {
      console.error('Error during undo:', error);
    }
  };

  const redo = async () => {
    if (!canRedo) return;
    
    // For redo, we need to look at the redo stack (operations that were undone)
    // This is more complex in a user-scoped system, so for now we'll disable redo
    // and focus on making undo work properly
    console.log('Redo is not yet implemented for user-scoped operations');
    return;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows/Linux) - only when shape is selected
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        if (selectedId) {
          e.preventDefault();
          undo();
        }
      }
      
      // Redo: Cmd+Shift+Z (Mac) or Ctrl+Y (Windows/Linux) - only when shape is selected
      if (((e.metaKey && e.shiftKey) || e.ctrlKey) && (e.key === 'z' || e.key === 'y')) {
        if (selectedId) {
          e.preventDefault();
          redo();
        }
      }
      
      // Delete selected shape
      if (selectedId && (e.key === 'Delete' || e.key === 'Backspace')) {
        e.preventDefault();
        deleteShape(selectedId);
      }
      
      // Duplicate selected shape (Cmd+D)
      if (selectedId && (e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        duplicateShape(selectedId);
      }
      
      // Arrow keys to move selected shape
      if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        moveShapeWithArrow(selectedId, e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, undo, redo, deleteShape]);

  // Duplicate shape function
  const duplicateShape = async (shapeId) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    // Create duplicate with offset position
    const duplicateData = {
      ...shape,
      x: shape.x + 20,
      y: shape.y + 20,
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    const newShapeId = await addShapeToFirebase(duplicateData.type, duplicateData);
    
    if (newShapeId) {
      // Add duplicate operation to history (only for current user)
      try {
        if (historyManager.current && typeof historyManager.current.addOperation === 'function') {
          historyManager.current.addOperation({
            type: 'create',
            shapeId: newShapeId,
            shapeType: duplicateData.type,
            position: { x: duplicateData.x, y: duplicateData.y },
            userId: currentUser?.uid
          });
        }
      } catch (error) {
        console.error('Error adding duplicate operation to history:', error);
      }
      
      // Update undo/redo state (shape-scoped)
      const userOperations = historyManager.current.history.filter(op => 
        op.userId === currentUser?.uid && op.shapeId === selectedId
      );
      setCanUndo(userOperations.length > 0);
      setCanRedo(false); // Redo is disabled for now
    }
  };

  // Move shape with arrow keys
  const moveShapeWithArrow = async (shapeId, direction) => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return;
    
    const moveDistance = 10; // pixels
    let deltaX = 0;
    let deltaY = 0;
    
    switch (direction) {
      case 'ArrowUp':
        deltaY = -moveDistance;
        break;
      case 'ArrowDown':
        deltaY = moveDistance;
        break;
      case 'ArrowLeft':
        deltaX = -moveDistance;
        break;
      case 'ArrowRight':
        deltaX = moveDistance;
        break;
    }
    
    await updateShape(shapeId, {
      x: shape.x + deltaX,
      y: shape.y + deltaY
    });
  };

  // Toggle grid visibility for exports
  const toggleGridVisibilityForExport = (visible) => {
    setIsGridVisibleForExport(visible);
  };

  // AI-powered operations (create, move, delete, resize)
  const executeAIOperation = async (parsedCommand) => {
    try {
      // Save current state before AI operation
      const currentSnapshot = createStateSnapshot(shapes);
      historyManager.current.addState(currentSnapshot, `AI: ${parsedCommand.operation}`);

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
    addShapeWithoutSelection,
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
    clearRealTimePosition,
    // Undo/Redo functionality
    undo,
    redo,
    canUndo,
    canRedo,
    // Keyboard shortcuts
    duplicateShape,
    moveShapeWithArrow,
    // Grid visibility for exports
    isGridVisibleForExport,
    toggleGridVisibilityForExport
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};
