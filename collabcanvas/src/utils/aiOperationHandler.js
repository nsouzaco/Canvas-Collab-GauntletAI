import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { getColorHex, getSizeDimensions, calculatePosition } from './shapeCommandHandler';
import { 
  generateStartupDetails, 
  generatePersonaCard, 
  generateFeatureCard, 
  generateUserStoryCard, 
  generatePainPointsCard, 
  generateCompetitiveAnalysisCard 
} from '../services/openai';


/**
 * Get default color for shape type
 * @param {string} type - Shape type
 * @returns {string} Default color hex
 */
const getDefaultColorForType = (type) => {
  const defaultColors = {
    stickyNote: '#FEF68A',
    card: '#FFFFFF',
    list: '#FFFFFF',
    text: '#F3F4F6',
    rectangle: '#3B82F6',
    circle: '#06B6D4'
  };
  
  return defaultColors[type] || '#3B82F6';
};

/**
 * Generate context-aware card content based on canvas metadata and user command
 * @param {Object} text - Text content from AI parsing
 * @param {Object} canvasMetadata - Canvas name and description
 * @param {string} originalCommand - Original user command
 * @returns {Promise<Object>} Card content with title and content
 */
const generateContextAwareCardContent = async (text, canvasMetadata, originalCommand) => {
  const { name: canvasName, description: canvasDescription } = canvasMetadata;
  
  // If AI provided specific content, use it
  if (text?.title && text?.content) {
    return {
      title: text.title,
      content: text.content
    };
  }
  
  // Generate context-aware content based on canvas purpose using LLM
  if (canvasName && canvasDescription) {
    try {
      // Use the existing generateFeatureCard function which uses LLM
      const generatedContent = await generateFeatureCard(canvasMetadata);
      
      const title = text?.title || generatedContent.title;
      const content = text?.content || generatedContent.content;
      
      return {
        title,
        content
      };
    } catch (error) {
      console.error('Error generating contextual content with LLM:', error);
      // Fallback to basic content if LLM fails
      return {
        title: text?.title || `Key Features for ${canvasName}`,
        content: text?.content || `Key features for ${canvasName}:\n\n• Feature 1\n• Feature 2\n• Feature 3\n• Feature 4`
      };
    }
  }
  
  // Default content
  return {
    title: text?.title || 'Card Title',
    content: text?.content || 'This is a card with some content. You can edit this text by double-clicking.'
  };
};

/**
 * Generate context-aware list content based on canvas metadata and user command
 * @param {Object} text - Text content from AI parsing
 * @param {Object} canvasMetadata - Canvas name and description
 * @param {string} originalCommand - Original user command
 * @returns {Promise<Object>} List content with title and items
 */
const generateContextAwareListContent = async (text, canvasMetadata, originalCommand) => {
  const { name: canvasName, description: canvasDescription } = canvasMetadata;
  
  // If AI provided specific content, use it
  if (text?.title && text?.items) {
    return {
      title: text.title,
      items: text.items
    };
  }
  
  // Generate context-aware content based on canvas purpose using LLM
  if (canvasName && canvasDescription) {
    try {
      // Use the existing generateFeatureCard function which uses LLM
      const generatedContent = await generateFeatureCard(canvasMetadata);
      
      // Convert the content to items format for lists
      const items = generatedContent.items || generatedContent.content?.split('\n')
        .filter(line => line.trim().startsWith('•'))
        .map(line => line.replace('•', '').trim())
        .filter(item => item.length > 0) || [];
      
      const title = text?.title || generatedContent.title;
      
      return {
        title,
        items: text?.items || items
      };
    } catch (error) {
      console.error('Error generating contextual list content with LLM:', error);
      // Fallback to basic content if LLM fails
      return {
        title: text?.title || `Features for ${canvasName}`,
        items: text?.items || [
          'Feature 1',
          'Feature 2', 
          'Feature 3',
          'Feature 4'
        ]
      };
    }
  }
  
  // Default content
  return {
    title: text?.title || 'Project Tasks',
    items: text?.items || [
      'Design user interface',
      'Implement authentication',
      'Add real-time features',
      'Write documentation',
      'Deploy to production'
    ]
  };
};

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
 * Check if the command is describing a startup idea
 * @param {string} command - The original command text
 * @returns {boolean} True if it looks like a startup idea
 */
const isStartupIdea = (command) => {
  const lowerCommand = command.toLowerCase();
  
  // Exclude note commands from startup detection
  if (lowerCommand.includes('note') || lowerCommand.includes('sticky') || lowerCommand.includes('post-it')) {
    return false;
  }
  
  const startupKeywords = [
    'startup', 'app', 'business', 'company', 'idea', 'product', 'service',
    'platform', 'solution', 'innovation', 'entrepreneur', 'venture',
    'build a', 'develop a', 'launch a', 'start a'
  ];
  
  // Only check "create a" if it's not followed by shape-related words
  const createAKeywords = ['create a'];
  const shapeKeywords = ['note', 'sticky', 'post-it', 'rectangle', 'circle', 'text', 'card', 'list'];
  
  const hasCreateA = createAKeywords.some(keyword => lowerCommand.includes(keyword));
  const hasShapeKeyword = shapeKeywords.some(keyword => lowerCommand.includes(keyword));
  
  return startupKeywords.some(keyword => lowerCommand.includes(keyword)) ||
         (hasCreateA && !hasShapeKeyword) ||
         lowerCommand.includes('my idea') ||
         lowerCommand.includes('i want to') ||
         lowerCommand.includes('i\'m building') ||
         lowerCommand.includes('we\'re creating');
};

/**
 * Create startup title and description shapes
 * @param {string} idea - The startup idea description
 * @param {Object} operations - Available operations
 * @returns {Promise<Object>} Result of the operation
 */
const createStartupShapes = async (idea, operations) => {
  try {
    // Generate startup name and description
    const startupDetails = await generateStartupDetails(idea);
    
    // Calculate center positions
    const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
    const CANVAS_HEIGHT = 1000;
    const CENTER_X = CANVAS_WIDTH / 2;
    const CENTER_Y = CANVAS_HEIGHT / 2;
    
    // Create title shape (Title text type)
    const titleShapeData = {
      type: 'text',
      x: CENTER_X - 200, // Center horizontally with some width
      y: CENTER_Y - 100, // Position above center
      width: 400,
      height: 80,
      fill: '#1F2937', // Dark text color
      text: startupDetails.name,
      textType: 'title',
      fontFamily: 'Inter',
      fontSize: 32
    };
    
    // Create description shape (H2 text type)
    const descriptionShapeData = {
      type: 'text',
      x: CENTER_X - 300, // Center horizontally with more width for description
      y: CENTER_Y + 20, // Position below center
      width: 600,
      height: 120,
      fill: '#6B7280', // Gray text color for description
      text: startupDetails.description,
      textType: 'heading2',
      fontFamily: 'Inter',
      fontSize: 18
    };
    
    // Create both shapes
    const titleShapeId = await operations.createShape('text', titleShapeData);
    const descriptionShapeId = await operations.createShape('text', descriptionShapeData);
    
    return {
      operation: 'create_startup',
      shapeIds: [titleShapeId, descriptionShapeId],
      message: `Created startup canvas with title "${startupDetails.name}" and description`
    };
  } catch (error) {
    console.error('Error creating startup shapes:', error);
    throw new Error('Failed to create startup shapes');
  }
};

/**
 * Process AI command and execute the appropriate operation
 * @param {Object} parsedCommand - Parsed command from AI
 * @param {Array} shapes - Current shapes on canvas
 * @param {Object} operations - Available operations (createShape, moveShape, deleteShape, resizeShape)
 * @param {string} originalCommand - The original command text for startup detection
 * @param {Object} canvasMetadata - Canvas name and description for context
 * @param {Array} conversationHistory - Previous conversation messages for context
 * @returns {Promise<Object>} Result of the operation
 */
export const processAIOperation = async (parsedCommand, shapes, operations, originalCommand = '', canvasMetadata = { name: '', description: '' }, conversationHistory = []) => {
  const { operation } = parsedCommand;
  
  // Check if this is a startup idea before processing normal operations
  if (originalCommand && isStartupIdea(originalCommand)) {
    return await createStartupShapes(originalCommand, operations);
  }

  switch (operation) {
    case 'create':
      return await handleCreateOperation(parsedCommand, operations, originalCommand, canvasMetadata);
    
    case 'semantic_create':
      return await handleSemanticCreateOperation(parsedCommand, operations, originalCommand, canvasMetadata);
    
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
 * Handle SEMANTIC CREATE operations (intelligent content generation)
 */
const handleSemanticCreateOperation = async (parsedCommand, operations, originalCommand = '', canvasMetadata = { name: '', description: '' }) => {
  const { semantic_type, type, color, position, size } = parsedCommand;
  
  // Get color
  const fillColor = getColorHex(color);
  
  // Get size
  const sizeDimensions = getSizeDimensions(size?.description, type);
  
  // Use the same positioning logic as manual shape creation
  const CANVAS_WIDTH = Math.min(1200, window.innerWidth - 300);
  const CANVAS_HEIGHT = 1000;
  const SHAPE_SIZE = 100;
  
  // Define the target area: mid-top center with randomization
  const TARGET_CENTER_X = CANVAS_WIDTH / 2;
  const TARGET_CENTER_Y = CANVAS_HEIGHT * 0.3;
  
  // Create a truly random spread pattern
  const OFFSET_RANGE = 150;
  const SPREAD_ANGLE = Math.random() * 2 * Math.PI;
  const SPREAD_DISTANCE = Math.random() * OFFSET_RANGE;
  
  const randomOffsetX = Math.cos(SPREAD_ANGLE) * SPREAD_DISTANCE;
  const randomOffsetY = Math.sin(SPREAD_ANGLE) * SPREAD_DISTANCE;
  
  const extraRandomX = (Math.random() - 0.5) * 100;
  const extraRandomY = (Math.random() - 0.5) * 100;
  
  const finalX = Math.max(50, Math.min(
    CANVAS_WIDTH - SHAPE_SIZE - 50, 
    TARGET_CENTER_X + randomOffsetX + extraRandomX
  ));
  const finalY = Math.max(50, Math.min(
    CANVAS_HEIGHT - SHAPE_SIZE - 50, 
    TARGET_CENTER_Y + randomOffsetY + extraRandomY
  ));
  
  // Generate content based on semantic type
  let generatedContent;
  try {
    switch (semantic_type) {
      case 'persona':
        generatedContent = await generatePersonaCard(canvasMetadata);
        break;
      case 'features':
        generatedContent = await generateFeatureCard(canvasMetadata);
        break;
      case 'user-story':
        generatedContent = await generateUserStoryCard(canvasMetadata);
        break;
      case 'pain-points':
        generatedContent = await generatePainPointsCard(canvasMetadata);
        break;
      case 'competitive-analysis':
        generatedContent = await generateCompetitiveAnalysisCard(canvasMetadata);
        break;
      default:
        throw new Error(`Unknown semantic type: ${semantic_type}`);
    }
  } catch (error) {
    console.error('Error generating semantic content:', error);
    throw new Error(`Failed to generate ${semantic_type} content`);
  }
  
  // Create shape data with generated content
  const shapeData = {
    type: 'card',
    x: finalX,
    y: finalY,
    width: sizeDimensions.width || 300,
    height: semantic_type === 'persona' ? 
      (generatedContent.content && generatedContent.items && generatedContent.items.length > 0 ? 350 : 250) : 
      (sizeDimensions.height || 400), // Taller height for persona cards with both content and items
    fill: '#FFFFFF', // Always white background for AI-generated cards
    stroke: '#E5E7EB',
    strokeWidth: 1,
    title: generatedContent.title,
    content: generatedContent.content,
    items: Array.isArray(generatedContent.items) ? generatedContent.items : []
  };
  
  // Create the shape
  const shapeId = await operations.createShape('card', shapeData);
  
  // Create appropriate success message
  const semanticTypeNames = {
    'persona': 'persona card',
    'features': 'feature card',
    'user-story': 'user story card',
    'pain-points': 'pain points card',
    'competitive-analysis': 'competitive analysis card'
  };
  
  return {
    operation: 'semantic_create',
    shapeId,
    message: `Created ${semanticTypeNames[semantic_type]} with ${canvasMetadata.name} context`
  };
};

/**
 * Handle CREATE operations
 */
const handleCreateOperation = async (parsedCommand, operations, originalCommand = '', canvasMetadata = { name: '', description: '' }) => {
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
    fill: fillColor || getDefaultColorForType(type),
    stroke: '#E5E7EB',
    strokeWidth: 1
  };
  
  // Handle shape-specific properties - let LLM determine the best defaults
  console.log('🔧 Processing shape type:', type, 'with text:', text);
  
  if (type === 'text') {
    console.log('🔧 Creating text shape');
    shapeData.text = handleTextContent(text);
  } else if (type === 'stickyNote' || type === 'sticky' || type === 'note') {
    console.log('🔧 Creating sticky note shape');
    shapeData.text = text || 'Note';
    shapeData.width = 200;
    shapeData.height = 120;
  } else if (type === 'card') {
    // Generate context-aware card content
    const cardContent = await generateContextAwareCardContent(text, canvasMetadata, originalCommand);
    shapeData.title = cardContent.title;
    shapeData.content = cardContent.content;
    // Support items for cards if provided
    if (text?.items && Array.isArray(text.items)) {
      shapeData.items = text.items;
    }
    shapeData.width = 280;
    // Dynamic height based on content and items
    shapeData.height = (cardContent.content && text?.items && text.items.length > 0) ? 300 : 200;
    shapeData.fill = '#FFFFFF'; // White background for AI-generated cards
  } else if (type === 'list' || type === 'checklist' || type === 'todo') {
    // Generate context-aware list content
    const listContent = await generateContextAwareListContent(text, canvasMetadata, originalCommand);
    shapeData.title = listContent.title;
    shapeData.items = listContent.items;
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
