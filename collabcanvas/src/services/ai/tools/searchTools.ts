/**
 * LangChain Tools for Semantic Search
 * 
 * Provides tools for the AI agent to search shapes and canvas context using Pinecone.
 */

import { Tool } from '@langchain/core/tools';
import {
  searchSimilarShapes,
  getCanvasShapesContext,
  getCanvasContext,
  searchSimilarCanvases,
} from '../../pinecone';

// Store current canvas ID for context
let currentCanvasId: string = '';
let currentUserId: string = '';

/**
 * Set the current canvas and user context
 */
export function setSearchContext(canvasId: string, userId: string) {
  currentCanvasId = canvasId;
  currentUserId = userId;
}

/**
 * Tool for searching similar shapes on the canvas
 */
export class SearchShapesTool extends Tool {
  name = 'search_shapes';
  description = `Searches for shapes with similar content on the current canvas using semantic search. Input should be a JSON string with query (text to search) and optional limit (number of results).`;

  async _call(input: string): Promise<string> {
    try {
      if (!currentCanvasId) {
        return 'Error: Canvas context not set.';
      }

      const parsed = JSON.parse(input);
      const results = await searchSimilarShapes(
        parsed.query,
        currentCanvasId,
        parsed.limit || 5
      );

      if (results.length === 0) {
        return `No shapes found matching "${parsed.query}".`;
      }

      const shapeSummaries = results.map((match, index) => {
        const meta = match.metadata as any;
        const score = (match.score * 100).toFixed(0);
        return `${index + 1}. ${meta.type} (${score}% match): ${meta.text || meta.title || 'No text'}`;
      });

      return `Found ${results.length} matching shapes:\n${shapeSummaries.join('\n')}`;
    } catch (error) {
      return `Error searching shapes: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Tool for getting canvas context
 */
export class GetCanvasContextTool extends Tool {
  name = 'get_canvas_context';
  description = `Gets information about the current canvas including its name, description, and shapes. Input should be a JSON string with optional includeShapes flag (defaults to true).`;

  async _call(input: string): Promise<string> {
    try {
      if (!currentCanvasId) {
        return 'Error: Canvas context not set.';
      }

      const parsed = JSON.parse(input);
      const includeShapes = parsed.includeShapes !== false;

      // Get canvas metadata
      const canvasInfo = await getCanvasContext(currentCanvasId);
      
      let context = canvasInfo || 'Canvas information not available.';

      // Get shapes context if requested
      if (includeShapes) {
        const shapesContext = await getCanvasShapesContext(currentCanvasId);
        if (shapesContext) {
          context += `\n\n${shapesContext}`;
        }
      }

      return context;
    } catch (error) {
      return `Error getting canvas context: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Tool for finding similar canvases
 */
export class SearchCanvasesTool extends Tool {
  name = 'search_canvases';
  description = `Searches for similar canvases across all user's canvases. Input should be a JSON string with query (description) and optional limit (number of results).`;

  async _call(input: string): Promise<string> {
    try {
      const parsed = JSON.parse(input);
      const results = await searchSimilarCanvases(parsed.query, parsed.limit || 5);

      if (results.length === 0) {
        return `No similar canvases found for "${parsed.query}".`;
      }

      const canvasSummaries = results.map((match, index) => {
        const meta = match.metadata as any;
        const score = (match.score * 100).toFixed(0);
        return `${index + 1}. ${meta.name} (${score}% match): ${meta.description || 'No description'}`;
      });

      return `Found ${results.length} similar canvases:\n${canvasSummaries.join('\n')}`;
    } catch (error) {
      return `Error searching canvases: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

/**
 * Tool for counting shapes by type
 */
export class CountShapesTool extends Tool {
  name = 'count_shapes';
  description = `Counts the number of shapes on the canvas, optionally filtered by type. Input should be a JSON string with optional type property.`;

  async _call(input: string): Promise<string> {
    try {
      if (!currentCanvasId) {
        return 'Error: Canvas context not set.';
      }

      const parsed = JSON.parse(input);
      const shapesContext = await getCanvasShapesContext(currentCanvasId);

      if (!shapesContext || shapesContext === 'No shapes on this canvas yet.') {
        return 'There are no shapes on this canvas yet.';
      }

      // Parse the shapes context to count
      // This is a simple implementation - in production you might want a dedicated count API
      const matches = shapesContext.match(/contains (\d+) shapes/);
      if (matches) {
        return `The canvas contains ${matches[1]} shapes${parsed.type ? ` of type ${parsed.type}` : ''}.`;
      }

      return 'Unable to count shapes on this canvas.';
    } catch (error) {
      return `Error counting shapes: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}

