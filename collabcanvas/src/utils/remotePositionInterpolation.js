/**
 * Remote Position Interpolation for Smooth Real-time Movement
 * 
 * This module provides utilities for smooth interpolation of shape positions
 * when viewing other users' movements, while keeping local dragging immediate.
 */

// Position interpolation cache for remote movements only
const remotePositionCache = new Map();

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
 * Smooth interpolation with easing for remote movements
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
 * Get interpolated position for a remote shape movement
 * @param {string} shapeId - Shape identifier
 * @param {Object} targetPosition - Target position {x, y}
 * @param {string} updatedBy - User ID who updated the position
 * @param {number} interpolationSpeed - Speed of interpolation (0-1)
 * @returns {Object} Interpolated position {x, y}
 */
export const getRemoteInterpolatedPosition = (shapeId, targetPosition, updatedBy, interpolationSpeed = 0.2) => {
  const cacheKey = `${shapeId}_${updatedBy}`;
  const cached = remotePositionCache.get(cacheKey);
  
  if (!cached) {
    // First position - no interpolation needed
    remotePositionCache.set(cacheKey, {
      x: targetPosition.x,
      y: targetPosition.y,
      timestamp: Date.now(),
      updatedBy
    });
    return targetPosition;
  }

  // Only interpolate if it's the same user updating
  if (cached.updatedBy !== updatedBy) {
    // Different user - reset cache and use new position
    remotePositionCache.set(cacheKey, {
      x: targetPosition.x,
      y: targetPosition.y,
      timestamp: Date.now(),
      updatedBy
    });
    return targetPosition;
  }

  // Calculate interpolated position
  const interpolatedX = smoothLerp(cached.x, targetPosition.x, interpolationSpeed);
  const interpolatedY = smoothLerp(cached.y, targetPosition.y, interpolationSpeed);

  // Update cache
  remotePositionCache.set(cacheKey, {
    x: interpolatedX,
    y: interpolatedY,
    timestamp: Date.now(),
    updatedBy
  });

  return { x: interpolatedX, y: interpolatedY };
};

/**
 * Clear position cache for a specific shape and user
 * @param {string} shapeId - Shape identifier
 * @param {string} updatedBy - User ID
 */
export const clearRemotePositionCache = (shapeId, updatedBy) => {
  const cacheKey = `${shapeId}_${updatedBy}`;
  remotePositionCache.delete(cacheKey);
};

/**
 * Clear all remote position caches
 */
export const clearAllRemotePositionCaches = () => {
  remotePositionCache.clear();
};

/**
 * Check if position has changed significantly for remote interpolation
 * @param {Object} oldPos - Old position {x, y}
 * @param {Object} newPos - New position {x, y}
 * @param {number} threshold - Minimum change threshold
 * @returns {boolean} True if position changed significantly
 */
export const hasSignificantRemoteChange = (oldPos, newPos, threshold = 3) => {
  if (!oldPos) return true;
  const distance = Math.sqrt(
    Math.pow(newPos.x - oldPos.x, 2) + Math.pow(newPos.y - oldPos.y, 2)
  );
  return distance > threshold;
};

/**
 * Get smooth position for remote user movement
 * @param {string} shapeId - Shape identifier
 * @param {Object} realTimePosition - Real-time position from Firebase
 * @param {string} currentUserId - Current user's ID
 * @returns {Object} Smooth position for display
 */
export const getSmoothRemotePosition = (shapeId, realTimePosition, currentUserId) => {
  // Only interpolate if it's not the current user's movement
  if (realTimePosition.updatedBy === currentUserId) {
    return null; // Don't interpolate own movements
  }

  // Check if position change is significant enough to interpolate
  const cacheKey = `${shapeId}_${realTimePosition.updatedBy}`;
  const cached = remotePositionCache.get(cacheKey);
  
  if (cached && !hasSignificantRemoteChange(cached, realTimePosition, 2)) {
    return cached; // Use cached position if change is too small
  }

  // Get interpolated position
  return getRemoteInterpolatedPosition(
    shapeId,
    realTimePosition,
    realTimePosition.updatedBy,
    0.2 // Moderate interpolation speed for smooth but responsive movement
  );
};
