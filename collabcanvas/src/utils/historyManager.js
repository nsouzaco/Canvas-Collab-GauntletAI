/**
 * History Manager for Canvas Operations
 * Handles undo/redo functionality with operation-based approach
 */

export class HistoryManager {
  constructor(maxHistorySize = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Add a new operation to history
   * @param {Object} operation - The operation to save
   */
  addOperation(operation) {
    // Remove any operations after current index (when branching from history)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new operation
    this.history.push({
      ...operation,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  /**
   * Get the previous operation for undo
   * @returns {Object|null} Previous operation or null if no undo available
   */
  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Get the next operation for redo
   * @returns {Object|null} Next operation or null if no redo available
   */
  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Check if undo is available
   * @returns {boolean}
   */
  canUndo() {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is available
   * @returns {boolean}
   */
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current operation
   * @returns {Object|null}
   */
  getCurrentOperation() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  /**
   * Clear all history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * Get history info for debugging
   * @returns {Object}
   */
  getHistoryInfo() {
    return {
      totalOperations: this.history.length,
      currentIndex: this.currentIndex,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      recentOperations: this.history.slice(-5).map(h => h.type)
    };
  }
}

/**
 * Create a snapshot of the current canvas state
 * @param {Array} shapes - Current shapes array
 * @returns {Object} State snapshot
 */
export const createStateSnapshot = (shapes) => {
  return {
    shapes: shapes.map(shape => ({
      id: shape.id,
      type: shape.type,
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      text: shape.text,
      title: shape.title,
      content: shape.content,
      items: shape.items,
      fontSize: shape.fontSize,
      createdBy: shape.createdBy,
      createdAt: shape.createdAt,
      lastModifiedBy: shape.lastModifiedBy,
      lastModifiedAt: shape.lastModifiedAt
    })),
    timestamp: Date.now()
  };
};

/**
 * Apply a state snapshot to the canvas
 * @param {Object} snapshot - State snapshot to apply
 * @returns {Array} New shapes array
 */
export const applyStateSnapshot = (snapshot) => {
  return snapshot.shapes.map(shape => ({
    ...shape,
    // Ensure all required properties are present
    id: shape.id,
    type: shape.type,
    x: shape.x || 0,
    y: shape.y || 0,
    width: shape.width || 100,
    height: shape.height || 100,
    fill: shape.fill || '#3b82f6',
    stroke: shape.stroke || '#E5E7EB',
    strokeWidth: shape.strokeWidth || 1,
    text: shape.text || '',
    title: shape.title || '',
    content: shape.content || '',
    items: shape.items || [],
    fontSize: shape.fontSize || 14,
    createdBy: shape.createdBy || '',
    createdAt: shape.createdAt || new Date(),
    lastModifiedBy: shape.lastModifiedBy || '',
    lastModifiedAt: shape.lastModifiedAt || new Date()
  }));
};
