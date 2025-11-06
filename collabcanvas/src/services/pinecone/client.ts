/**
 * Pinecone Client Initialization
 * 
 * Handles connection to Pinecone and provides the index instance.
 */

import { Pinecone } from '@pinecone-database/pinecone';
import type { Index } from '@pinecone-database/pinecone';

// Browser compatibility fix
if (typeof global === 'undefined') {
  (window as any).global = window;
}

let pineconeClient: Pinecone | null = null;
let pineconeIndex: Index | null = null;

/**
 * Initialize Pinecone client with environment variables
 */
export function initializePinecone(): Pinecone {
  if (pineconeClient) {
    return pineconeClient;
  }

  const apiKey = import.meta.env.VITE_PINECONE_API_KEY;
  const environment = import.meta.env.VITE_PINECONE_ENVIRONMENT;

  if (!apiKey || !environment) {
    throw new Error('Missing Pinecone configuration. Check VITE_PINECONE_API_KEY and VITE_PINECONE_ENVIRONMENT');
  }

  try {
    pineconeClient = new Pinecone({
      apiKey,
    });
  } catch (error) {
    console.error('Failed to initialize Pinecone:', error);
    throw new Error('Pinecone initialization failed. This may be due to browser compatibility issues.');
  }

  return pineconeClient;
}

/**
 * Get Pinecone index instance
 */
export function getPineconeIndex(): Index {
  if (pineconeIndex) {
    return pineconeIndex;
  }

  const indexName = import.meta.env.VITE_PINECONE_INDEX_NAME || 'canvascollab';
  const client = initializePinecone();
  
  pineconeIndex = client.index(indexName);
  return pineconeIndex;
}

/**
 * Reset client and index (useful for testing)
 */
export function resetPineconeClient(): void {
  pineconeClient = null;
  pineconeIndex = null;
}

