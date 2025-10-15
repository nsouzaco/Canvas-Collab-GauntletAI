// Canvas dimensions - use screen width for responsive sizing
export const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300); // Account for sidebar
export const CANVAS_HEIGHT = 1000;

// Viewport dimensions (what user sees)
export const VIEWPORT_WIDTH = Math.min(1200, window.innerWidth - 300);
export const VIEWPORT_HEIGHT = 800;

// Zoom limits
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 3;

// Default zoom level
export const DEFAULT_ZOOM = 1;
