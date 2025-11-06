// Pinecone type definitions

export interface PineconeConfig {
  apiKey: string;
  environment: string;
  indexName: string;
}

export interface EmbeddingMetadata {
  id: string;
  type: 'canvas' | 'shape' | 'conversation';
  createdAt: number;
  [key: string]: any;
}

export interface CanvasEmbedding {
  id: string;
  vector: number[];
  metadata: {
    id: string;
    type: 'canvas';
    name: string;
    description: string;
    createdBy: string;
    createdAt: number;
    shapeCount: number;
  };
}

export interface ShapeEmbedding {
  id: string;
  vector: number[];
  metadata: {
    id: string;
    type: 'shape';
    canvasId: string;
    shapeType: string;
    text: string;
    title?: string;
    x: number;
    y: number;
    createdAt: number;
  };
}

export interface ConversationEmbedding {
  id: string;
  vector: number[];
  metadata: {
    id: string;
    type: 'conversation';
    userId: string;
    canvasId: string;
    userMessage: string;
    aiResponse: string;
    timestamp: number;
  };
}

export type PineconeDocument = CanvasEmbedding | ShapeEmbedding | ConversationEmbedding;

export interface SearchResult<T = EmbeddingMetadata> {
  id: string;
  score: number;
  metadata: T;
}

export interface SearchOptions {
  topK?: number;
  filter?: Record<string, any>;
  includeMetadata?: boolean;
}

