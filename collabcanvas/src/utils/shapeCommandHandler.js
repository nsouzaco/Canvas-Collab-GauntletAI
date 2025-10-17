import { CANVAS_WIDTH, CANVAS_HEIGHT, VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './constants';

/**
 * Color name to hex mapping
 */
const COLOR_MAP = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#10b981',
  yellow: '#f59e0b',
  orange: '#f97316',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280',
  grey: '#6b7280',
  black: '#000000',
  white: '#ffffff',
  brown: '#a3a3a3',
  cyan: '#06b6d4',
  magenta: '#d946ef',
  lime: '#84cc16',
  indigo: '#6366f1',
  teal: '#14b8a6',
  violet: '#8b5cf6',
  fuchsia: '#d946ef',
  sky: '#0ea5e9',
  emerald: '#10b981',
  rose: '#f43f5e',
  slate: '#64748b',
  zinc: '#71717a',
  neutral: '#737373',
  stone: '#78716c',
  amber: '#f59e0b'
};

/**
 * Size descriptions to dimensions mapping
 */
const SIZE_MAP = {
  small: { width: 50, height: 50, radius: 25 },
  medium: { width: 100, height: 100, radius: 50 },
  large: { width: 150, height: 150, radius: 75 },
  tiny: { width: 30, height: 30, radius: 15 },
  huge: { width: 200, height: 200, radius: 100 }
};

/**
 * Convert color name to hex code
 * @param {string} colorName - Color name (e.g., 'red', 'blue')
 * @returns {string} Hex color code
 */
export const getColorHex = (colorName) => {
  if (!colorName) return '#3b82f6'; // Default blue
  
  const normalizedColor = colorName.toLowerCase().trim();
  return COLOR_MAP[normalizedColor] || colorName; // Return as-is if not found (might already be hex)
};

/**
 * Get size dimensions based on description
 * @param {string} sizeDesc - Size description (e.g., 'small', 'medium', 'large')
 * @param {string} shapeType - Type of shape ('rectangle', 'circle', 'text')
 * @returns {Object} Size object with width, height, radius
 */
export const getSizeDimensions = (sizeDesc, shapeType) => {
  if (!sizeDesc) return SIZE_MAP.medium;
  
  const normalizedSize = sizeDesc.toLowerCase().trim();
  const size = SIZE_MAP[normalizedSize] || SIZE_MAP.medium;
  
  // For circles, use radius for both width and height
  if (shapeType === 'circle') {
    return {
      width: size.radius * 2,
      height: size.radius * 2,
      radius: size.radius
    };
  }
  
  return size;
};

/**
 * Calculate position based on relative position and canvas dimensions
 * @param {Object} position - Position object with x, y, relative
 * @returns {Object} Calculated position {x, y}
 */
export const calculatePosition = (position) => {
  console.log('🔍 DEBUG: Position calculation input:', { 
    position, 
    CANVAS_WIDTH, 
    CANVAS_HEIGHT, 
    VIEWPORT_WIDTH, 
    VIEWPORT_HEIGHT 
  });
  
  // Calculate the Stage offset (how much the Stage is shifted to center the canvas)
  const stageOffsetX = (VIEWPORT_WIDTH - CANVAS_WIDTH) / 2;
  const stageOffsetY = (VIEWPORT_HEIGHT - CANVAS_HEIGHT) / 2;
  
  console.log('🔍 DEBUG: Stage offset calculated:', { 
    stageOffsetX, 
    stageOffsetY 
  });
  
  // Calculate positions relative to the viewport center, but account for Stage offset
  // The Stage is positioned at (stageOffsetX, stageOffsetY), so we need to adjust
  const viewportCenterX = VIEWPORT_WIDTH / 2;
  const viewportCenterY = VIEWPORT_HEIGHT / 2;
  
  console.log('🔍 DEBUG: Viewport center calculated:', { 
    viewportCenterX, 
    viewportCenterY,
    'VIEWPORT_WIDTH': VIEWPORT_WIDTH,
    'VIEWPORT_HEIGHT': VIEWPORT_HEIGHT
  });
  
  if (!position) {
    // Use truly random positioning for each shape creation
    const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
    const CANVAS_HEIGHT = 1000;
    const SHAPE_SIZE = 100; // Default shape size
    
    // Define the target area: mid-top center with randomization
    const TARGET_CENTER_X = CANVAS_WIDTH / 2;
    const TARGET_CENTER_Y = CANVAS_HEIGHT * 0.3; // 30% from top (mid-top)
    
    // Create a truly random spread pattern - different for each shape
    const OFFSET_RANGE = 150; // Increased range for more variety
    const SPREAD_ANGLE = Math.random() * 2 * Math.PI; // Random angle for spread
    const SPREAD_DISTANCE = Math.random() * OFFSET_RANGE; // Random distance from center
    
    // Calculate offset using polar coordinates for natural distribution
    const randomOffsetX = Math.cos(SPREAD_ANGLE) * SPREAD_DISTANCE;
    const randomOffsetY = Math.sin(SPREAD_ANGLE) * SPREAD_DISTANCE;
    
    // Add additional random variation for more uniqueness
    const extraRandomX = (Math.random() - 0.5) * 100; // -50 to +50
    const extraRandomY = (Math.random() - 0.5) * 100; // -50 to +50
    
    // Calculate final position with bounds checking
    const finalX = Math.max(50, Math.min(
      CANVAS_WIDTH - SHAPE_SIZE - 50, 
      TARGET_CENTER_X + randomOffsetX + extraRandomX
    ));
    const finalY = Math.max(50, Math.min(
      CANVAS_HEIGHT - SHAPE_SIZE - 50, 
      TARGET_CENTER_Y + randomOffsetY + extraRandomY
    ));
    
    const randomPos = { 
      x: finalX, 
      y: finalY 
    };
    console.log('📍 No position provided, using truly random position (AI):', {
      position: randomPos,
      angle: SPREAD_ANGLE,
      distance: SPREAD_DISTANCE,
      extraRandom: { x: extraRandomX, y: extraRandomY }
    });
    return randomPos;
  }

  // If absolute position is provided, use it
  if (position.x !== undefined && position.y !== undefined) {
    console.log('📍 Using absolute position:', { x: position.x, y: position.y });
    return { x: position.x, y: position.y };
  }

  // Calculate relative position within the viewport, adjusted for Stage offset
  const { relative } = position;
  if (!relative) {
    const centerPos = { 
      x: viewportCenterX - stageOffsetX, 
      y: viewportCenterY - stageOffsetY 
    };
    console.log('📍 No relative position, using adjusted center:', centerPos);
    return centerPos;
  }

  const margin = 50; // Margin from edges
  
  let calculatedPos;
  switch (relative.toLowerCase()) {
    case 'center':
      calculatedPos = { 
        x: viewportCenterX - stageOffsetX, 
        y: viewportCenterY - stageOffsetY 
      };
      break;
    
    case 'top-left':
      calculatedPos = { 
        x: margin - stageOffsetX, 
        y: margin - stageOffsetY 
      };
      break;
    
    case 'top-right':
      calculatedPos = { 
        x: (VIEWPORT_WIDTH - margin) - stageOffsetX, 
        y: margin - stageOffsetY 
      };
      break;
    
    case 'bottom-left':
      calculatedPos = { 
        x: margin - stageOffsetX, 
        y: (VIEWPORT_HEIGHT - margin) - stageOffsetY 
      };
      break;
    
    case 'bottom-right':
      calculatedPos = { 
        x: (VIEWPORT_WIDTH - margin) - stageOffsetX, 
        y: (VIEWPORT_HEIGHT - margin) - stageOffsetY 
      };
      break;
    
    case 'top':
      calculatedPos = { 
        x: viewportCenterX - stageOffsetX, 
        y: margin - stageOffsetY 
      };
      break;
    
    case 'bottom':
      calculatedPos = { 
        x: viewportCenterX - stageOffsetX, 
        y: (VIEWPORT_HEIGHT - margin) - stageOffsetY 
      };
      break;
    
    case 'left':
      calculatedPos = { 
        x: margin - stageOffsetX, 
        y: viewportCenterY - stageOffsetY 
      };
      break;
    
    case 'right':
      calculatedPos = { 
        x: (VIEWPORT_WIDTH - margin) - stageOffsetX, 
        y: viewportCenterY - stageOffsetY 
      };
      break;
    
    default:
      // Use truly random positioning for unknown relative positions
      const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
      const CANVAS_HEIGHT = 1000;
      const SHAPE_SIZE = 100; // Default shape size
      
      // Define the target area: mid-top center with randomization
      const TARGET_CENTER_X = CANVAS_WIDTH / 2;
      const TARGET_CENTER_Y = CANVAS_HEIGHT * 0.3; // 30% from top (mid-top)
      
      // Create a truly random spread pattern - different for each shape
      const OFFSET_RANGE = 150; // Increased range for more variety
      const SPREAD_ANGLE = Math.random() * 2 * Math.PI; // Random angle for spread
      const SPREAD_DISTANCE = Math.random() * OFFSET_RANGE; // Random distance from center
      
      // Calculate offset using polar coordinates for natural distribution
      const randomOffsetX = Math.cos(SPREAD_ANGLE) * SPREAD_DISTANCE;
      const randomOffsetY = Math.sin(SPREAD_ANGLE) * SPREAD_DISTANCE;
      
      // Add additional random variation for more uniqueness
      const extraRandomX = (Math.random() - 0.5) * 100; // -50 to +50
      const extraRandomY = (Math.random() - 0.5) * 100; // -50 to +50
      
      // Calculate final position with bounds checking
      const finalX = Math.max(50, Math.min(
        CANVAS_WIDTH - SHAPE_SIZE - 50, 
        TARGET_CENTER_X + randomOffsetX + extraRandomX
      ));
      const finalY = Math.max(50, Math.min(
        CANVAS_HEIGHT - SHAPE_SIZE - 50, 
        TARGET_CENTER_Y + randomOffsetY + extraRandomY
      ));
      
      calculatedPos = { 
        x: finalX, 
        y: finalY 
      };
  }
  
  console.log('📍 Calculated position for', relative, ':', calculatedPos);
  return calculatedPos;
};

/**
 * Process parsed command and create shape data
 * @param {Object} parsedCommand - Parsed command from OpenAI
 * @returns {Object} Shape data ready for creation
 */
export const processShapeCommand = (parsedCommand) => {
  if (!parsedCommand || parsedCommand.error) {
    throw new Error(parsedCommand?.error || 'Invalid command');
  }

  const { type, color, position, size, text } = parsedCommand;
  
  // Validate required fields
  if (!type || !['rectangle', 'circle', 'text'].includes(type)) {
    throw new Error('Invalid shape type. Must be rectangle, circle, or text.');
  }

  // Get color
  const fillColor = getColorHex(color);
  console.log('🎨 Color parsing:', { 
    originalColor: color, 
    parsedColor: fillColor,
    colorMap: COLOR_MAP[color?.toLowerCase()?.trim()]
  });
  
  // Get size
  const sizeDimensions = getSizeDimensions(size?.description, type);
  
  // Calculate position
  const calculatedPosition = calculatePosition(position);
  
  // Create shape data
  const shapeData = {
    type,
    x: calculatedPosition.x,
    y: calculatedPosition.y,
    width: sizeDimensions.width,
    height: sizeDimensions.height,
    fill: fillColor,
    stroke: '#E5E7EB',
    strokeWidth: 1
  };

  // Add text content for text shapes
  if (type === 'text' && text) {
    shapeData.text = text;
  }

  // Note: No special positioning needed for circles - they use the same positioning as other shapes

  return shapeData;
};

/**
 * Validate and sanitize shape command
 * @param {Object} parsedCommand - Parsed command from OpenAI
 * @returns {Object} Validation result
 */
export const validateShapeCommand = (parsedCommand) => {
  const errors = [];
  
  if (!parsedCommand) {
    errors.push('No command provided');
    return { isValid: false, errors };
  }

  if (parsedCommand.error) {
    errors.push(parsedCommand.error);
    return { isValid: false, errors };
  }

  if (!parsedCommand.type) {
    errors.push('Shape type is required');
  } else if (!['rectangle', 'circle', 'text'].includes(parsedCommand.type)) {
    errors.push('Invalid shape type. Must be rectangle, circle, or text.');
  }

  if (parsedCommand.confidence < 0.3) {
    errors.push('Command confidence too low. Please be more specific.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
