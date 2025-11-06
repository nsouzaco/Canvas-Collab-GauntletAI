/**
 * Proof of Concept: Test LangChain Agent System
 * 
 * Run this to verify LangChain agent setup is working correctly.
 * 
 * Usage:
 *   ts-node src/services/ai-poc/test-langchain.ts
 */

import dotenv from 'dotenv';
import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import { Tool } from '@langchain/core/tools';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// Define a simple tool for creating shapes
class CreateShapeTool extends Tool {
  name = 'create_shape';
  description = 'Creates a shape on the canvas. Input should be a JSON string with type and color, e.g. {"type": "rectangle", "color": "red"}';

  async _call(input: string): Promise<string> {
    try {
      const parsed = JSON.parse(input);
      return `Successfully created a ${parsed.color} ${parsed.type}`;
    } catch (error) {
      return `Error: Invalid input format. Expected JSON with type and color.`;
    }
  }
}

async function testLangChain() {
  console.log('🧪 Testing LangChain Agent Setup...\n');

  // Step 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const apiKey = process.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ Missing OpenAI API key');
    console.log('   Required: VITE_OPENAI_API_KEY in .env');
    return;
  }
  console.log('✅ OpenAI API key found\n');

  try {
    // Step 2: Initialize OpenAI model
    console.log('2️⃣ Initializing OpenAI model...');
    const model = new ChatOpenAI({
      apiKey: apiKey, // Use 'apiKey' instead of 'openAIApiKey'
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
    });
    console.log('✅ OpenAI model initialized\n');

    // Step 3: Test simple chat completion
    console.log('3️⃣ Testing simple chat completion...');
    const testMessage = await model.invoke('Say "LangChain is working!" if you can read this.');
    console.log(`✅ Response: "${testMessage.content}"\n`);

    // Step 4: Create tools
    console.log('4️⃣ Creating tools...');
    const tools = [new CreateShapeTool()];
    console.log(`✅ Created ${tools.length} tool(s)\n`);

    // Step 5: Initialize agent
    console.log('5️⃣ Initializing agent with tools...');
    const executor = await initializeAgentExecutorWithOptions(
      tools,
      model,
      {
        agentType: 'openai-functions',
        verbose: false,
      }
    );
    console.log('✅ Agent initialized successfully\n');

    // Step 6: Test the agent
    console.log('6️⃣ Running test command through agent...');
    const testInput = 'Create a red rectangle on the canvas';
    console.log(`   Input: "${testInput}"`);
    
    const result = await executor.call({
      input: testInput,
    });

    console.log(`✅ Agent response:`);
    console.log(`   ${result.output}\n`);

    // Success!
    console.log('🎉 All tests passed! LangChain is set up correctly.\n');
    console.log('Next steps:');
    console.log('  1. Proceed with Phase 1.4: Architecture Design');
    console.log('  2. Create full agent system with all shape tools');
    console.log('  3. Integrate with Pinecone for context retrieval');

  } catch (error) {
    console.error('❌ Error during LangChain test:');
    console.error(error);
    console.log('\nTroubleshooting:');
    console.log('  - Check your OpenAI API key is correct');
    console.log('  - Ensure you have internet connection');
    console.log('  - Verify your OpenAI account has credits');
    console.log('  - Try running: npm install langchain @langchain/openai @langchain/core');
  }
}

// Run the test
testLangChain();

