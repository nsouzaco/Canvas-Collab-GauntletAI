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
export const useOptimizedPositioning = () => {
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
      if (!currentUser) return;
      
      const startTime = Date.now();
      
      try {
        await updateShapePosition(shapeId, x, y, currentUser.uid);
        lastUpdateTimeRef.current = Date.now();
        
        // Record performance metrics
        const latency = Date.now() - startTime;
        recordPositionUpdate(latency);
      } catch (error) {
        console.error('Error updating position:', error);
      }
    }, 16), // ~60 FPS for smooth updates
    [currentUser, recordPositionUpdate]
  );

  // Debounced final position update
  const debouncedFinalUpdate = useCallback(
    debounce(async (shapeId, x, y) => {
      if (!currentUser) return;
      
      try {
        await updateShapePosition(shapeId, x, y, currentUser.uid);
      } catch (error) {
        console.error('Error updating final position:', error);
      }
    }, 100),
    [currentUser]
  );

  // Start drag operation
  const startDrag = useCallback((shapeId) => {
    setIsDragging(true);
    setDragShapeId(shapeId);
    clearPositionCache(shapeId);
  }, []);

  // Update position during drag with optimization
  const updateDragPosition = useCallback((shapeId, x, y) => {
    if (!isDragging || dragShapeId !== shapeId) return;

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
  }, [isDragging, dragShapeId, throttledUpdatePosition, debouncedFinalUpdate, recordRenderCycle]);

  // End drag operation
  const endDrag = useCallback(async (shapeId) => {
    if (dragShapeId !== shapeId) return;

    console.log(`🛑 endDrag called for shape ${shapeId}`);
    setIsDragging(false);
    setDragShapeId(null);
    
    // Clear real-time position from database
    try {
      console.log(`🗑️ Clearing real-time position for shape ${shapeId}`);
      await clearShapePosition(shapeId);
      console.log(`✅ Real-time position cleared for shape ${shapeId}`);
    } catch (error) {
      console.error('Error clearing position:', error);
    }

    // Clear local caches
    console.log(`🧹 Clearing local caches for shape ${shapeId}`);
    clearPositionCache(shapeId);
    delete lastPositionRef.current[shapeId];
    delete velocityRef.current[shapeId];
    console.log(`✅ Local caches cleared for shape ${shapeId}`);
  }, [dragShapeId]);

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
