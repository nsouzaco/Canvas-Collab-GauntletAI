/**
 * Embedding Generation Service
 * 
 * Generates vector embeddings using OpenAI for semantic search.
 */

import { OpenAIEmbeddings } from '@langchain/openai';

let embeddingsClient: OpenAIEmbeddings | null = null;

/**
 * Initialize OpenAI embeddings client
 */
function getEmbeddingsClient(): OpenAIEmbeddings {
  if (embeddingsClient) {
    return embeddingsClient;
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing OpenAI API key. Check VITE_OPENAI_API_KEY');
  }

  embeddingsClient = new OpenAIEmbeddings({
    openAIApiKey: apiKey,
    modelName: 'text-embedding-ada-002',
  });

  return embeddingsClient;
}

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const client = getEmbeddingsClient();
    const embedding = await client.embedQuery(text);
    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embeddings for multiple texts (batch operation)
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const client = getEmbeddingsClient();
    const embeddings = await client.embedDocuments(texts);
    return embeddings;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error('Failed to generate embeddings');
  }
}

/**
 * Generate embedding for canvas metadata
 * Combines canvas name, description, and context
 */
export async function generateCanvasEmbedding(canvas: {
  name: string;
  description?: string;
}): Promise<number[]> {
  const text = `Canvas: ${canvas.name}. ${canvas.description || ''}`.trim();
  return generateEmbedding(text);
}

/**
 * Generate embedding for shape content
 * Handles different shape types appropriately
 */
export async function generateShapeEmbedding(shape: {
  type: string;
  text?: string;
  title?: string;
  content?: string;
  items?: string[];
}): Promise<number[]> {
  let text = `${shape.type} shape`;
  
  if (shape.text) {
    text += `: ${shape.text}`;
  }
  
  if (shape.title) {
    text += `: ${shape.title}`;
  }
  
  if (shape.content) {
    text += ` - ${shape.content}`;
  }
  
  if (shape.items && shape.items.length > 0) {
    text += ` - ${shape.items.join(', ')}`;
  }
  
  return generateEmbedding(text);
}

/**
 * Generate embedding for conversation message
 */
export async function generateConversationEmbedding(message: {
  role: string;
  content: string;
}): Promise<number[]> {
  const text = `${message.role}: ${message.content}`;
  return generateEmbedding(text);
}

/**
 * Reset embeddings client (useful for testing)
 */
export function resetEmbeddingsClient(): void {
  embeddingsClient = null;
}

