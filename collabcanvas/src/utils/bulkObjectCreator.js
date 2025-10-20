/**
 * Bulk Object Creator for Performance Testing
 * 
 * This utility creates multiple objects at once for performance testing
 * without requiring the AI assistant to create them one by one.
 */

import { v4 as uuidv4 } from 'uuid';

// Fallback ID generator in case uuid fails
const generateId = () => {
  try {
    return uuidv4();
  } catch (error) {
    console.warn('UUID generation failed, using fallback:', error);
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
};

/**
 * Generate random color
 */
const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Generate random position within canvas bounds
 */
const getRandomPosition = (canvasWidth, canvasHeight, shapeSize = 100) => {
  const margin = 50;
  return {
    x: Math.random() * (canvasWidth - shapeSize - margin * 2) + margin,
    y: Math.random() * (canvasHeight - shapeSize - margin * 2) + margin
  };
};

/**
 * Generate random size
 */
const getRandomSize = () => {
  const sizes = [
    { width: 60, height: 60 },   // Small
    { width: 100, height: 100 }, // Medium
    { width: 150, height: 150 }, // Large
    { width: 80, height: 120 },   // Rectangle
    { width: 120, height: 80 }    // Wide rectangle
  ];
  return sizes[Math.floor(Math.random() * sizes.length)];
};

/**
 * Create a single shape object
 */
const createShapeObject = (type, index, canvasWidth, canvasHeight) => {
  const position = getRandomPosition(canvasWidth, canvasHeight);
  const size = getRandomSize();
  const color = getRandomColor();
  
  const baseShape = {
    id: generateId(),
    type,
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    fill: color,
    stroke: '#E5E7EB',
    strokeWidth: 1,
    rotation: 0,
    isLocked: false,
    lockedBy: null,
    isSelected: false,
    selectedBy: null,
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    lastModifiedBy: null
  };

  // Add type-specific properties
  switch (type) {
    case 'text':
      return {
        ...baseShape,
        text: `Text ${index}`,
        fontSize: 16,
        fontFamily: 'Arial'
      };
    
    case 'stickyNote':
      return {
        ...baseShape,
        text: `Note ${index}`,
        width: 200,
        height: 120
      };
    
    case 'card':
      return {
        ...baseShape,
        title: `Card ${index}`,
        content: `This is card content for performance testing. Card number ${index}.`,
        width: 250,
        height: 180
      };
    
    case 'list':
      return {
        ...baseShape,
        title: `List ${index}`,
        items: [
          `Item 1 for list ${index}`,
          `Item 2 for list ${index}`,
          `Item 3 for list ${index}`
        ],
        width: 220,
        height: 200
      };
    
    default:
      return baseShape;
  }
};

/**
 * Create multiple shapes for performance testing
 */
export const createBulkObjects = async (count = 500, addShapeFunction) => {
  const canvasWidth = Math.min(1200, window.innerWidth - 300);
  const canvasHeight = 1000;
  
  const shapeTypes = ['rectangle', 'circle', 'text', 'stickyNote', 'card', 'list'];
  let createdCount = 0;
  let lastShapeId = null;
  
  const startTime = performance.now();
  
  try {
    // Create shapes in batches to avoid overwhelming the system
    const batchSize = 10; // Smaller batches for better performance
    const batches = Math.ceil(count / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, count);
      const batchCount = batchEnd - batchStart;
      
      // Create shapes for this batch
      const batchPromises = [];
      for (let i = batchStart; i < batchEnd; i++) {
        const shapeType = shapeTypes[i % shapeTypes.length];
        const shapeData = createShapeObject(shapeType, i + 1, canvasWidth, canvasHeight);
        
        // Use the canvas context's addShape function
        const shapePromise = addShapeFunction(shapeType, shapeData).then(shapeId => {
          if (shapeId) {
            createdCount++;
            lastShapeId = shapeId; // Track the last created shape
          }
          return shapeId;
        }).catch(error => {
          console.error(`❌ Failed to create shape ${i + 1}:`, error);
          return null;
        });
        
        batchPromises.push(shapePromise);
      }
      
      // Wait for this batch to complete
      await Promise.all(batchPromises);
      
      // Small delay between batches to prevent overwhelming the system
      if (batch < batches - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return {
      success: true,
      count: createdCount,
      duration,
      averageTime: duration / createdCount,
      performance: createdCount / (duration / 1000), // objects per second
      lastShapeId // Return the last created shape ID
    };
    
  } catch (error) {
    console.error('❌ Error creating bulk objects:', error);
    return {
      success: false,
      error: error.message,
      count: createdCount
    };
  }
};

/**
 * Create objects with specific patterns for testing
 */
export const createPatternObjects = async (pattern, addShapeFunction) => {
  const canvasWidth = Math.min(1200, window.innerWidth - 300);
  const canvasHeight = 1000;
  
  switch (pattern) {
    case 'grid':
      return createGridPattern(canvasWidth, canvasHeight, addShapeFunction);
    
    case 'spiral':
      return createSpiralPattern(canvasWidth, canvasHeight, addShapeFunction);
    
    case 'random':
      return createBulkObjects(500, addShapeFunction);
    
    default:
      return createBulkObjects(100, addShapeFunction);
  }
};

/**
 * Create a grid pattern of objects
 */
const createGridPattern = async (canvasWidth, canvasHeight, addShapeFunction) => {
  const gridSize = 20; // 20x20 grid = 400 objects
  const cellWidth = canvasWidth / gridSize;
  const cellHeight = canvasHeight / gridSize;
  const objectSize = Math.min(cellWidth, cellHeight) * 0.8;
  
  let createdCount = 0;
  let lastShapeId = null;
  const startTime = performance.now();
  
  try {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = col * cellWidth + (cellWidth - objectSize) / 2;
        const y = row * cellHeight + (cellHeight - objectSize) / 2;
        
        const shapeData = {
          x,
          y,
          width: objectSize,
          height: objectSize,
          fill: getRandomColor(),
          stroke: '#E5E7EB',
          strokeWidth: 1
        };
        
        const shapeId = await addShapeFunction('rectangle', shapeData);
        if (shapeId) {
          createdCount++;
          lastShapeId = shapeId;
        }
        
        // Small delay to prevent overwhelming the system
        if (createdCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return { 
      success: true, 
      count: createdCount, 
      duration,
      averageTime: duration / createdCount,
      lastShapeId
    };
  } catch (error) {
    console.error('❌ Error creating grid pattern:', error);
    return { success: false, error: error.message, count: createdCount };
  }
};

/**
 * Create a spiral pattern of objects
 */
const createSpiralPattern = async (canvasWidth, canvasHeight, addShapeFunction) => {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const maxRadius = Math.min(canvasWidth, canvasHeight) / 2 - 50;
  const objectCount = 300;
  const objectSize = 30;
  
  let createdCount = 0;
  let lastShapeId = null;
  const startTime = performance.now();
  
  try {
    for (let i = 0; i < objectCount; i++) {
      const angle = (i / objectCount) * 8 * Math.PI; // 4 full rotations
      const radius = (i / objectCount) * maxRadius;
      
      const x = centerX + Math.cos(angle) * radius - objectSize / 2;
      const y = centerY + Math.sin(angle) * radius - objectSize / 2;
      
      const shapeData = {
        x,
        y,
        width: objectSize,
        height: objectSize,
        fill: getRandomColor(),
        stroke: '#E5E7EB',
        strokeWidth: 1
      };
      
      const shapeId = await addShapeFunction('circle', shapeData);
      if (shapeId) {
        createdCount++;
        lastShapeId = shapeId;
      }
      
      // Small delay to prevent overwhelming the system
      if (createdCount % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return { 
      success: true, 
      count: createdCount, 
      duration,
      averageTime: duration / createdCount,
      lastShapeId
    };
  } catch (error) {
    console.error('❌ Error creating spiral pattern:', error);
    return { success: false, error: error.message, count: createdCount };
  }
};

/**
 * Performance testing utilities
 */
export const performanceTestUtils = {
  /**
   * Measure FPS during object creation
   */
  measureFPS: () => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const measureFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = frameCount;
        // FPS logging removed for cleaner console
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFrame);
    };
    
    return measureFrame;
  },
  
  /**
   * Monitor memory usage
   */
  monitorMemory: () => {
    if (performance.memory) {
      const memory = performance.memory;
      return {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      };
    }
    return null;
  }
};

export default {
  createBulkObjects,
  createPatternObjects,
  performanceTestUtils
};
