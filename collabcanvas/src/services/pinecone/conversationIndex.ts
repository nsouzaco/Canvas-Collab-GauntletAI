/**
 * Conversation Index Service
 * 
 * Stores AI conversation history for context-aware responses.
 */

import { getPineconeIndex } from './client';
import { generateConversationEmbedding } from './embeddings';
import type { PineconeVector, PineconeQueryResult } from '../../types/pinecone';
import type { AIConversationMessage } from '../../types/ai';

const CONVERSATION_NAMESPACE = 'conversations';

/**
 * Store a conversation message
 */
export async function storeConversationMessage(
  message: AIConversationMessage,
  canvasId: string,
  userId: string
): Promise<void> {
  try {
    const index = getPineconeIndex();
    const embedding = await generateConversationEmbedding(message);

    const timestamp = Date.now();
    const vector: PineconeVector = {
      id: `conv-${userId}-${canvasId}-${timestamp}`,
      values: embedding,
      metadata: {
        canvasId,
        shapeId: '',
        type: 'conversation',
        role: message.role,
        content: message.content,
        userId,
        timestamp,
      },
    };

    await index.namespace(CONVERSATION_NAMESPACE).upsert([vector]);
    console.log(`✅ Stored conversation message from ${message.role}`);
  } catch (error) {
    console.error('Error storing conversation message:', error);
    // Don't throw - conversation storage failures shouldn't break the app
  }
}

/**
 * Get recent conversation history for context
 */
export async function getConversationHistory(
  canvasId: string,
  userId: string,
  limit: number = 10
): Promise<AIConversationMessage[]> {
  try {
    const index = getPineconeIndex();
    const { generateEmbedding } = await import('./embeddings');
    
    // Use a generic query to get recent messages
    const queryEmbedding = await generateEmbedding('conversation history');

    const result = await index.namespace(CONVERSATION_NAMESPACE).query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      filter: {
        canvasId: { $eq: canvasId },
        userId: { $eq: userId }
      }
    });

    if (!result.matches || result.matches.length === 0) {
      return [];
    }

    // Sort by timestamp (most recent last)
    const messages = result.matches
      .map(match => {
        const meta = match.metadata as any;
        return {
          role: meta.role as 'user' | 'assistant' | 'system',
          content: meta.content,
          timestamp: meta.timestamp,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);

    return messages.map(({ role, content }) => ({ role, content }));
  } catch (error) {
    console.error('Error getting conversation history:', error);
    return [];
  }
}

/**
 * Search conversation history for relevant context
 */
export async function searchConversationHistory(
  query: string,
  canvasId: string,
  userId: string,
  topK: number = 5
): Promise<PineconeQueryResult['matches']> {
  try {
    const index = getPineconeIndex();
    const { generateEmbedding } = await import('./embeddings');
    const queryEmbedding = await generateEmbedding(query);

    const result = await index.namespace(CONVERSATION_NAMESPACE).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter: {
        canvasId: { $eq: canvasId },
        userId: { $eq: userId }
      }
    });

    return result.matches || [];
  } catch (error) {
    console.error('Error searching conversation history:', error);
    return [];
  }
}

/**
 * Clear conversation history for a user on a canvas
 */
export async function clearConversationHistory(
  canvasId: string,
  userId: string
): Promise<void> {
  try {
    const index = getPineconeIndex();
    
    // Delete by filter (requires Pinecone to support deleteMany with filter)
    // For now, we'll need to query first, then delete by IDs
    const { generateEmbedding } = await import('./embeddings');
    const queryEmbedding = await generateEmbedding('conversation');
    
    const result = await index.namespace(CONVERSATION_NAMESPACE).query({
      vector: queryEmbedding,
      topK: 1000, // Get all messages
      includeMetadata: true,
      filter: {
        canvasId: { $eq: canvasId },
        userId: { $eq: userId }
      }
    });

    if (result.matches && result.matches.length > 0) {
      const ids = result.matches.map(m => m.id);
      await index.namespace(CONVERSATION_NAMESPACE).deleteMany(ids);
      console.log(`✅ Cleared ${ids.length} conversation messages`);
    }
  } catch (error) {
    console.error('Error clearing conversation history:', error);
  }
}

/**
 * Get conversation context summary for AI
 */
export async function getConversationContextSummary(
  canvasId: string,
  userId: string
): Promise<string> {
  try {
    const history = await getConversationHistory(canvasId, userId, 5);
    
    if (history.length === 0) {
      return 'No previous conversation.';
    }

    const summary = history.map(msg => 
      `${msg.role}: ${msg.content.substring(0, 100)}`
    ).join('\n');

    return `Recent conversation:\n${summary}`;
  } catch (error) {
    console.error('Error getting conversation context summary:', error);
    return '';
  }
}

