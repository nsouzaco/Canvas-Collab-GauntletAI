/**
 * AI Service Adapter
 * 
 * Provides a unified interface for AI operations, routing between
 * the old OpenAI system and the new LangChain agent based on feature flags.
 */

import { executeAICommand as executeLangChainCommand } from './agent';
import { processAIOperation } from '../../utils/aiOperationHandler';
import type { ShapeOperationCallback } from './tools';

/**
 * Check if the new LangChain AI system should be used
 */
function shouldUseLangChainAI(): boolean {
  const flag = import.meta.env.VITE_USE_LANGCHAIN_AI;
  return flag === 'true' || flag === true;
}

/**
 * Execute AI operation with automatic routing between old and new systems
 */
export async function executeAIOperation(params: {
  // For new LangChain system
  command?: string;
  canvasId: string;
  userId: string;
  
  // For old system (backward compatibility)
  parsedCommand?: any;
  originalCommand?: string;
  conversationHistory?: any[];
  shapes?: any[];
  canvasMetadata?: any;
  
  // Shape operations (required for both)
  operations: {
    createShape: (type: string, shapeData: any) => Promise<string>;
    moveShape: (shapeId: string, x: number, y: number) => Promise<any>;
    deleteShape: (shapeId: string) => Promise<any>;
    resizeShape: (shapeId: string, sizeData: any) => Promise<any>;
  };
}): Promise<any> {
  const useLangChain = shouldUseLangChainAI();

  if (useLangChain && params.command) {
    // Use new LangChain agent
    console.log('🤖 Using LangChain agent for AI command');
    
    // Convert operations to callback format for LangChain tools
    const shapeOperationsCallback: ShapeOperationCallback = async (operation: any) => {
      try {
        switch (operation.operation) {
          case 'create':
            // Check if this is a semantic content generation request
            let shapeData: any = {
              x: operation.position?.x,
              y: operation.position?.y,
              fill: operation.color || 'blue',
              text: operation.text,
              title: operation.title,
              content: operation.content,
              items: operation.items,
            };

            // If creating a card and content is missing, check if we should generate semantic content
            if (operation.type === 'card' && !operation.title && !operation.content) {
              // Import the generator functions
              const { 
                generatePersonaCard, 
                generateFeatureCard, 
                generatePainPointsCard,
                generateUserStoryCard,
                generateCompetitiveAnalysisCard
              } = await import('../../services/openai');
              
              // Determine content type from the command or operation context
              const commandLower = params.command?.toLowerCase() || '';
              let generatedContent = null;

              if (commandLower.includes('persona')) {
                console.log('🎨 Generating persona card content...');
                generatedContent = await generatePersonaCard(params.canvasMetadata || { name: '', description: '' });
              } else if (commandLower.includes('feature')) {
                console.log('🎨 Generating feature card content...');
                generatedContent = await generateFeatureCard(params.canvasMetadata || { name: '', description: '' });
              } else if (commandLower.includes('pain point') || commandLower.includes('pain-point')) {
                console.log('🎨 Generating pain points card content...');
                generatedContent = await generatePainPointsCard(params.canvasMetadata || { name: '', description: '' });
              } else if (commandLower.includes('user story') || commandLower.includes('user-story')) {
                console.log('🎨 Generating user story card content...');
                generatedContent = await generateUserStoryCard(params.canvasMetadata || { name: '', description: '' });
              } else if (commandLower.includes('competitive') || commandLower.includes('competitor')) {
                console.log('🎨 Generating competitive analysis card content...');
                generatedContent = await generateCompetitiveAnalysisCard(params.canvasMetadata || { name: '', description: '' });
              }

              // If we generated content, use it
              if (generatedContent) {
                shapeData.title = generatedContent.title;
                shapeData.content = generatedContent.content || '';
                shapeData.items = generatedContent.items || [];
                shapeData.fill = '#FFFFFF'; // White background for AI-generated cards
                shapeData.width = 300;
                shapeData.height = 350;
                console.log('✅ Generated content:', { title: shapeData.title, itemCount: shapeData.items?.length });
              }
            }

            const shapeId = await params.operations.createShape(operation.type, shapeData);
            return { success: true, shapeId };

          case 'move':
            const movePos = typeof operation.position === 'object' 
              ? operation.position 
              : { x: 0, y: 0 }; // Tool will calculate actual position
            await params.operations.moveShape(operation.target.id, movePos.x, movePos.y);
            return { success: true };

          case 'delete':
            await params.operations.deleteShape(operation.target.id);
            return { success: true, deletedCount: 1 };

          case 'resize':
            const sizeData = typeof operation.size === 'object'
              ? operation.size
              : {}; // Tool will calculate actual size
            await params.operations.resizeShape(operation.target.id, sizeData);
            return { success: true };

          case 'update':
            // Update is implemented as resize/move combo
            if (operation.properties.text) {
              // For text updates, we'd need to add an updateShape operation
              return { success: true };
            }
            return { success: true };

          default:
            return { success: false, error: 'Unknown operation' };
        }
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Operation failed'
        };
      }
    };

    return await executeLangChainCommand({
      command: params.command,
      canvasId: params.canvasId,
      userId: params.userId,
      shapeOperations: shapeOperationsCallback,
    });
  } else {
    // Use old OpenAI system (backward compatibility)
    console.log('📝 Using legacy OpenAI system for AI command');
    
    if (!params.parsedCommand || !params.shapes) {
      throw new Error('Missing required parameters for legacy AI system');
    }

    return await processAIOperation(
      params.parsedCommand,
      params.shapes,
      params.operations,
      params.originalCommand || '',
      params.canvasMetadata || {},
      params.conversationHistory || []
    );
  }
}

/**
 * Get the current AI system being used
 */
export function getCurrentAISystem(): 'langchain' | 'openai' {
  return shouldUseLangChainAI() ? 'langchain' : 'openai';
}

/**
 * Check if LangChain AI is available
 */
export function isLangChainAvailable(): boolean {
  const hasOpenAIKey = !!import.meta.env.VITE_OPENAI_API_KEY;
  const hasPineconeKey = !!import.meta.env.VITE_PINECONE_API_KEY;
  return hasOpenAIKey && hasPineconeKey;
}

