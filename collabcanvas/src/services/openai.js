import OpenAI from 'openai';
import { mockOpenAIResponse } from '../utils/testAICommands';

// Initialize OpenAI client
const openai = import.meta.env.VITE_OPENAI_API_KEY ? new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
}) : null;

/**
 * Parse natural language command to extract shape creation parameters
 * @param {string} command - Natural language command (e.g., "draw a red circle")
 * @returns {Promise<Object>} Parsed command object with shape properties
 */
export const parseShapeCommand = async (command) => {
  try {
    // If no API key is provided, use mock responses for development
    if (!openai) {
      console.log('🤖 Using mock AI response for development');
      const mockResponse = mockOpenAIResponse(command);
      console.log('🤖 Mock response:', mockResponse);
      return {
        ...mockResponse,
        confidence: 0.8
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an intelligent canvas assistant for a collaborative drawing application. 
          Parse natural language commands and return a JSON object with the following structure:
          
          For CREATE operations:
          {
            "operation": "create",
            "type": "rectangle|circle|text",
            "color": "color name (red, blue, green, etc.)",
            "position": {
              "x": number,
              "y": number,
              "relative": "center|top-left|top-right|bottom-left|bottom-right|top|bottom|left|right"
            },
            "size": {
              "width": number,
              "height": number,
              "description": "small|medium|large"
            },
            "text": "text content if type is text",
            "confidence": 0.0-1.0
          }
          
          For MOVE operations:
          {
            "operation": "move",
            "target": {
              "type": "rectangle|circle|text",
              "color": "color name",
              "id": "shape id if known"
            },
            "position": {
              "x": number,
              "y": number,
              "relative": "center|top-left|top-right|bottom-left|bottom-right|top|bottom|left|right"
            },
            "confidence": 0.0-1.0
          }
          
          For DELETE operations:
          {
            "operation": "delete",
            "target": {
              "type": "rectangle|circle|text",
              "color": "color name",
              "id": "shape id if known"
            },
            "confidence": 0.0-1.0
          }
          
          For RESIZE operations:
          {
            "operation": "resize",
            "target": {
              "type": "rectangle|circle|text",
              "color": "color name",
              "id": "shape id if known"
            },
            "size": {
              "width": number,
              "height": number,
              "description": "small|medium|large"
            },
            "confidence": 0.0-1.0
          }
          
          Rules:
          - Identify the operation type: create, move, delete, resize
          - For existing shapes, identify by type and color
          - Support relative positions: "top right", "center", "bottom left", "left", "right", "up", "down"
          - Support size descriptions: "small", "medium", "large", "bigger", "smaller"
          - Support common color names: red, blue, green, yellow, orange, purple, pink, etc.
          - Return confidence score based on command clarity
          - If command is unclear, return error message`
        },
        {
          role: "user",
          content: command
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      console.log('🤖 OpenAI response:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return {
        error: 'Failed to parse command',
        confidence: 0
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      error: 'Failed to process command',
      confidence: 0
    };
  }
};

/**
 * Get suggestions for natural language commands
 * @returns {Array<string>} Array of example commands
 */
export const getCommandSuggestions = () => {
  return [
    "draw a red circle",
    "add a blue rectangle in the top right corner",
    "move the red circle to the left",
    "delete the blue rectangle",
    "make the green square bigger",
    "move the yellow circle to the center",
    "delete the purple rectangle",
    "create a small orange circle",
    "move the green square to the top right",
    "make the red circle smaller"
  ];
};
