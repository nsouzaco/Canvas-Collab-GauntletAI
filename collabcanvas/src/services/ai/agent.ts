/**
 * LangChain Agent for Canvas Operations
 * 
 * Main AI agent that handles natural language commands and executes canvas operations.
 */

import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';
import type { AgentExecutor } from 'langchain/agents';
import {
  CreateShapeTool,
  MoveShapeTool,
  DeleteShapeTool,
  ResizeShapeTool,
  UpdateShapeTool,
  SearchShapesTool,
  GetCanvasContextTool,
  SearchCanvasesTool,
  CountShapesTool,
  setShapeOperationsCallback,
  setSearchContext,
  type ShapeOperationCallback,
} from './tools';
import {
  getCanvasContext,
  getConversationHistory,
  storeConversationMessage,
  type AIConversationMessage,
} from '../pinecone';

let agentExecutor: AgentExecutor | null = null;

/**
 * Initialize the LangChain agent with all tools
 */
export async function initializeAgent(): Promise<AgentExecutor> {
  if (agentExecutor) {
    return agentExecutor;
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing OpenAI API key. Check VITE_OPENAI_API_KEY');
  }

  // Initialize OpenAI model
  const model = new ChatOpenAI({
    apiKey,
    model: 'gpt-3.5-turbo',
    temperature: 0.1, // Low temperature for more consistent responses
  });

  // Create all tools
  const tools = [
    new CreateShapeTool(),
    new MoveShapeTool(),
    new DeleteShapeTool(),
    new ResizeShapeTool(),
    new UpdateShapeTool(),
    new SearchShapesTool(),
    new GetCanvasContextTool(),
    new SearchCanvasesTool(),
    new CountShapesTool(),
  ];

  // Initialize agent with OpenAI Functions
  agentExecutor = await initializeAgentExecutorWithOptions(
    tools,
    model,
    {
      agentType: 'openai-functions',
      verbose: false, // Set to true for debugging
      maxIterations: 5, // Limit iterations to prevent infinite loops
    }
  );

  console.log('✅ LangChain agent initialized with', tools.length, 'tools');
  return agentExecutor;
}

/**
 * Execute an AI command on the canvas
 */
export async function executeAICommand(params: {
  command: string;
  canvasId: string;
  userId: string;
  shapeOperations: ShapeOperationCallback;
}): Promise<{
  success: boolean;
  response: string;
  error?: string;
}> {
  try {
    const { command, canvasId, userId, shapeOperations } = params;

    // Set up context for tools
    setShapeOperationsCallback(shapeOperations);
    setSearchContext(canvasId, userId);

    // Initialize agent if not already done
    const agent = await initializeAgent();

    // Get canvas and conversation context
    const canvasContext = await getCanvasContext(canvasId);
    const conversationHistory = await getConversationHistory(canvasId, userId, 5);

    // Build context string
    let contextString = '';
    if (canvasContext) {
      contextString += `Current canvas: ${canvasContext}\n`;
    }
    if (conversationHistory.length > 0) {
      contextString += `\nRecent conversation:\n`;
      conversationHistory.forEach(msg => {
        contextString += `${msg.role}: ${msg.content.substring(0, 100)}\n`;
      });
    }

    // Build full prompt with context
    const fullPrompt = contextString 
      ? `${contextString}\n\nUser command: ${command}`
      : command;

    // Execute the agent
    const result = await agent.call({
      input: fullPrompt,
    });

    // Store conversation in Pinecone
    await storeConversationMessage(
      { role: 'user', content: command },
      canvasId,
      userId
    );
    await storeConversationMessage(
      { role: 'assistant', content: result.output },
      canvasId,
      userId
    );

    return {
      success: true,
      response: result.output,
    };
  } catch (error) {
    console.error('Error executing AI command:', error);
    return {
      success: false,
      response: 'Sorry, I encountered an error processing your command.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reset the agent (useful for testing or when switching contexts)
 */
export function resetAgent(): void {
  agentExecutor = null;
}

/**
 * Check if agent is initialized
 */
export function isAgentInitialized(): boolean {
  return agentExecutor !== null;
}

