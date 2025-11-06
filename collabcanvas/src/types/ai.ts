// AI and LangGraph type definitions

import { Shape, Position, Size } from './shapes';

export type AIOperation = 'create' | 'move' | 'delete' | 'resize' | 'semantic_create';

export type SemanticType = 'persona' | 'features' | 'user-story' | 'pain-points' | 'competitive-analysis';

export interface AICommand {
  operation: AIOperation;
  type?: string;
  color?: string;
  position?: {
    x?: number;
    y?: number;
    relative?: string;
  };
  size?: {
    width?: number;
    height?: number;
    description?: string;
  };
  text?: string | {
    title?: string;
    content?: string;
    items?: string[];
  };
  target?: {
    type: string;
    color: string;
    id?: string;
  };
  semantic_type?: SemanticType;
  confidence?: number;
  error?: string;
}

export interface AIOperationResult {
  operation: string;
  shapeId?: string;
  shapeIds?: string[];
  message: string;
  error?: string;
}

export interface AgentState {
  input: string;
  context: any;
  command: AICommand | null;
  result: AIOperationResult | null;
  error: string | null;
  conversationHistory: ConversationTurn[];
}

export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface ShapeOperations {
  createShape: (type: string, shapeData: any) => Promise<string>;
  moveShape: (shapeId: string, x: number, y: number) => Promise<void>;
  deleteShape: (shapeId: string) => Promise<void>;
  resizeShape: (shapeId: string, sizeData: Size) => Promise<void>;
}

