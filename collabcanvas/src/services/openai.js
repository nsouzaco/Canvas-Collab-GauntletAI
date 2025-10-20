import OpenAI from 'openai';
import { mockOpenAIResponse } from '../utils/testAICommands';
import { 
  detectDomain, 
  getPersonaTemplates, 
  getFeatureTemplates, 
  getUserStoryTemplates, 
  getPainPointTemplates, 
  getCompetitiveAnalysisTemplates 
} from '../utils/aiContentGenerators';

// Initialize OpenAI client
const openai = import.meta.env.VITE_OPENAI_API_KEY ? new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
}) : null;

/**
 * Parse natural language command to extract shape creation parameters
 * @param {string} command - Natural language command (e.g., "draw a red circle")
 * @param {Array} conversationHistory - Previous conversation messages for context
 * @param {Object} canvasMetadata - Canvas name and description for context
 * @returns {Promise<Object>} Parsed command object with shape properties
 */
export const parseShapeCommand = async (command, conversationHistory = [], canvasMetadata = { name: '', description: '' }) => {
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

    // Build conversation context
    const canvasContext = canvasMetadata.name && canvasMetadata.description 
      ? `You are working on a canvas for "${canvasMetadata.name}": ${canvasMetadata.description}. `
      : 'You are working on a collaborative drawing canvas. ';
    
    const systemPrompt = `${canvasContext}You are an intelligent canvas assistant for a collaborative drawing application. 
          Parse natural language commands and return ONLY a valid JSON object with the following structure.
          
          IMPORTANT: Your response must be ONLY valid JSON. Do not include any explanatory text, comments, or conversational language. Just return the JSON object.
          
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
          
          For SEMANTIC CREATE operations (intelligent content generation):
          {
            "operation": "semantic_create",
            "semantic_type": "persona|features|user-story|pain-points|competitive-analysis",
            "type": "card",
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
          - Identify the operation type: create, move, delete, resize, semantic_create
          - For existing shapes, identify by type and color
          - Support relative positions: "top right", "center", "bottom left", "left", "right", "up", "down"
          - Support size descriptions: "small", "medium", "large", "bigger", "smaller"
          - Support common color names: red, blue, green, yellow, orange, purple, pink, etc.
          
          Shape Type Recognition:
          - "rectangle", "square", "box" → rectangle
          - "circle", "round" → circle
          - "text", "label" → text
          - "sticky note", "sticky", "post-it", "note", "note shape", "create a note", "create note" → stickyNote
          - "card", "info card", "information card" → card
          - "list", "checklist", "todo list", "task list" → list
          
          CRITICAL: When user says "note", "note shape", "create a note", "add a note", "sticky note", "post-it", or "sticky" - ALWAYS use type "stickyNote", NEVER "text"
          
          Common mistakes to avoid:
          - "create a note shape" → stickyNote (NOT text)
          - "add a note" → stickyNote (NOT text)  
          - "note" → stickyNote (NOT text)
          - "sticky note" → stickyNote (NOT text)
          
          Semantic Command Recognition (use semantic_create operation):
          - "persona", "user persona", "persona card", "create a persona" → semantic_type: "persona"
          - "features", "app features", "feature list", "what features" → semantic_type: "features"
          - "user story", "user stories", "create user story" → semantic_type: "user-story"
          - "pain points", "user pain points", "problems", "challenges" → semantic_type: "pain-points"
          - "competitive analysis", "competitors", "competition" → semantic_type: "competitive-analysis"
          
          For TEXT shapes: Use ONLY when user explicitly says "text" or "label". Look for:
            * "text Hello World", "label My Label"
            * "write Hello", "add text Welcome", "create text Meeting Notes"
            * Text in context: "rectangle with text Data", "circle saying Results"
            * Quoted text: "Hello World", 'Welcome', \`Code\`
            * Text in parentheses: "(Important Notice)"
            * Short inputs without shape keywords: "Hello" → treat as text content
            
          For STICKY NOTE shapes: Use when user says "note", "sticky", "post-it", etc.:
            * "note", "note shape", "create a note", "add a note"
            * "sticky note", "sticky", "post-it note"
            * "create a sticky note", "add a sticky note"
            * Default content: "Note"
            * If user provides specific content, use that instead
            * Support bullet points and multi-line text
          For CARD shapes: Extract title and content, use type "card"
          For LIST shapes: Extract title and items, use type "list"
          
          - Be smart about text extraction - understand user intent and extract meaningful content
          - Return confidence score based on command clarity
          - If command is unclear, return error message
          - Use the canvas context to generate relevant content for cards and lists
          - Remember previous commands and build upon them when appropriate
          
          Example responses:
          
          For "create a note shape":
          {
            "operation": "create",
            "type": "stickyNote",
            "color": "yellow",
            "position": {"relative": "center"},
            "size": {"description": "medium"},
            "text": "Note",
            "confidence": 0.9
          }
          
          For "add some text":
          {
            "operation": "create",
            "type": "text",
            "color": "black",
            "position": {"relative": "center"},
            "size": {"description": "medium"},
            "text": "Some text",
            "confidence": 0.8
          }`;

    // Build messages array with conversation history
    const messages = [
      {
        role: "system",
        content: systemPrompt
      },
      ...conversationHistory,
      {
        role: "user",
        content: command
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.1,
      max_tokens: 500
    });

    const content = response.choices[0].message.content;
    console.log('🤖 Raw OpenAI response:', content);
    
    try {
      const parsed = JSON.parse(content);
      console.log('🤖 Parsed OpenAI response:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw content that failed to parse:', content);
      
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('🤖 Extracted JSON from response:', extractedJson);
          return extractedJson;
        } catch (extractError) {
          console.error('Failed to parse extracted JSON:', extractError);
        }
      }
      
      // Fallback to mock response for common commands
      console.log('🤖 Falling back to mock response for command:', command);
      const mockResponse = mockOpenAIResponse(command);
      console.log('🤖 Mock response:', mockResponse);
      return mockResponse;
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
 * Generate startup name and description based on user's idea
 * @param {string} idea - User's startup idea description
 * @returns {Promise<Object>} Object with name and description
 */
export const generateStartupDetails = async (idea) => {
  try {
    // If no API key is provided, use mock responses for development
    if (!openai) {
      console.log('🤖 Using mock AI response for startup generation');
      const mockName = `Startup${Math.floor(Math.random() * 1000)}`;
      const mockDescription = `An innovative solution for ${idea.toLowerCase()}. We're building the future of this space with cutting-edge technology and user-centric design.`;
      return {
        name: mockName,
        description: mockDescription
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a creative startup naming and description expert. Based on a user's startup idea, generate:
          1. A catchy, memorable startup name (2-3 words max)
          2. A compelling 1-2 sentence description that explains what the startup does and why it matters
          
          Return your response as a JSON object with this exact structure:
          {
            "name": "Startup Name",
            "description": "Brief compelling description of what the startup does and why it matters."
          }
          
          Guidelines:
          - Make the name catchy, memorable, and relevant to the idea
          - Keep the description concise but compelling (1-2 sentences)
          - Focus on the value proposition and impact
          - Use modern, professional language
          - Avoid generic terms like "platform" or "solution" unless they add value`
        },
        {
          role: "user",
          content: `Generate a startup name and description for this idea: ${idea}`
        }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      console.log('🤖 OpenAI startup generation response:', parsed);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse OpenAI startup response:', parseError);
      // Fallback response
      return {
        name: `Startup${Math.floor(Math.random() * 1000)}`,
        description: `An innovative solution for ${idea.toLowerCase()}. We're building the future of this space with cutting-edge technology and user-centric design.`
      };
    }
  } catch (error) {
    console.error('OpenAI API error for startup generation:', error);
    // Fallback response
    return {
      name: `Startup${Math.floor(Math.random() * 1000)}`,
      description: `An innovative solution for ${idea.toLowerCase()}. We're building the future of this space with cutting-edge technology and user-centric design.`
    };
  }
};

/**
 * Generate persona card content based on canvas metadata
 * @param {Object} canvasMetadata - Canvas name and description
 * @returns {Promise<Object>} Persona card content
 */
export const generatePersonaCard = async (canvasMetadata) => {
  try {
    const domain = detectDomain(canvasMetadata);
    const templates = getPersonaTemplates(domain, canvasMetadata.name);
    const persona = templates[Math.floor(Math.random() * templates.length)];
    
    if (!openai) {
      console.log('🤖 Using mock persona generation');
      const items = persona.items.slice(0, 3);
      while (items.length < 3) {
        items.push(`Persona detail ${items.length + 1} for ${canvasMetadata.name}`);
      }
      
      return {
        title: persona.name,
        content: '',
        items: items
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a UX researcher creating user personas for "${canvasMetadata.name}": ${canvasMetadata.description}. 
          
          Generate a realistic user persona with:
          - Title: Person's name and age (e.g., "Mary Smith, 46")
          - Items: EXACTLY 3 bullet points describing their life situation, location, challenges, and needs
          
          Make it specific to the ${domain} domain and relevant to the app's purpose.
          Focus on realistic details that help understand the user's context and pain points.
          
          Return as JSON with title (name + age) and items array (exactly 3 bullet points).`
        },
        {
          role: "user",
          content: `Create a user persona for this ${domain} app: ${canvasMetadata.name} - ${canvasMetadata.description}`
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      const items = Array.isArray(parsed.items) ? parsed.items : persona.items;
      // Ensure we have exactly 3 items
      const finalItems = items.slice(0, 3);
      while (finalItems.length < 3) {
        finalItems.push(`Persona detail ${finalItems.length + 1} for ${canvasMetadata.name}`);
      }
      
      return {
        title: parsed.title || persona.name,
        content: parsed.content || '',
        items: finalItems
      };
    } catch (parseError) {
      // Fallback to template-based generation
      const items = persona.items.slice(0, 3);
      while (items.length < 3) {
        items.push(`Persona detail ${items.length + 1} for ${canvasMetadata.name}`);
      }
      
      return {
        title: persona.name,
        content: '',
        items: items
      };
    }
  } catch (error) {
    console.error('Error generating persona card:', error);
    const domain = detectDomain(canvasMetadata);
    const templates = getPersonaTemplates(domain, canvasMetadata.name);
    const persona = templates[0];
    const items = persona.items.slice(0, 3);
    while (items.length < 3) {
      items.push(`Persona detail ${items.length + 1} for ${canvasMetadata.name}`);
    }
    
    return {
      title: persona.name,
      content: '',
      items: items
    };
  }
};

/**
 * Generate feature card content based on canvas metadata
 * @param {Object} canvasMetadata - Canvas name and description
 * @returns {Promise<Object>} Feature card content
 */
export const generateFeatureCard = async (canvasMetadata) => {
  try {
    const domain = detectDomain(canvasMetadata);
    const templates = getFeatureTemplates(domain, canvasMetadata.name);
    
    if (!openai) {
      console.log('🤖 Using mock feature generation');
      return {
        title: `${canvasMetadata.name} Features`,
        content: `Key features for this ${domain} application:`,
        items: templates.slice(0, 6)
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a product manager defining features for "${canvasMetadata.name}": ${canvasMetadata.description}. 
          
          Generate a list of 6-8 key features that would be essential for this ${domain} application.
          Focus on features that solve real user problems and provide value.
          Return as JSON with title, content, and items array.`
        },
        {
          role: "user",
          content: `What features should ${canvasMetadata.name} have? This is a ${domain} app: ${canvasMetadata.description}`
        }
      ],
      temperature: 0.6,
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      // Fallback to template-based generation
      return {
        title: `${canvasMetadata.name} Features`,
        content: `Key features for this ${domain} application:`,
        items: templates.slice(0, 6)
      };
    }
  } catch (error) {
    console.error('Error generating feature card:', error);
    const domain = detectDomain(canvasMetadata);
    const templates = getFeatureTemplates(domain, canvasMetadata.name);
    return {
      title: `${canvasMetadata.name} Features`,
      content: `Key features for this ${domain} application:`,
      items: templates.slice(0, 6)
    };
  }
};

/**
 * Generate user story card content based on canvas metadata
 * @param {Object} canvasMetadata - Canvas name and description
 * @returns {Promise<Object>} User story card content
 */
export const generateUserStoryCard = async (canvasMetadata) => {
  try {
    const domain = detectDomain(canvasMetadata);
    const templates = getUserStoryTemplates(domain, canvasMetadata.name);
    
    if (!openai) {
      console.log('🤖 Using mock user story generation');
      return {
        title: `User Stories for ${canvasMetadata.name}`,
        content: `As a user of ${canvasMetadata.name}, I want to:`,
        items: templates.slice(0, 4)
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a product owner writing user stories for "${canvasMetadata.name}": ${canvasMetadata.description}. 
          
          Generate 4-6 user stories in the format "As a [user type], I want to [goal] so that [benefit]".
          Make them specific to the ${domain} domain and relevant to the app's purpose.
          Return as JSON with title, content, and items array.`
        },
        {
          role: "user",
          content: `Create user stories for this ${domain} app: ${canvasMetadata.name} - ${canvasMetadata.description}`
        }
      ],
      temperature: 0.6,
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      // Fallback to template-based generation
      return {
        title: `User Stories for ${canvasMetadata.name}`,
        content: `As a user of ${canvasMetadata.name}, I want to:`,
        items: templates.slice(0, 4)
      };
    }
  } catch (error) {
    console.error('Error generating user story card:', error);
    const domain = detectDomain(canvasMetadata);
    const templates = getUserStoryTemplates(domain, canvasMetadata.name);
    return {
      title: `User Stories for ${canvasMetadata.name}`,
      content: `As a user of ${canvasMetadata.name}, I want to:`,
      items: templates.slice(0, 4)
    };
  }
};

/**
 * Generate pain points card content based on canvas metadata
 * @param {Object} canvasMetadata - Canvas name and description
 * @returns {Promise<Object>} Pain points card content
 */
export const generatePainPointsCard = async (canvasMetadata) => {
  try {
    const domain = detectDomain(canvasMetadata);
    const templates = getPainPointTemplates(domain, canvasMetadata.name);
    
    if (!openai) {
      console.log('🤖 Using mock pain points generation');
      return {
        title: `User Pain Points for ${canvasMetadata.name}`,
        content: `Common challenges users face in the ${domain} space:`,
        items: templates.slice(0, 5)
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a UX researcher identifying pain points for "${canvasMetadata.name}": ${canvasMetadata.description}. 
          
          Generate 5-6 common pain points that users in the ${domain} space typically face.
          Focus on problems that your app could potentially solve.
          Return as JSON with title, content, and items array.`
        },
        {
          role: "user",
          content: `What pain points do users have in the ${domain} space that ${canvasMetadata.name} could address?`
        }
      ],
      temperature: 0.6,
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      // Fallback to template-based generation
      return {
        title: `User Pain Points for ${canvasMetadata.name}`,
        content: `Common challenges users face in the ${domain} space:`,
        items: templates.slice(0, 5)
      };
    }
  } catch (error) {
    console.error('Error generating pain points card:', error);
    const domain = detectDomain(canvasMetadata);
    const templates = getPainPointTemplates(domain, canvasMetadata.name);
    return {
      title: `User Pain Points for ${canvasMetadata.name}`,
      content: `Common challenges users face in the ${domain} space:`,
      items: templates.slice(0, 5)
    };
  }
};

/**
 * Generate competitive analysis card content based on canvas metadata
 * @param {Object} canvasMetadata - Canvas name and description
 * @returns {Promise<Object>} Competitive analysis card content
 */
export const generateCompetitiveAnalysisCard = async (canvasMetadata) => {
  try {
    const domain = detectDomain(canvasMetadata);
    const templates = getCompetitiveAnalysisTemplates(domain, canvasMetadata.name);
    
    if (!openai) {
      console.log('🤖 Using mock competitive analysis generation');
      return {
        title: `Competitive Analysis for ${canvasMetadata.name}`,
        content: `Key competitors in the ${domain} space:`,
        items: templates.slice(0, 5)
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a business analyst conducting competitive analysis for "${canvasMetadata.name}": ${canvasMetadata.description}. 
          
          Identify 5-6 key competitors in the ${domain} space and briefly describe their strengths.
          Focus on direct competitors and market leaders.
          Return as JSON with title, content, and items array.`
        },
        {
          role: "user",
          content: `Who are the main competitors for ${canvasMetadata.name} in the ${domain} space?`
        }
      ],
      temperature: 0.6,
      max_tokens: 300
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      return parsed;
    } catch (parseError) {
      // Fallback to template-based generation
      return {
        title: `Competitive Analysis for ${canvasMetadata.name}`,
        content: `Key competitors in the ${domain} space:`,
        items: templates.slice(0, 5)
      };
    }
  } catch (error) {
    console.error('Error generating competitive analysis card:', error);
    const domain = detectDomain(canvasMetadata);
    const templates = getCompetitiveAnalysisTemplates(domain, canvasMetadata.name);
    return {
      title: `Competitive Analysis for ${canvasMetadata.name}`,
      content: `Key competitors in the ${domain} space:`,
      items: templates.slice(0, 5)
    };
  }
};

/**
 * Get suggestions for natural language commands
 * @returns {Array<string>} Array of example commands
 */
export const getCommandSuggestions = () => {
  return [
    "Create a persona card for this app",
    "Add app features to the canvas",
    "Generate a user story",
    "Create a competitive analysis",
    "Add user pain points",
    "create a note shape",
    "add a sticky note",
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
