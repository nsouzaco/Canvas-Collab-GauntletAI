// Canvas type definitions

import { Shape } from './shapes';

export interface Canvas {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: any; // Firebase Timestamp
  isPublic: boolean;
  shapes: Shape[];
  lastUpdated: any; // Firebase Timestamp
}

export interface CanvasMetadata {
  name: string;
  description: string;
}

export interface CreateCanvasInput {
  name: string;
  description: string;
  createdBy: string;
}

