/**
 * LangChain Tools for Shape Operations
 * 
 * Provides tools for the AI agent to create, move, delete, and resize shapes.
 */

import { Tool } from '@langchain/core/tools';

// Type for canvas operations callback
export type ShapeOperationCallback = (operation: any) => Promise<any>;

let shapeOperationsCallback: ShapeOperationCallback | null = null;

/**
 * Set the callback for shape operations
 * This connects the tools to the actual canvas operations
 */
export function setShapeOperationsCallback(callback: ShapeOperationCallback) {
  shapeOperationsCallback = callback;
}

/**
 * Tool for creating shapes on the canvas
 */
export class CreateShapeTool extends Tool {
  name = 'create_shape';
  description = `Creates a shape on the canvas. Input should be a JSON string with type (rectangle, circle, text, stickyNote, card, or list), optional color, position, and content properties.`;

  // Remove schema - let LangChain handle it automatically
  // The _call method will parse JSON directly

  async _call(input: string): Promise<string> {
    try {
      if (!shapeOperationsCallback) {
        return 'Error: Shape operations not connected. Please refresh the page.';
      }

      const parsed = JSON.parse(input);
      const result = await shapeOperationsCallback({
        operation: 'create',
        ...parsed
      });

      if (result.success) {
        return `Successfully created a ${parsed.color || ''} ${parsed.type}${parsed.text ? ` with text "${parsed.text}"` : ''}.`;
      } else {
        return `Failed to create shape: ${result.error || 'Unknown error'}`;
      }
    } catch (error) {
      return `Error creating shape: ${error instanceof Error ? error.message : 'Invalid input format'}`;
    }
  }
}

/**
 * Tool for moving shapes
 */
export class MoveShapeTool extends Tool {
  name = 'move_shape';
  description = `Moves a shape to a new position. Input should be a JSON string with target (to find the shape) and position (center, left, right, top, bottom, or x/y coordinates).`;

  async _call(input: string): Promise<string> {
    try {
      if (!shapeOperationsCallback) {
        return 'Error: Shape operations not connected.';
      }

      const parsed = JSON.parse(input);
      const result = await shapeOperationsCallback({
        operation: 'move',
        ...parsed
      });

      if (result.success) {
        return `Successfully moved the shape to ${typeof parsed.position === 'string' ? parsed.position : 'specified position'}.`;
      } else {
        return `Failed to move shape: ${result.error || 'Shape not found'}`;
      }
    } catch (error) {
      return `Error moving shape: ${error instanceof Error ? error.message : 'Invalid input format'}`;
    }
  }
}

/**
 * Tool for deleting shapes
 */
export class DeleteShapeTool extends Tool {
  name = 'delete_shape';
  description = `Deletes shape(s) from the canvas. Input should be a JSON string with target (to find shapes) and optional deleteAll flag.`;

  async _call(input: string): Promise<string> {
    try {
      if (!shapeOperationsCallback) {
        return 'Error: Shape operations not connected.';
      }

      const parsed = JSON.parse(input);
      const result = await shapeOperationsCallback({
        operation: 'delete',
        ...parsed
      });

      if (result.success) {
        const count = result.deletedCount || 1;
        return `Successfully deleted ${count} shape${count > 1 ? 's' : ''}.`;
      } else {
        return `Failed to delete shape: ${result.error || 'Shape not found'}`;
      }
    } catch (error) {
      return `Error deleting shape: ${error instanceof Error ? error.message : 'Invalid input format'}`;
    }
  }
}

/**
 * Tool for resizing shapes
 */
export class ResizeShapeTool extends Tool {
  name = 'resize_shape';
  description = `Resizes a shape. Input should be a JSON string with target (to find the shape) and size (small, medium, large, bigger, smaller, or width/height).`;

  async _call(input: string): Promise<string> {
    try {
      if (!shapeOperationsCallback) {
        return 'Error: Shape operations not connected.';
      }

      const parsed = JSON.parse(input);
      const result = await shapeOperationsCallback({
        operation: 'resize',
        ...parsed
      });

      if (result.success) {
        return `Successfully resized the shape to ${parsed.size}.`;
      } else {
        return `Failed to resize shape: ${result.error || 'Shape not found'}`;
      }
    } catch (error) {
      return `Error resizing shape: ${error instanceof Error ? error.message : 'Invalid input format'}`;
    }
  }
}

/**
 * Tool for updating shape properties
 */
export class UpdateShapeTool extends Tool {
  name = 'update_shape';
  description = `Updates properties of a shape. Input should be a JSON string with target (to find the shape) and properties (object with properties to update).`;

  async _call(input: string): Promise<string> {
    try {
      if (!shapeOperationsCallback) {
        return 'Error: Shape operations not connected.';
      }

      const parsed = JSON.parse(input);
      const result = await shapeOperationsCallback({
        operation: 'update',
        ...parsed
      });

      if (result.success) {
        return `Successfully updated the shape properties.`;
      } else {
        return `Failed to update shape: ${result.error || 'Shape not found'}`;
      }
    } catch (error) {
      return `Error updating shape: ${error instanceof Error ? error.message : 'Invalid input format'}`;
    }
  }
}

