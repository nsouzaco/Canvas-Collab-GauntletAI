/**
 * Shape Index Service
 * 
 * Stores and queries shape embeddings for semantic search and recommendations.
 */

import { getPineconeIndex } from './client';
import { generateShapeEmbedding } from './embeddings';
import type { PineconeVector, PineconeQueryResult } from '../../types/pinecone';
import type { Shape } from '../../types/shapes';

const SHAPE_NAMESPACE = 'shapes';

/**
 * Store shape in Pinecone for semantic search
 */
export async function storeShape(shape: Shape, canvasId: string): Promise<void> {
  try {
    // Only store shapes with text content
    const hasContent = shape.type === 'text' || shape.type === 'stickyNote' || 
                      shape.type === 'card' || shape.type === 'list';
    
    if (!hasContent) {
      return; // Skip shapes without text content
    }

    const index = getPineconeIndex();
    const embedding = await generateShapeEmbedding(shape as any);

    const vector: PineconeVector = {
      id: `shape-${shape.id}`,
      values: embedding,
      metadata: {
        canvasId,
        shapeId: shape.id,
        type: shape.type,
        text: (shape as any).text || '',
        title: (shape as any).title || '',
        content: (shape as any).content || '',
        x: shape.x,
        y: shape.y,
        createdAt: shape.createdAt.toISOString(),
      },
    };

    await index.namespace(SHAPE_NAMESPACE).upsert([vector]);
    console.log(`✅ Stored shape: ${shape.id} (${shape.type})`);
  } catch (error) {
    console.error('Error storing shape:', error);
    // Don't throw - embedding failures shouldn't break shape creation
  }
}

/**
 * Update shape in Pinecone
 */
export async function updateShape(shape: Shape, canvasId: string): Promise<void> {
  try {
    const hasContent = shape.type === 'text' || shape.type === 'stickyNote' || 
                      shape.type === 'card' || shape.type === 'list';
    
    if (!hasContent) {
      return;
    }

    const index = getPineconeIndex();
    const embedding = await generateShapeEmbedding(shape as any);

    const vector: PineconeVector = {
      id: `shape-${shape.id}`,
      values: embedding,
      metadata: {
        canvasId,
        shapeId: shape.id,
        type: shape.type,
        text: (shape as any).text || '',
        title: (shape as any).title || '',
        content: (shape as any).content || '',
        x: shape.x,
        y: shape.y,
      },
    };

    await index.namespace(SHAPE_NAMESPACE).upsert([vector]);
    console.log(`✅ Updated shape: ${shape.id}`);
  } catch (error) {
    console.error('Error updating shape:', error);
  }
}

/**
 * Delete shape from Pinecone
 */
export async function deleteShape(shapeId: string): Promise<void> {
  try {
    const index = getPineconeIndex();
    await index.namespace(SHAPE_NAMESPACE).deleteOne(`shape-${shapeId}`);
    console.log(`✅ Deleted shape: ${shapeId}`);
  } catch (error) {
    console.error('Error deleting shape:', error);
  }
}

/**
 * Search for similar shapes on current canvas
 */
export async function searchSimilarShapes(
  query: string,
  canvasId: string,
  topK: number = 5
): Promise<PineconeQueryResult['matches']> {
  try {
    const index = getPineconeIndex();
    const { generateEmbedding } = await import('./embeddings');
    const queryEmbedding = await generateEmbedding(query);

    const result = await index.namespace(SHAPE_NAMESPACE).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: {
        canvasId: { $eq: canvasId }
      }
    });

    return result.matches || [];
  } catch (error) {
    console.error('Error searching similar shapes:', error);
    return [];
  }
}

/**
 * Get all shapes from current canvas for context
 */
export async function getCanvasShapesContext(canvasId: string): Promise<string> {
  try {
    // Query with a generic embedding to get all shapes from this canvas
    const index = getPineconeIndex();
    const { generateEmbedding } = await import('./embeddings');
    const queryEmbedding = await generateEmbedding('canvas shapes');

    const result = await index.namespace(SHAPE_NAMESPACE).query({
      vector: queryEmbedding,
      topK: 50, // Get up to 50 shapes for context
      includeMetadata: true,
      filter: {
        canvasId: { $eq: canvasId }
      }
    });

    if (!result.matches || result.matches.length === 0) {
      return 'No shapes on this canvas yet.';
    }

    // Build context string
    const shapeSummaries = result.matches.map(match => {
      const meta = match.metadata as any;
      if (meta.text) {
        return `${meta.type}: "${meta.text}"`;
      } else if (meta.title) {
        return `${meta.type}: "${meta.title}"`;
      } else {
        return `${meta.type} shape`;
      }
    });

    return `Canvas contains ${shapeSummaries.length} shapes: ${shapeSummaries.slice(0, 10).join(', ')}`;
  } catch (error) {
    console.error('Error getting canvas shapes context:', error);
    return '';
  }
}

/**
 * Find shapes by text content (exact or similar)
 */
export async function findShapesByContent(
  searchText: string,
  canvasId: string
): Promise<PineconeQueryResult['matches']> {
  return searchSimilarShapes(searchText, canvasId, 10);
}

