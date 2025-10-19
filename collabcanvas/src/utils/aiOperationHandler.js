import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { getColorHex, getSizeDimensions, calculatePosition } from './shapeCommandHandler';

/**
 * Simple text handling - trust the LLM to do the heavy lifting
 * @param {string} llmText - Text extracted by the LLM
 * @returns {string} Text content to use
 */
const handleTextContent = (llmText) => {
  // Trust the LLM's text extraction - it's much smarter than regex patterns
  if (llmText && llmText.trim() && llmText !== 'Text') {
    return llmText.trim();
  }
  
  // Fallback to default
  return 'Text';
};

/**
 * Find shapes by type and color
 * @param {Array} shapes - Array of all shapes
 * @param {string} type - Shape type (rectangle, circle, text)
 * @param {string} color - Color name
 * @returns {Array} Matching shapes
 */
export const findShapesByTypeAndColor = (shapes, type, color) => {
  const normalizedColor = getColorHex(color);
  return shapes.filter(shape => 
    shape.type === type && shape.fill === normalizedColor
  );
};

/**
 * Find the best matching shape for an operation
 * @param {Array} shapes - Array of all shapes
 * @param {Object} target - Target specification with type and color
 * @returns {Object|null} Best matching shape or null
 */
export const findTargetShape = (shapes, target) => {
  if (!target || !target.type || !target.color) {
    return null;
  }

  const matchingShapes = findShapesByTypeAndColor(shapes, target.type, target.color);
  
  if (matchingShapes.length === 0) {
    return null;
  }

  // If multiple shapes match, return the first one (could be improved with more sophisticated selection)
  return matchingShapes[0];
};

/**
 * Process AI command and execute the appropriate operation
 * @param {Object} parsedCommand - Parsed command from AI
 * @param {Array} shapes - Current shapes on canvas
 * @param {Object} operations - Available operations (createShape, moveShape, deleteShape, resizeShape)
 * @returns {Promise<Object>} Result of the operation
 */
export const processAIOperation = async (parsedCommand, shapes, operations) => {
  const { operation } = parsedCommand;
  

  switch (operation) {
    case 'create':
      return await handleCreateOperation(parsedCommand, operations);
    
    case 'move':
      return await handleMoveOperation(parsedCommand, shapes, operations);
    
    case 'delete':
      return await handleDeleteOperation(parsedCommand, shapes, operations);
    
    case 'resize':
      return await handleResizeOperation(parsedCommand, shapes, operations);
    
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
};

/**
 * Handle CREATE operations
 */
const handleCreateOperation = async (parsedCommand, operations) => {
  const { type, color, position, size, text } = parsedCommand;
  
  
  // Trust the LLM to provide valid shape types - no strict validation
  if (!type) {
    throw new Error('Shape type is required');
  }

  // For AI-created shapes, we'll use the same positioning logic as manual creation
  // but we need to handle color and text content separately
  
  
  // Get color
  const fillColor = getColorHex(color);
  
  // Get size
  const sizeDimensions = getSizeDimensions(size?.description, type);
  
  // Use the same positioning logic as manual shape creation (ShapeToolbar.jsx)
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
  
  
  // Create shape data with manual positioning but AI-specified color and text
  const shapeData = {
    type,
    x: finalX,
    y: finalY,
    width: sizeDimensions.width,
    height: sizeDimensions.height,
    fill: fillColor,
    stroke: '#E5E7EB',
    strokeWidth: 1
  };
  
  // Handle shape-specific properties - let LLM determine the best defaults
  if (type === 'text') {
    shapeData.text = handleTextContent(text);
  } else if (type === 'stickyNote' || type === 'sticky' || type === 'note') {
    shapeData.text = text || 'Remember to:\n\n• Buy groceries\n• Call mom\n• Finish project\n• Water plants';
    shapeData.width = 300;
    shapeData.height = 350;
  } else if (type === 'card') {
    shapeData.title = text?.title || 'Card Title';
    shapeData.content = text?.content || 'This is a card with some content. You can edit this text by double-clicking.';
    shapeData.width = 280;
    shapeData.height = 200;
  } else if (type === 'list' || type === 'checklist' || type === 'todo') {
    shapeData.title = text?.title || 'Project Tasks';
    shapeData.items = text?.items || ['Design user interface', 'Implement authentication', 'Add real-time features', 'Write documentation', 'Deploy to production'];
    shapeData.width = 280;
    shapeData.height = 320;
  }
  
  // For any other shape types, use default dimensions
  if (!shapeData.width || !shapeData.height) {
    shapeData.width = sizeDimensions.width;
    shapeData.height = sizeDimensions.height;
  }
  
  
  // Create the shape using the same method as manual creation
  const shapeCreationData = {
    x: shapeData.x,
    y: shapeData.y,
    width: shapeData.width,
    height: shapeData.height,
    fill: shapeData.fill,
    stroke: shapeData.stroke,
    strokeWidth: shapeData.strokeWidth,
    text: shapeData.text,
    title: shapeData.title,
    content: shapeData.content,
    items: shapeData.items
  };
  
  
  const shapeId = await operations.createShape(shapeData.type, shapeCreationData);
  
  
  // Create appropriate success message based on shape type
  let message = `Created ${color || 'default'} ${type}`;
  
  if (type === 'text' && shapeData.text) {
    message += ` with text "${shapeData.text}"`;
  } else if ((type === 'stickyNote' || type === 'sticky' || type === 'note') && shapeData.text) {
    message += ` with notes`;
  } else if (type === 'card' && shapeData.title) {
    message += ` titled "${shapeData.title}"`;
  } else if ((type === 'list' || type === 'checklist' || type === 'todo') && shapeData.title) {
    message += ` titled "${shapeData.title}" with ${shapeData.items?.length || 0} items`;
  }
  
  return {
    operation: 'create',
    shapeId,
    message
  };
};

/**
 * Handle MOVE operations
 */
const handleMoveOperation = async (parsedCommand, shapes, operations) => {
  const { target, position } = parsedCommand;
  
  // Find the target shape
  const targetShape = findTargetShape(shapes, target);
  
  if (!targetShape) {
    throw new Error(`No ${target.color} ${target.type} found to move`);
  }

  // Calculate new position
  const newPosition = calculatePosition(position);
  
  
  // Move the shape
  await operations.moveShape(targetShape.id, newPosition.x, newPosition.y);

  return {
    operation: 'move',
    shapeId: targetShape.id,
    message: `Moved ${target.color} ${target.type} to ${position.relative || 'new position'}`
  };
};

/**
 * Handle DELETE operations
 */
const handleDeleteOperation = async (parsedCommand, shapes, operations) => {
  const { target } = parsedCommand;
  
  // Find the target shape
  const targetShape = findTargetShape(shapes, target);
  
  if (!targetShape) {
    throw new Error(`No ${target.color} ${target.type} found to delete`);
  }

  
  // Delete the shape
  await operations.deleteShape(targetShape.id);

  return {
    operation: 'delete',
    shapeId: targetShape.id,
    message: `Deleted ${target.color} ${target.type}`
  };
};

/**
 * Handle RESIZE operations
 */
const handleResizeOperation = async (parsedCommand, shapes, operations) => {
  const { target, size } = parsedCommand;
  
  // Find the target shape
  const targetShape = findTargetShape(shapes, target);
  
  if (!targetShape) {
    throw new Error(`No ${target.color} ${target.type} found to resize`);
  }

  // Get new size dimensions
  const newSize = getSizeDimensions(size?.description, targetShape.type);
  
  
  // Resize the shape
  await operations.resizeShape(targetShape.id, {
    width: newSize.width,
    height: newSize.height
  });

  return {
    operation: 'resize',
    shapeId: targetShape.id,
    message: `Resized ${target.color} ${target.type} to ${size?.description || 'new size'}`
  };
};

/**
 * Validate AI command structure
 * @param {Object} parsedCommand - Parsed command from AI
 * @returns {Object} Validation result
 */
export const validateAICommand = (parsedCommand) => {
  const errors = [];
  
  if (!parsedCommand) {
    errors.push('No command provided');
    return { isValid: false, errors };
  }

  if (parsedCommand.error) {
    errors.push(parsedCommand.error);
    return { isValid: false, errors };
  }

  if (!parsedCommand.operation) {
    errors.push('Operation type is required');
  } else if (!['create', 'move', 'delete', 'resize'].includes(parsedCommand.operation)) {
    errors.push('Invalid operation type. Must be create, move, delete, or resize.');
  }

  // Trust the LLM - remove confidence validation
  // if (parsedCommand.confidence < 0.3) {
  //   errors.push('Command confidence too low. Please be more specific.');
  // }

  // Validate operation-specific requirements
  if (parsedCommand.operation === 'create') {
    if (!parsedCommand.type) {
      errors.push('Shape type is required for creation');
    }
  }

  if (['move', 'delete', 'resize'].includes(parsedCommand.operation)) {
    if (!parsedCommand.target || !parsedCommand.target.type || !parsedCommand.target.color) {
      errors.push('Target shape specification is required for this operation');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
