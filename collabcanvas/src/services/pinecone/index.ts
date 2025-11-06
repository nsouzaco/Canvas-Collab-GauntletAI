/**
 * Pinecone Service - Public API
 * 
 * Exports all Pinecone functionality for use throughout the app.
 */

// Client
export {
  initializePinecone,
  getPineconeIndex,
  resetPineconeClient
} from './client';

// Embeddings
export {
  generateEmbedding,
  generateEmbeddings,
  generateCanvasEmbedding,
  generateShapeEmbedding,
  generateConversationEmbedding,
  resetEmbeddingsClient
} from './embeddings';

// Canvas Index
export {
  storeCanvasMetadata,
  updateCanvasMetadata,
  deleteCanvasMetadata,
  searchSimilarCanvases,
  getCanvasContext
} from './canvasIndex';

// Shape Index
export {
  storeShape,
  updateShape,
  deleteShape,
  searchSimilarShapes,
  getCanvasShapesContext,
  findShapesByContent
} from './shapeIndex';

// Conversation Index
export {
  storeConversationMessage,
  getConversationHistory,
  searchConversationHistory,
  clearConversationHistory,
  getConversationContextSummary
} from './conversationIndex';

