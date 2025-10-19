import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  subscribeToShapes, 
  createShape, 
  createShapeWithoutSelection,
  updateShape, 
  deleteShape, 
  lockShape, 
  unlockShape,
  updateShapeSelection,
  clearUserSelections,
  clearUserLocks,
  subscribeToAllPositions,
  updateShapePosition,
  clearShapePosition
} from '../services/canvas';
import { CanvasPersistence, OfflineQueue } from '../utils/persistence';

export const useCanvas = () => {
  const { currentUser } = useAuth();
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [realTimePositions, setRealTimePositions] = useState({});
  const [isOffline, setIsOffline] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Load cached state on mount
  useEffect(() => {
    if (!currentUser) return;

    // Try to load cached canvas state first
    const cachedState = CanvasPersistence.loadCanvasState();
    if (cachedState && cachedState.shapes) {
      setShapes(cachedState.shapes);
      setLastSyncTime(cachedState.metadata?.lastSaved || null);
    }
  }, [currentUser]);

  // Subscribe to real-time shape updates
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToShapes((firebaseShapes) => {
      setShapes(firebaseShapes);
      setLoading(false);
      setIsOffline(false);
      setLastSyncTime(Date.now());
      
      // Cache the current state
      CanvasPersistence.saveCanvasState(firebaseShapes, {
        lastSync: Date.now(),
        source: 'firebase'
      });
    });

    return unsubscribe;
  }, [currentUser]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Subscribe to real-time position updates
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToAllPositions((positions) => {
      setRealTimePositions(positions);
    });

    return unsubscribe;
  }, [currentUser]);

  // Add a new shape without auto-selecting (for bulk operations)
  const addShapeWithoutSelection = useCallback(async (type, shapeDataOrPosition) => {
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
        text: '#F3F4F6',
        stickyNote: '#FEF68A',
        card: '#FFFFFF',
        list: '#F8FAFC'
      };
      
      const colorPalette = colors[shapeType] || colors.rectangle;
      return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    };

    // Check if we received full shape data (from AI) or just position (from manual creation)
    const isFullShapeData = shapeDataOrPosition && typeof shapeDataOrPosition === 'object' && 
      ('width' in shapeDataOrPosition || 'height' in shapeDataOrPosition || 'fill' in shapeDataOrPosition);

    let shapeData;
    if (isFullShapeData) {
      // AI provided full shape data - use it as-is but ensure required fields
      shapeData = {
        ...shapeDataOrPosition,
        id: shapeDataOrPosition.id || `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdBy: currentUser.uid
      };
    } else {
      // Manual creation - use defaults
      const position = shapeDataOrPosition;
      shapeData = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        x: position.x,
        y: position.y,
        width: type === 'stickyNote' ? 300 : type === 'card' ? 280 : type === 'list' ? 280 : 100,
        height: type === 'stickyNote' ? 350 : type === 'card' ? 200 : type === 'list' ? 320 : 100,
        fill: getShapeColor(type),
        ...(type === 'text' && { text: 'Text' }),
        ...(type === 'stickyNote' && { 
          text: 'Remember to:\n\n• Buy groceries\n• Call mom\n• Finish project\n• Water plants'
        }),
        ...(type === 'card' && { 
          title: 'Card Title',
          content: 'This is a card with some content. You can edit this text by double-clicking.',
          width: 280,
          height: 200
        }),
        ...(type === 'list' && { 
          title: 'Project Tasks',
          items: ['Design user interface', 'Implement authentication', 'Add real-time features', 'Write documentation', 'Deploy to production'],
          width: 280,
          height: 320
        }),
        createdBy: currentUser.uid
      };
    }

    // If offline, add to offline queue and update local state
    if (isOffline) {
      OfflineQueue.addAction({
        type: 'CREATE_SHAPE',
        data: shapeData
      });
      
      // Update local state immediately for better UX
      setShapes(prev => [...prev, shapeData]);
      CanvasPersistence.saveCanvasState([...shapes, shapeData], {
        lastSync: Date.now(),
        source: 'offline'
      });
      
      return shapeData.id;
    }

    try {
      await createShapeWithoutSelection(shapeData);
      // Update local state immediately for better UX
      setShapes(prev => {
        // Check if shape already exists to avoid duplicates
        if (prev.find(shape => shape.id === shapeData.id)) {
          return prev;
        }
        return [...prev, shapeData];
      });
      return shapeData.id;
    } catch (error) {
      console.error('Error creating shape:', error);
      
      // If Firebase fails, queue for later and update local state
      OfflineQueue.addAction({
        type: 'CREATE_SHAPE',
        data: shapeData
      });
      
      setShapes(prev => [...prev, shapeData]);
      CanvasPersistence.saveCanvasState([...shapes, shapeData], {
        lastSync: Date.now(),
        source: 'offline_fallback'
      });
      
      return shapeData.id;
    }
  }, [currentUser, isOffline, shapes]);

  // Add a new shape
  const addShape = useCallback(async (type, shapeDataOrPosition) => {
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
        text: '#F3F4F6',
        stickyNote: '#FEF68A',
        card: '#FFFFFF',
        list: '#F8FAFC'
      };
      
      const colorPalette = colors[shapeType] || colors.rectangle;
      return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    };

    // Check if we received full shape data (from AI) or just position (from manual creation)
    const isFullShapeData = shapeDataOrPosition && typeof shapeDataOrPosition === 'object' && 
      ('width' in shapeDataOrPosition || 'height' in shapeDataOrPosition || 'fill' in shapeDataOrPosition);

    let shapeData;
    if (isFullShapeData) {
      // AI provided full shape data - use it as-is but ensure required fields

      shapeData = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        x: shapeDataOrPosition.x,
        y: shapeDataOrPosition.y,
        width: shapeDataOrPosition.width || 100,
        height: shapeDataOrPosition.height || 100,
        fill: shapeDataOrPosition.fill || getShapeColor(type),
        stroke: shapeDataOrPosition.stroke || '#E5E7EB',
        strokeWidth: shapeDataOrPosition.strokeWidth || 1,
        ...(type === 'text' && { text: shapeDataOrPosition.text || 'Text' }),
        ...(type === 'stickyNote' && { 
          text: shapeDataOrPosition.text || 'Remember to:\n\n• Buy groceries\n• Call mom\n• Finish project\n• Water plants',
          width: 300,
          height: 350
        }),
        ...(type === 'card' && { 
          title: shapeDataOrPosition.title || 'Card Title',
          content: shapeDataOrPosition.content || 'This is a card with some content. You can edit this text by double-clicking.',
          width: 280,
          height: 200
        }),
        ...(type === 'list' && { 
          title: shapeDataOrPosition.title || 'Project Tasks',
          items: shapeDataOrPosition.items || ['Design user interface', 'Implement authentication', 'Add real-time features', 'Write documentation', 'Deploy to production'],
          width: 280,
          height: 320
        }),
        createdBy: currentUser.uid
      };
    } else {
      // Manual creation - use defaults
      const position = shapeDataOrPosition;
      shapeData = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        x: position.x,
        y: position.y,
        width: type === 'stickyNote' ? 300 : type === 'card' ? 280 : type === 'list' ? 280 : 100,
        height: type === 'stickyNote' ? 350 : type === 'card' ? 200 : type === 'list' ? 320 : 100,
        fill: getShapeColor(type),
        ...(type === 'text' && { text: 'Text' }),
        ...(type === 'stickyNote' && { 
          text: 'Remember to:\n\n• Buy groceries\n• Call mom\n• Finish project\n• Water plants'
        }),
        ...(type === 'card' && { 
          title: 'Card Title',
          content: 'This is a card with some content. You can edit this text by double-clicking.',
          width: 280,
          height: 200
        }),
        ...(type === 'list' && { 
          title: 'Project Tasks',
          items: ['Design user interface', 'Implement authentication', 'Add real-time features', 'Write documentation', 'Deploy to production'],
          width: 280,
          height: 320
        }),
        createdBy: currentUser.uid
      };
    }

    // If offline, add to offline queue and update local state
    if (isOffline) {
      OfflineQueue.addAction({
        type: 'CREATE_SHAPE',
        data: shapeData
      });
      
      // Update local state immediately for better UX
      setShapes(prev => [...prev, shapeData]);
      CanvasPersistence.saveCanvasState([...shapes, shapeData], {
        lastSync: Date.now(),
        source: 'offline'
      });
      
      return shapeData.id;
    }

    try {
      await createShape(shapeData);
      // Update local state immediately for better UX
      setShapes(prev => {
        // Check if shape already exists to avoid duplicates
        if (prev.find(shape => shape.id === shapeData.id)) {
          return prev;
        }
        return [...prev, shapeData];
      });
      return shapeData.id;
    } catch (error) {
      console.error('Error creating shape:', error);
      
      // If Firebase fails, queue for later and update local state
      OfflineQueue.addAction({
        type: 'CREATE_SHAPE',
        data: shapeData
      });
      
      setShapes(prev => [...prev, shapeData]);
      CanvasPersistence.saveCanvasState([...shapes, shapeData], {
        lastSync: Date.now(),
        source: 'offline_fallback'
      });
      
      return shapeData.id;
    }
  }, [currentUser, isOffline, shapes]);

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

  // Update real-time position during drag with improved throttling
  const updateRealTimePosition = useCallback(async (shapeId, x, y) => {
    if (!currentUser) return;

    try {
      await updateShapePosition(shapeId, x, y, currentUser.uid);
    } catch (error) {
      console.error('Error updating real-time position:', error);
    }
  }, [currentUser]);

  // Clear real-time position when drag ends
  const clearRealTimePosition = useCallback(async (shapeId) => {
    try {
      await clearShapePosition(shapeId);
    } catch (error) {
      console.error('Error clearing real-time position:', error);
    }
  }, []);

  return {
    shapes,
    loading,
    realTimePositions,
    isOffline,
    lastSyncTime,
    addShape,
    addShapeWithoutSelection,
    updateShape: updateShapeData,
    deleteShape: deleteShapeData,
    lockShape: lockShapeData,
    unlockShape: unlockShapeData,
    selectShape,
    deselectShape,
    clearAllSelections,
    clearAllLocks,
    updateRealTimePosition,
    clearRealTimePosition
  };
};
