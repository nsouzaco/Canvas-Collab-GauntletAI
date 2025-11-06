// Shape type definitions

export type ShapeType = 'rectangle' | 'circle' | 'text' | 'stickyNote' | 'card' | 'list';

export type TextType = 'normal' | 'title' | 'subtitle' | 'heading1' | 'heading2' | 'heading3';

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  
  // Metadata
  createdBy: string;
  createdAt: Date | any; // Firebase Timestamp
  lastModifiedBy: string;
  lastModifiedAt: Date | any; // Firebase Timestamp
  
  // Collaboration
  isLocked: boolean;
  lockedBy: string | null;
  isSelected: boolean;
  selectedBy: string | null;
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
}

export interface CircleShape extends BaseShape {
  type: 'circle';
}

export interface TextShape extends BaseShape {
  type: 'text';
  text: string;
  fontSize?: number;
  textType?: TextType;
  fontFamily?: string;
}

export interface StickyNoteShape extends BaseShape {
  type: 'stickyNote';
  text: string;
}

export interface CardShape extends BaseShape {
  type: 'card';
  title: string;
  content: string;
  items?: string[];
}

export interface ListShape extends BaseShape {
  type: 'list';
  title: string;
  items: string[];
}

export type Shape = 
  | RectangleShape 
  | CircleShape 
  | TextShape 
  | StickyNoteShape 
  | CardShape 
  | ListShape;

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface RealTimePosition {
  x: number;
  y: number;
  updatedBy: string;
  timestamp: number;
}

