/**
 * Snap-to-grid utilities
 * Handles grid snapping for shapes and objects
 */

export const GRID_SIZE = 20;

/**
 * Snap a coordinate to the nearest grid point
 * @param {number} coordinate - Coordinate to snap
 * @param {number} gridSize - Grid size (default: 20)
 * @returns {number} Snapped coordinate
 */
export const snapToGrid = (coordinate, gridSize = GRID_SIZE) => {
  return Math.round(coordinate / gridSize) * gridSize;
};

/**
 * Snap a position object to the grid
 * @param {Object} position - Position object with x, y
 * @param {number} gridSize - Grid size (default: 20)
 * @returns {Object} Snapped position
 */
export const snapPositionToGrid = (position, gridSize = GRID_SIZE) => {
  return {
    x: snapToGrid(position.x, gridSize),
    y: snapToGrid(position.y, gridSize)
  };
};

/**
 * Snap shape dimensions to grid
 * @param {Object} shape - Shape object
 * @param {number} gridSize - Grid size (default: 20)
 * @returns {Object} Snapped shape
 */
export const snapShapeToGrid = (shape, gridSize = GRID_SIZE) => {
  return {
    ...shape,
    x: snapToGrid(shape.x, gridSize),
    y: snapToGrid(shape.y, gridSize),
    width: Math.max(gridSize, snapToGrid(shape.width, gridSize)),
    height: Math.max(gridSize, snapToGrid(shape.height, gridSize))
  };
};

/**
 * Check if a position is close to a grid line (for visual feedback)
 * @param {number} coordinate - Coordinate to check
 * @param {number} threshold - Distance threshold (default: 5)
 * @param {number} gridSize - Grid size (default: 20)
 * @returns {boolean} True if close to grid line
 */
export const isNearGridLine = (coordinate, threshold = 5, gridSize = GRID_SIZE) => {
  const remainder = coordinate % gridSize;
  return remainder < threshold || remainder > (gridSize - threshold);
};

/**
 * Get grid lines for visual display
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} gridSize - Grid size (default: 20)
 * @returns {Array} Array of grid line objects
 */
export const getGridLines = (width, height, gridSize = GRID_SIZE) => {
  const lines = [];
  
  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    lines.push({
      type: 'vertical',
      x,
      y1: 0,
      y2: height,
      opacity: x % (gridSize * 5) === 0 ? 0.3 : 0.1 // Major grid lines every 5 units
    });
  }
  
  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    lines.push({
      type: 'horizontal',
      y,
      x1: 0,
      x2: width,
      opacity: y % (gridSize * 5) === 0 ? 0.3 : 0.1 // Major grid lines every 5 units
    });
  }
  
  return lines;
};

/**
 * Snap multiple shapes to grid
 * @param {Array} shapes - Array of shapes
 * @param {number} gridSize - Grid size (default: 20)
 * @returns {Array} Array of snapped shapes
 */
export const snapShapesToGrid = (shapes, gridSize = GRID_SIZE) => {
  return shapes.map(shape => snapShapeToGrid(shape, gridSize));
};

/**
 * Get the nearest grid point to a coordinate
 * @param {number} coordinate - Coordinate to find nearest grid point for
 * @param {number} gridSize - Grid size (default: 20)
 * @returns {Object} Object with coordinate and distance to grid point
 */
export const getNearestGridPoint = (coordinate, gridSize = GRID_SIZE) => {
  const snapped = snapToGrid(coordinate, gridSize);
  return {
    coordinate: snapped,
    distance: Math.abs(coordinate - snapped)
  };
};
