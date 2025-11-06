/**
 * Canvas Index Service
 * 
 * Stores and queries canvas metadata embeddings for contextual AI responses.
 */

import { getPineconeIndex } from './client';
import { generateCanvasEmbedding } from './embeddings';
import type { PineconeVector, PineconeQueryResult } from '../../types/pinecone';

const CANVAS_NAMESPACE = 'canvases';

/**
 * Store canvas metadata in Pinecone
 */
export async function storeCanvasMetadata(canvas: {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: Date;
}): Promise<void> {
  try {
    const index = getPineconeIndex();
    const embedding = await generateCanvasEmbedding(canvas);

    const vector: PineconeVector = {
      id: `canvas-${canvas.id}`,
      values: embedding,
      metadata: {
        canvasId: canvas.id,
        shapeId: '',
        type: 'canvas',
        name: canvas.name,
        description: canvas.description || '',
        createdBy: canvas.createdBy,
        createdAt: canvas.createdAt.toISOString(),
      },
    };

    await index.namespace(CANVAS_NAMESPACE).upsert([vector]);
    console.log(`✅ Stored canvas metadata: ${canvas.name}`);
  } catch (error) {
    console.error('Error storing canvas metadata:', error);
    throw new Error('Failed to store canvas metadata in Pinecone');
  }
}

/**
 * Update canvas metadata in Pinecone
 */
export async function updateCanvasMetadata(canvas: {
  id: string;
  name: string;
  description?: string;
}): Promise<void> {
  try {
    const index = getPineconeIndex();
    const embedding = await generateCanvasEmbedding(canvas);

    // Upsert will update if exists or create if doesn't
    const vector: Partial<PineconeVector> = {
      id: `canvas-${canvas.id}`,
      values: embedding,
      metadata: {
        canvasId: canvas.id,
        shapeId: '',
        type: 'canvas',
        name: canvas.name,
        description: canvas.description || '',
      },
    };

    await index.namespace(CANVAS_NAMESPACE).upsert([vector as PineconeVector]);
    console.log(`✅ Updated canvas metadata: ${canvas.name}`);
  } catch (error) {
    console.error('Error updating canvas metadata:', error);
    throw new Error('Failed to update canvas metadata in Pinecone');
  }
}

/**
 * Delete canvas metadata from Pinecone
 */
export async function deleteCanvasMetadata(canvasId: string): Promise<void> {
  try {
    const index = getPineconeIndex();
    await index.namespace(CANVAS_NAMESPACE).deleteOne(`canvas-${canvasId}`);
    console.log(`✅ Deleted canvas metadata: ${canvasId}`);
  } catch (error) {
    console.error('Error deleting canvas metadata:', error);
    throw new Error('Failed to delete canvas metadata from Pinecone');
  }
}

/**
 * Search for similar canvases by query
 */
export async function searchSimilarCanvases(
  query: string,
  topK: number = 5
): Promise<PineconeQueryResult['matches']> {
  try {
    const index = getPineconeIndex();
    const { generateEmbedding } = await import('./embeddings');
    const queryEmbedding = await generateEmbedding(query);

    const result = await index.namespace(CANVAS_NAMESPACE).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    return result.matches || [];
  } catch (error) {
    console.error('Error searching similar canvases:', error);
    return [];
  }
}

/**
 * Get canvas context for AI (retrieves canvas metadata for context)
 */
export async function getCanvasContext(canvasId: string): Promise<string> {
  try {
    const index = getPineconeIndex();
    
    // Fetch the specific canvas vector
    const result = await index.namespace(CANVAS_NAMESPACE).fetch([`canvas-${canvasId}`]);
    
    if (!result.records || Object.keys(result.records).length === 0) {
      return '';
    }

    const record = result.records[`canvas-${canvasId}`];
    const metadata = record.metadata as any;
    
    return `Canvas: ${metadata.name}. ${metadata.description || 'No description.'}`;
  } catch (error) {
    console.error('Error getting canvas context:', error);
    return '';
  }
}

