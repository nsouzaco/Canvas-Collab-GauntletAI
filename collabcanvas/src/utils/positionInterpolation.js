/**
 * Position Interpolation Utilities for Smooth Real-time Movement
 * 
 * This module provides utilities for smooth interpolation of shape positions
 * during real-time collaboration, reducing lag and improving visual smoothness.
 */

// Position interpolation cache to store previous positions
const positionCache = new Map();

// Animation frame queue for smooth interpolation
let animationFrameId = null;
const interpolationQueue = new Map();

/**
 * Linear interpolation between two points
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {number} Interpolated value
 */
export const lerp = (start, end, factor) => {
  return start + (end - start) * factor;
};

/**
 * Smooth interpolation with easing
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} factor - Interpolation factor (0-1)
 * @returns {number} Smoothly interpolated value
 */
export const smoothLerp = (start, end, factor) => {
  // Easing function for smoother movement
  const easeFactor = factor * factor * (3 - 2 * factor);
  return lerp(start, end, easeFactor);
};

/**
 * Get interpolated position for a shape
 * @param {string} shapeId - Shape identifier
 * @param {Object} targetPosition - Target position {x, y}
 * @param {number} interpolationSpeed - Speed of interpolation (0-1)
 * @returns {Object} Interpolated position {x, y}
 */
export const getInterpolatedPosition = (shapeId, targetPosition, interpolationSpeed = 0.15) => {
  const cached = positionCache.get(shapeId);
  
  if (!cached) {
    // First position - no interpolation needed
    positionCache.set(shapeId, {
      x: targetPosition.x,
      y: targetPosition.y,
      timestamp: Date.now()
    });
    return targetPosition;
  }

  // Calculate interpolated position
  const interpolatedX = smoothLerp(cached.x, targetPosition.x, interpolationSpeed);
  const interpolatedY = smoothLerp(cached.y, targetPosition.y, interpolationSpeed);

  // Update cache
  positionCache.set(shapeId, {
    x: interpolatedX,
    y: interpolatedY,
    timestamp: Date.now()
  });

  return { x: interpolatedX, y: interpolatedY };
};

/**
 * Clear position cache for a shape
 * @param {string} shapeId - Shape identifier
 */
export const clearPositionCache = (shapeId) => {
  positionCache.delete(shapeId);
  interpolationQueue.delete(shapeId);
};

/**
 * Clear all position caches
 */
export const clearAllPositionCaches = () => {
  positionCache.clear();
  interpolationQueue.clear();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

/**
 * Throttle function for position updates
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

/**
 * Debounce function for position updates
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Calculate distance between two points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} Distance between points
 */
export const calculateDistance = (point1, point2) => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Check if position has changed significantly
 * @param {Object} oldPos - Old position {x, y}
 * @param {Object} newPos - New position {x, y}
 * @param {number} threshold - Minimum change threshold
 * @returns {boolean} True if position changed significantly
 */
export const hasSignificantChange = (oldPos, newPos, threshold = 2) => {
  if (!oldPos) return true;
  return calculateDistance(oldPos, newPos) > threshold;
};

/**
 * Optimized position update with interpolation
 * @param {string} shapeId - Shape identifier
 * @param {Object} newPosition - New position {x, y}
 * @param {Function} updateCallback - Callback to update position
 * @param {Object} options - Options for interpolation
 * @returns {Object} Interpolated position
 */
export const updatePositionWithInterpolation = (
  shapeId, 
  newPosition, 
  updateCallback, 
  options = {}
) => {
  const {
    interpolationSpeed = 0.15,
    minChangeThreshold = 1,
    maxInterpolationDistance = 100
  } = options;

  const cached = positionCache.get(shapeId);
  
  // Skip interpolation if change is too small
  if (cached && !hasSignificantChange(cached, newPosition, minChangeThreshold)) {
    return cached;
  }

  // Skip interpolation if distance is too large (teleportation)
  if (cached && calculateDistance(cached, newPosition) > maxInterpolationDistance) {
    positionCache.set(shapeId, newPosition);
    updateCallback(newPosition);
    return newPosition;
  }

  // Get interpolated position
  const interpolatedPos = getInterpolatedPosition(shapeId, newPosition, interpolationSpeed);
  
  // Update the visual position
  updateCallback(interpolatedPos);
  
  return interpolatedPos;
};
