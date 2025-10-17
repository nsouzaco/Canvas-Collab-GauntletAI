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
  const testCommand = testCommands.find(cmd => 
    cmd.input.toLowerCase().includes(command.toLowerCase()) ||
    command.toLowerCase().includes(cmd.input.toLowerCase())
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
