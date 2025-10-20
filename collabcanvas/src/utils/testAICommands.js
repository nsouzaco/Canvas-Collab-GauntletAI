// Test utility for AI commands without requiring OpenAI API
// This can be used for development and testing

export const testCommands = [
  // CREATE operations
  {
    input: "draw a red circle",
    expected: {
      operation: "create",
      type: "circle",
      color: "red",
      position: { relative: "center" },
      size: { description: "medium" }
    }
  },
  {
    input: "add a blue rectangle in the top right corner",
    expected: {
      operation: "create",
      type: "rectangle", 
      color: "blue",
      position: { relative: "top-right" },
      size: { description: "medium" }
    }
  },
  {
    input: "create a green square in the center",
    expected: {
      operation: "create",
      type: "rectangle",
      color: "green", 
      position: { relative: "center" },
      size: { description: "medium" }
    }
  },
  {
    input: "make a small yellow circle",
    expected: {
      operation: "create",
      type: "circle",
      color: "yellow",
      position: { relative: "center" },
      size: { description: "small" }
    }
  },
  {
    input: "add some text that says 'Hello World'",
    expected: {
      operation: "create",
      type: "text",
      color: "black",
      position: { relative: "center" },
      size: { description: "medium" },
      text: "Hello World"
    }
  },
  {
    input: "create a note shape",
    expected: {
      operation: "create",
      type: "stickyNote",
      color: "yellow",
      position: { relative: "center" },
      size: { description: "medium" },
      text: "Remember to:\n\n• Add your notes here\n• Edit this text\n• Use bullet points"
    }
  },
  {
    input: "add a sticky note",
    expected: {
      operation: "create",
      type: "stickyNote",
      color: "yellow",
      position: { relative: "center" },
      size: { description: "medium" },
      text: "Remember to:\n\n• Add your notes here\n• Edit this text\n• Use bullet points"
    }
  },
  // MOVE operations
  {
    input: "move the red circle to the left",
    expected: {
      operation: "move",
      target: { type: "circle", color: "red" },
      position: { relative: "left" }
    }
  },
  {
    input: "move the blue rectangle to the top right",
    expected: {
      operation: "move",
      target: { type: "rectangle", color: "blue" },
      position: { relative: "top-right" }
    }
  },
  {
    input: "move the green square to the center",
    expected: {
      operation: "move",
      target: { type: "rectangle", color: "green" },
      position: { relative: "center" }
    }
  },
  // DELETE operations
  {
    input: "delete the red circle",
    expected: {
      operation: "delete",
      target: { type: "circle", color: "red" }
    }
  },
  {
    input: "remove the blue rectangle",
    expected: {
      operation: "delete",
      target: { type: "rectangle", color: "blue" }
    }
  },
  // RESIZE operations
  {
    input: "make the red circle bigger",
    expected: {
      operation: "resize",
      target: { type: "circle", color: "red" },
      size: { description: "large" }
    }
  },
  {
    input: "make the blue rectangle smaller",
    expected: {
      operation: "resize",
      target: { type: "rectangle", color: "blue" },
      size: { description: "small" }
    }
  }
];

// Mock OpenAI response for testing
export const mockOpenAIResponse = (command) => {
  const lowerCommand = command.toLowerCase();
  
  // Check for note/sticky note commands
  if (lowerCommand.includes('note') || lowerCommand.includes('sticky') || lowerCommand.includes('post-it')) {
    return {
      operation: "create",
      type: "stickyNote",
      color: "yellow",
      position: { relative: "center" },
      size: { description: "medium" },
      text: "Note",
      confidence: 0.9
    };
  }
  
  // Specific check for "create a note shape" command
  if (lowerCommand === 'create a note shape' || lowerCommand === 'create note shape') {
    return {
      operation: "create",
      type: "stickyNote",
      color: "yellow",
      position: { relative: "center" },
      size: { description: "medium" },
      text: "Note",
      confidence: 0.95
    };
  }

  // Check for semantic commands first
  if (lowerCommand.includes('persona') || lowerCommand.includes('user persona')) {
    return {
      operation: "semantic_create",
      semantic_type: "persona",
      type: "card",
      color: "white",
      position: { relative: "center" },
      size: { description: "medium" },
      confidence: 0.9
    };
  }
  
  if (lowerCommand.includes('features') || lowerCommand.includes('app features')) {
    return {
      operation: "semantic_create",
      semantic_type: "features",
      type: "card",
      color: "white",
      position: { relative: "center" },
      size: { description: "medium" },
      confidence: 0.9
    };
  }
  
  if (lowerCommand.includes('user story') || lowerCommand.includes('user stories')) {
    return {
      operation: "semantic_create",
      semantic_type: "user-story",
      type: "card",
      color: "white",
      position: { relative: "center" },
      size: { description: "medium" },
      confidence: 0.9
    };
  }
  
  if (lowerCommand.includes('pain points') || lowerCommand.includes('problems')) {
    return {
      operation: "semantic_create",
      semantic_type: "pain-points",
      type: "card",
      color: "white",
      position: { relative: "center" },
      size: { description: "medium" },
      confidence: 0.9
    };
  }
  
  if (lowerCommand.includes('competitive analysis') || lowerCommand.includes('competitors')) {
    return {
      operation: "semantic_create",
      semantic_type: "competitive-analysis",
      type: "card",
      color: "white",
      position: { relative: "center" },
      size: { description: "medium" },
      confidence: 0.9
    };
  }
  
  // Check for regular shape commands
  const testCommand = testCommands.find(cmd => 
    cmd.input.toLowerCase().includes(lowerCommand) ||
    lowerCommand.includes(cmd.input.toLowerCase())
  );
  
  if (testCommand) {
    return testCommand.expected;
  }
  
  // Default fallback
  return {
    operation: "create",
    type: "rectangle",
    color: "blue", 
    position: { relative: "center" },
    size: { description: "medium" },
    confidence: 0.8
  };
};
