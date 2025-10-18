// Viewport dimensions (what user sees) - now responsive
export const getViewportDimensions = () => {
  const availableWidth = window.innerWidth; // Take full width, no padding on sides
  const availableHeight = window.innerHeight - 80; // Account for navbar (80px) only
  
  return {
    width: Math.max(800, availableWidth), // Minimum 800px width
    height: Math.max(600, availableHeight) // Minimum 600px height
  };
};

// Canvas dimensions - use responsive dimensions to match viewport
export const getCanvasDimensions = () => {
  const viewport = getViewportDimensions();
  return {
    width: viewport.width, // Match viewport width
    height: Math.max(viewport.height, 1000) // Use viewport height or minimum 1000px
  };
};

// Default canvas dimensions
export const CANVAS_WIDTH = getCanvasDimensions().width;
export const CANVAS_HEIGHT = getCanvasDimensions().height;

// Default viewport dimensions
export const VIEWPORT_WIDTH = getViewportDimensions().width;
export const VIEWPORT_HEIGHT = getViewportDimensions().height;

// Zoom limits
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;

// Default zoom level
export const DEFAULT_ZOOM = 1;
