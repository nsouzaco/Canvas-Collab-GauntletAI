/**
 * AI Service - Public API
 * 
 * Main entry point for AI-powered canvas operations.
 */

export {
  initializeAgent,
  executeAICommand,
  resetAgent,
  isAgentInitialized,
} from './agent';

export {
  CreateShapeTool,
  MoveShapeTool,
  DeleteShapeTool,
  ResizeShapeTool,
  UpdateShapeTool,
  SearchShapesTool,
  GetCanvasContextTool,
  SearchCanvasesTool,
  CountShapesTool,
  setShapeOperationsCallback,
  setSearchContext,
  type ShapeOperationCallback,
} from './tools';

