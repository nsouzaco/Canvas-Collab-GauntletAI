import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateShapePosition, clearShapePosition } from '../services/canvas';
import { 
  throttle, 
  debounce, 
  updatePositionWithInterpolation,
  clearPositionCache,
  clearAllPositionCaches
} from '../utils/positionInterpolation';
import { usePerformanceMonitor } from '../utils/performanceMonitor';

/**
 * Optimized positioning hook for real-time collaboration
 * 
 * Features:
 * - Intelligent throttling based on movement speed
 * - Position interpolation for smooth movement
 * - Reduced Firebase writes
 * - Client-side prediction
 */
export const useOptimizedPositioning = (canvasId) => {
  const { currentUser } = useAuth();
  const { recordPositionUpdate, recordRenderCycle } = usePerformanceMonitor();
  const [isDragging, setIsDragging] = useState(false);
  const [dragShapeId, setDragShapeId] = useState(null);
  
  // Refs for tracking movement
  const lastPositionRef = useRef({});
  const velocityRef = useRef({});
  const lastUpdateTimeRef = useRef(0);
  
  // Throttled update function with adaptive throttling
  const throttledUpdatePosition = useCallback(
    throttle(async (shapeId, x, y) => {
      if (!currentUser || !canvasId) return;
      
      const startTime = Date.now();
      
      try {
        await updateShapePosition(canvasId, shapeId, x, y, currentUser.uid);
        lastUpdateTimeRef.current = Date.now();
        
        // Record performance metrics
        const latency = Date.now() - startTime;
        recordPositionUpdate(latency);
      } catch (error) {
        console.error('Error updating position:', error);
      }
    }, 8), // ~120 FPS for smoother updates
    [currentUser, canvasId, recordPositionUpdate]
  );

  // Debounced final position update
  const debouncedFinalUpdate = useCallback(
    debounce(async (shapeId, x, y) => {
      if (!currentUser || !canvasId) return;
      
      try {
        await updateShapePosition(canvasId, shapeId, x, y, currentUser.uid);
      } catch (error) {
        console.error('Error updating final position:', error);
      }
    }, 50),
    [currentUser, canvasId]
  );

  // Start drag operation
  const startDrag = useCallback((shapeId) => {
    setIsDragging(true);
    setDragShapeId(shapeId);
    clearPositionCache(shapeId);
  }, []);

  // Update position during drag with optimization
  const updateDragPosition = useCallback((shapeId, x, y) => {
    // Allow position updates for any shape during a drag operation
    // This enables multi-select where multiple shapes move together
    if (!isDragging) return;

    // Record render cycle for performance monitoring
    recordRenderCycle();

    const currentTime = Date.now();
    const lastPosition = lastPositionRef.current[shapeId];
    const lastTime = lastUpdateTimeRef.current;

    // Calculate velocity for adaptive throttling
    if (lastPosition && lastTime > 0) {
      const timeDelta = currentTime - lastTime;
      const distance = Math.sqrt(
        Math.pow(x - lastPosition.x, 2) + Math.pow(y - lastPosition.y, 2)
      );
      
      if (timeDelta > 0) {
        velocityRef.current[shapeId] = distance / timeDelta;
      }
    }

    // For the user dragging, send immediate updates without interpolation
    // The interpolation will only be applied for other users viewing the movement
    const velocity = velocityRef.current[shapeId] || 0;
    
    // Send immediate position update for real-time collaboration
    throttledUpdatePosition(shapeId, x, y);
    
    // Update final position (debounced)
    debouncedFinalUpdate(shapeId, x, y);

    // Store current position
    lastPositionRef.current[shapeId] = { x, y };
  }, [isDragging, throttledUpdatePosition, debouncedFinalUpdate, recordRenderCycle]);

  // End drag operation
  const endDrag = useCallback(async (shapeId) => {
    // Only reset the dragging state if this is the shape that initiated the drag
    if (dragShapeId === shapeId) {
      setIsDragging(false);
      setDragShapeId(null);
    }
    
    // Clear real-time position from database for any shape
    // This allows multi-selected shapes to all clear their positions
    try {
      await clearShapePosition(canvasId, shapeId);
    } catch (error) {
      console.error('Error clearing position:', error);
    }

    // Clear local caches
    clearPositionCache(shapeId);
    delete lastPositionRef.current[shapeId];
    delete velocityRef.current[shapeId];
  }, [dragShapeId, canvasId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllPositionCaches();
    };
  }, []);

  return {
    isDragging,
    dragShapeId,
    startDrag,
    updateDragPosition,
    endDrag
  };
};
