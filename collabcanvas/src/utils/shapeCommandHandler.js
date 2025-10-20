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
 * @param {Object} currentPosition - Current position of the shape (for relative movements)
 * @returns {Object} Calculated position {x, y}
 */
export const calculatePosition = (position, currentPosition = null) => {
  console.log('🧮 calculatePosition called with:', { position, currentPosition });
  
  // Use the same stage position calculation as Canvas.jsx
  const stagePos = {
    x: (VIEWPORT_WIDTH - CANVAS_WIDTH) / 2,
    y: (VIEWPORT_HEIGHT - CANVAS_HEIGHT) / 2
  };
  
  
  // Calculate positions relative to the canvas center
  const canvasCenterX = CANVAS_WIDTH / 2;
  const canvasCenterY = CANVAS_HEIGHT / 2;
  
  // Canvas bounds for movement
  const CANVAS_WIDTH_ACTUAL = Math.min(1200, window.innerWidth - 300);
  const CANVAS_HEIGHT_ACTUAL = 1000;
  const margin = 50;
  
  console.log('📐 Canvas dimensions:', { CANVAS_WIDTH_ACTUAL, CANVAS_HEIGHT_ACTUAL });
  
  if (!position) {
    // Use the EXACT same logic as manual shape creation (ShapeToolbar.jsx)
    const MANUAL_CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
    const MANUAL_CANVAS_HEIGHT = 1000;
    const SHAPE_SIZE = 100; // Default shape size
    
    // Define the target area: mid-top center with randomization (same as manual)
    const TARGET_CENTER_X = MANUAL_CANVAS_WIDTH / 2;
    const TARGET_CENTER_Y = MANUAL_CANVAS_HEIGHT * 0.3; // 30% from top (mid-top)
    
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
      MANUAL_CANVAS_WIDTH - SHAPE_SIZE - 50, 
      TARGET_CENTER_X + randomOffsetX + extraRandomX
    ));
    const finalY = Math.max(50, Math.min(
      MANUAL_CANVAS_HEIGHT - SHAPE_SIZE - 50, 
      TARGET_CENTER_Y + randomOffsetY + extraRandomY
    ));
    
    const randomPos = { 
      x: finalX, 
      y: finalY 
    };
    return randomPos;
  }

  // Calculate relative position within the canvas
  const { relative } = position;
  
  // IMPORTANT: Check for relative keyword FIRST before checking x/y coordinates
  // The AI sometimes sends both relative and x/y, and relative should take priority
  if (relative) {
  const relativeStr = relative.toLowerCase();
  console.log('🔍 Processing relative position:', relativeStr);
  
  // First, if we have a currentPosition and the keyword is a directional word,
  // treat it as a RELATIVE movement, not an absolute position
  if (currentPosition) {
    // Use 15% of current coordinate value for relative movements
    const MOVEMENT_PERCENTAGE = 0.15;
    const MOVEMENT_OFFSET_X = Math.max(50, Math.abs(currentPosition.x) * MOVEMENT_PERCENTAGE);
    const MOVEMENT_OFFSET_Y = Math.max(50, Math.abs(currentPosition.y) * MOVEMENT_PERCENTAGE);
    
    console.log('📏 Movement offsets (15% of current position):', { 
      MOVEMENT_OFFSET_X, 
      MOVEMENT_OFFSET_Y, 
      currentX: currentPosition.x, 
      currentY: currentPosition.y 
    });
    
    // Check for directional movement keywords
    if (relativeStr === 'right' || relativeStr.includes('right') || relativeStr.includes('east')) {
      console.log('➡️ Moving right (relative)');
      const newX = Math.min(currentPosition.x + MOVEMENT_OFFSET_X, CANVAS_WIDTH_ACTUAL - margin);
      console.log('➡️ New position:', { x: newX, y: currentPosition.y });
      return { x: newX, y: currentPosition.y };
    }
    if (relativeStr === 'left' || relativeStr.includes('left') || relativeStr.includes('west')) {
      console.log('⬅️ Moving left (relative)');
      const newX = Math.max(currentPosition.x - MOVEMENT_OFFSET_X, margin);
      console.log('⬅️ New position:', { x: newX, y: currentPosition.y });
      return { x: newX, y: currentPosition.y };
    }
    if (relativeStr === 'up' || relativeStr.includes('up') || relativeStr.includes('north')) {
      console.log('⬆️ Moving up (relative)');
      const newY = Math.max(currentPosition.y - MOVEMENT_OFFSET_Y, margin);
      console.log('⬆️ New position:', { x: currentPosition.x, y: newY });
      return { x: currentPosition.x, y: newY };
    }
    if (relativeStr === 'down' || relativeStr.includes('down') || relativeStr.includes('south')) {
      console.log('⬇️ Moving down (relative)');
      const newY = Math.min(currentPosition.y + MOVEMENT_OFFSET_Y, CANVAS_HEIGHT_ACTUAL - margin);
      console.log('⬇️ New position:', { x: currentPosition.x, y: newY });
      return { x: currentPosition.x, y: newY };
    }
  }
  
  // If not a directional movement with currentPosition, check for absolute position keywords
  // These positions are absolute on the canvas
  let calculatedPos;
  switch (relativeStr) {
    case 'center':
      console.log('✅ Matched case: center');
      // Use the same canvas dimensions as manual shape creation
      const CENTER_CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
      const CENTER_CANVAS_HEIGHT = 1000;
      calculatedPos = { 
        x: CENTER_CANVAS_WIDTH / 2, 
        y: CENTER_CANVAS_HEIGHT / 2
      };

      break;
    
    case 'top-left':
      calculatedPos = { 
        x: margin, 
        y: margin 
      };
      break;
    
    case 'top-right':
      calculatedPos = { 
        x: CANVAS_WIDTH - margin, 
        y: margin 
      };
      break;
    
    case 'bottom-left':
      calculatedPos = { 
        x: margin, 
        y: CANVAS_HEIGHT - margin 
      };
      break;
    
    case 'bottom-right':
      calculatedPos = { 
        x: CANVAS_WIDTH - margin, 
        y: CANVAS_HEIGHT - margin 
      };
      break;
    
    // These are absolute positions (only reached if no currentPosition or not a directional word)
    case 'top':
      calculatedPos = { 
        x: canvasCenterX, 
        y: margin 
      };
      break;
    
    case 'bottom':
      calculatedPos = { 
        x: canvasCenterX, 
        y: CANVAS_HEIGHT - margin 
      };
      break;
    
    case 'left':
      calculatedPos = { 
        x: margin, 
        y: canvasCenterY 
      };
      break;
    
    case 'right':
      calculatedPos = { 
        x: CANVAS_WIDTH - margin, 
        y: canvasCenterY 
      };
      break;
    
    default:
      console.log('⚠️ Entered default case for unknown position:', relativeStr);
      
      // Use the EXACT same logic as manual shape creation for unknown positions
      const DEFAULT_CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
      const DEFAULT_CANVAS_HEIGHT = 1000;
      const SHAPE_SIZE = 100; // Default shape size
      
      // Define the target area: mid-top center with randomization (same as manual)
      const TARGET_CENTER_X = DEFAULT_CANVAS_WIDTH / 2;
      const TARGET_CENTER_Y = DEFAULT_CANVAS_HEIGHT * 0.3; // 30% from top (mid-top)
      
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
        DEFAULT_CANVAS_WIDTH - SHAPE_SIZE - 50, 
        TARGET_CENTER_X + randomOffsetX + extraRandomX
      ));
      const finalY = Math.max(50, Math.min(
        DEFAULT_CANVAS_HEIGHT - SHAPE_SIZE - 50, 
        TARGET_CENTER_Y + randomOffsetY + extraRandomY
      ));
      
      calculatedPos = { 
        x: finalX, 
        y: finalY 
      };
  }
  
    // If we calculated a position from the switch, return it
    if (calculatedPos) {
      return calculatedPos;
    }
    
    // Fallback to center if no match in switch
    return { x: canvasCenterX, y: canvasCenterY };
  }
  
  // If no relative keyword, check for absolute x/y coordinates
  if (position.x !== undefined && position.y !== undefined) {
    console.log('📍 Using absolute x/y coordinates:', { x: position.x, y: position.y });
    return { x: position.x, y: position.y };
  }
  
  // Final fallback to center
  console.log('📍 No position info, defaulting to center');
  return { x: canvasCenterX, y: canvasCenterY };
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
