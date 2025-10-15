import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateCursorPosition } from '../services/presence';

export const useCursors = (stagePos, scale) => {
  const { currentUser } = useAuth();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // Throttle cursor updates to avoid too many Firebase writes
  const throttledUpdateCursor = useCallback(
    (() => {
      let lastUpdate = 0;
      const throttleDelay = 50; // Update every 50ms (20 FPS)

      return (x, y) => {
        const now = Date.now();
        if (now - lastUpdate > throttleDelay) {
          lastUpdate = now;
          if (currentUser) {
            updateCursorPosition(currentUser.uid, x, y);
          }
        }
      };
    })(),
    [currentUser]
  );

  // Handle mouse movement
  const handleMouseMove = useCallback((e) => {
    if (!currentUser) return;

    const stage = e.target.getStage();
    if (!stage) return;

    // Get mouse position relative to the stage
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Convert screen coordinates to canvas coordinates
    const canvasX = (pointer.x - stagePos.x) / scale;
    const canvasY = (pointer.y - stagePos.y) / scale;

    setCursorPosition({ x: canvasX, y: canvasY });
    throttledUpdateCursor(canvasX, canvasY);
  }, [currentUser, throttledUpdateCursor, stagePos, scale]);

  return {
    cursorPosition,
    handleMouseMove
  };
};
