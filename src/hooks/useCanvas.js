import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToShapes, 
  createShape, 
  updateShape, 
  deleteShape, 
  lockShape, 
  unlockShape,
  updateShapeSelection,
  clearUserSelections,
  clearUserLocks
} from '../services/canvas';

export const useCanvas = () => {
  const { currentUser } = useAuth();
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to real-time shape updates
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToShapes((firebaseShapes) => {
      setShapes(firebaseShapes);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  // Add a new shape
  const addShape = useCallback(async (type, position) => {
    if (!currentUser) return null;

    // Generate smooth colors based on shape type
    const getShapeColor = (shapeType) => {
      const colors = {
        rectangle: [
          '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', 
          '#10B981', '#EF4444', '#6366F1', '#F97316'
        ],
        circle: [
          '#06B6D4', '#84CC16', '#F472B6', '#A78BFA',
          '#34D399', '#FBBF24', '#FB7185', '#60A5FA'
        ],
        text: '#F3F4F6'
      };
      
      const colorPalette = colors[shapeType] || colors.rectangle;
      return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    };

    const shapeData = {
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: position.x,
      y: position.y,
      width: 100,
      height: 100,
      fill: getShapeColor(type),
      text: type === 'text' ? 'Text' : undefined,
      createdBy: currentUser.uid
    };

    try {
      await createShape(shapeData);
      return shapeData.id;
    } catch (error) {
      console.error('Error creating shape:', error);
      return null;
    }
  }, [currentUser]);

  // Update an existing shape
  const updateShapeData = useCallback(async (id, updates) => {
    if (!currentUser) return;

    try {
      await updateShape(id, {
        ...updates,
        lastModifiedBy: currentUser.uid
      });
    } catch (error) {
      console.error('Error updating shape:', error);
    }
  }, [currentUser]);

  // Delete a shape
  const deleteShapeData = useCallback(async (id) => {
    if (!currentUser) return;

    try {
      await deleteShape(id);
    } catch (error) {
      console.error('Error deleting shape:', error);
    }
  }, [currentUser]);

  // Lock a shape
  const lockShapeData = useCallback(async (id) => {
    if (!currentUser) return;

    try {
      await lockShape(id, currentUser.uid);
    } catch (error) {
      console.error('Error locking shape:', error);
    }
  }, [currentUser]);

  // Unlock a shape
  const unlockShapeData = useCallback(async (id) => {
    if (!currentUser) return;

    try {
      await unlockShape(id);
    } catch (error) {
      console.error('Error unlocking shape:', error);
    }
  }, [currentUser]);

  // Update shape selection
  const selectShape = useCallback(async (id) => {
    if (!currentUser) return;

    try {
      await updateShapeSelection(id, currentUser.uid, true);
    } catch (error) {
      console.error('Error selecting shape:', error);
    }
  }, [currentUser]);

  // Deselect shape
  const deselectShape = useCallback(async (id) => {
    if (!currentUser) return;

    try {
      await updateShapeSelection(id, currentUser.uid, false);
    } catch (error) {
      console.error('Error deselecting shape:', error);
    }
  }, [currentUser]);

  // Clear all selections for current user
  const clearAllSelections = useCallback(async () => {
    if (!currentUser) return;

    try {
      await clearUserSelections(currentUser.uid);
    } catch (error) {
      console.error('Error clearing selections:', error);
    }
  }, [currentUser]);

  // Clear all locks for current user
  const clearAllLocks = useCallback(async () => {
    if (!currentUser) return;

    try {
      await clearUserLocks(currentUser.uid);
    } catch (error) {
      console.error('Error clearing locks:', error);
    }
  }, [currentUser]);

  return {
    shapes,
    loading,
    addShape,
    updateShape: updateShapeData,
    deleteShape: deleteShapeData,
    lockShape: lockShapeData,
    unlockShape: unlockShapeData,
    selectShape,
    deselectShape,
    clearAllSelections,
    clearAllLocks
  };
};
