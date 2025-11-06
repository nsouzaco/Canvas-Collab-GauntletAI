/**
 * Proof of Concept: Test Pinecone Connection and Embedding Generation
 * 
 * Run this to verify Pinecone setup is working correctly.
 * 
 * Usage:
 *   ts-node src/services/ai-poc/test-pinecone.ts
 */

import dotenv from 'dotenv';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAIEmbeddings } from '@langchain/openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function testPineconeConnection() {
  console.log('🧪 Testing Pinecone Connection...\n');

  // Step 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const apiKey = process.env.VITE_PINECONE_API_KEY;
  const environment = process.env.VITE_PINECONE_ENVIRONMENT;
  const indexName = process.env.VITE_PINECONE_INDEX_NAME;

  if (!apiKey || !environment || !indexName) {
    console.error('❌ Missing Pinecone environment variables');
    console.log('   Required: VITE_PINECONE_API_KEY, VITE_PINECONE_ENVIRONMENT, VITE_PINECONE_INDEX_NAME');
    console.log('   See ENV_SETUP.md for instructions');
    return;
  }
  console.log('✅ Environment variables found\n');

  try {
    // Step 2: Initialize Pinecone client
    console.log('2️⃣ Initializing Pinecone client...');
    const pinecone = new Pinecone({
      apiKey: apiKey
    });
    console.log('✅ Pinecone client initialized\n');

    // Step 3: Get index
    console.log('3️⃣ Connecting to index...');
    const index = pinecone.index(indexName);
    console.log(`✅ Connected to index: ${indexName}\n`);

    // Step 4: Test embedding generation
    console.log('4️⃣ Generating test embedding...');
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.VITE_OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002',
    });

    const testText = 'This is a test canvas for a healthcare startup focused on patient management';
    const embedding = await embeddings.embedQuery(testText);
    console.log(`✅ Embedding generated: ${embedding.length} dimensions\n`);

    // Step 5: Upsert test document
    console.log('5️⃣ Upserting test document to Pinecone...');
    const testId = `test-${Date.now()}`;
    await index.upsert([
      {
        id: testId,
        values: embedding,
        metadata: {
          type: 'test',
          text: testText,
          createdAt: Date.now(),
        },
      },
    ]);
    console.log(`✅ Document upserted with ID: ${testId}\n`);

    // Step 6: Query for similar documents
    console.log('6️⃣ Querying for similar documents...');
    const queryEmbedding = await embeddings.embedQuery('healthcare patient system');
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: 3,
      includeMetadata: true,
    });
    
    console.log(`✅ Found ${queryResponse.matches.length} matches:`);
    queryResponse.matches.forEach((match, i) => {
      console.log(`   ${i + 1}. Score: ${match.score.toFixed(4)} | ID: ${match.id}`);
      console.log(`      Metadata: ${JSON.stringify(match.metadata, null, 2)}`);
    });
    console.log('');

    // Step 7: Clean up test document
    console.log('7️⃣ Cleaning up test document...');
    await index.deleteOne(testId);
    console.log('✅ Test document deleted\n');

    // Success!
    console.log('🎉 All tests passed! Pinecone is set up correctly.\n');
    console.log('Next steps:');
    console.log('  1. Run test-langgraph.ts to test LangGraph');
    console.log('  2. Proceed with Phase 1.3: Proof of Concept');

  } catch (error) {
    console.error('❌ Error during Pinecone test:');
    console.error(error);
    console.log('\nTroubleshooting:');
    console.log('  - Check your API key is correct');
    console.log('  - Verify your Pinecone environment matches your account');
    console.log('  - Ensure the index exists in your Pinecone dashboard');
    console.log('  - Check your network connection');
  }
}

// Run the test
testPineconeConnection();

