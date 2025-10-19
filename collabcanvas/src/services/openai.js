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
            "type": "rectangle|circle|text|stickyNote|card|list",
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
            "text": "extracted text content - be smart about extracting meaningful text from user input",
            "confidence": 0.0-1.0
          }
          
          For MOVE operations:
          {
            "operation": "move",
            "target": {
              "type": "rectangle|circle|text|stickyNote|card|list",
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
              "type": "rectangle|circle|text|stickyNote|card|list",
              "color": "color name",
              "id": "shape id if known"
            },
            "confidence": 0.0-1.0
          }
          
          For RESIZE operations:
          {
            "operation": "resize",
            "target": {
              "type": "rectangle|circle|text|stickyNote|card|list",
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
          
          Shape Type Recognition:
          - "rectangle", "square", "box" → rectangle
          - "circle", "round" → circle
          - "text", "label", "note" → text
          - "sticky note", "sticky", "post-it", "note" → stickyNote
          - "card", "info card", "information card" → card
          - "list", "checklist", "todo list", "task list" → list
          
          For TEXT shapes: Intelligently extract text content from user input. Look for:
            * Quoted text: "Hello World", 'Welcome', \`Code\`
            * Text after keywords: "write Hello", "add text Welcome", "create text Meeting Notes"
            * Text in context: "rectangle with text Data", "circle saying Results"
            * Simple text: "text Hello World", "label My Label"
            * Text in parentheses: "(Important Notice)"
            * Short inputs without shape keywords: "Hello" → treat as text content
          
          For STICKY NOTE shapes: Extract note content and use type "stickyNote"
          For CARD shapes: Extract title and content, use type "card"
          For LIST shapes: Extract title and items, use type "list"
          
          - Be smart about text extraction - understand user intent and extract meaningful content
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
    "create a sticky note with my shopping list",
    "add a todo list for project tasks",
    "create a card with meeting notes",
    "move the red circle to the left",
    "delete the blue rectangle",
    "make the green square bigger",
    "move the yellow circle to the center",
    "delete the purple rectangle",
    "create a small orange circle",
    "add a checklist for today",
    "create a sticky note with reminders",
    "move the green square to the top right",
    "make the red circle smaller"
  ];
};
