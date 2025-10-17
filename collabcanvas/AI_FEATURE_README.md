# AI-Powered Shape Creation Feature

This feature adds natural language processing capabilities to the collaborative canvas, allowing users to create shapes using natural language commands.

## Features

- **Natural Language Commands**: Users can type commands like "draw a red circle" or "add a blue rectangle in the top right corner"
- **Smart Position Detection**: Supports relative positions like "top right", "center", "bottom left"
- **Color Recognition**: Understands common color names (red, blue, green, yellow, etc.)
- **Size Variations**: Supports size descriptions like "small", "medium", "large"
- **Text Creation**: Can create text shapes with custom content
- **Real-time Processing**: Uses OpenAI API for intelligent command parsing
- **Development Mode**: Works without API key using mock responses for testing

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `collabcanvas` directory with your OpenAI API key:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### 2. OpenAI API Key Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### 3. Development Mode

If you don't have an OpenAI API key, the feature will work in development mode using mock responses. This allows you to test the UI and basic functionality.

## Usage

### Opening the AI Assistant

1. Click the blue chat icon in the bottom-right corner of the canvas
2. The AI Assistant panel will appear

### Supported Commands

#### Basic Shape Creation
- "draw a red circle"
- "add a blue rectangle"
- "create a green square"

#### Position-Specific Commands
- "draw a red circle in the top right corner"
- "add a blue rectangle in the center"
- "create a green square in the bottom left"

#### Size-Specific Commands
- "draw a small red circle"
- "add a large blue rectangle"
- "create a medium green square"

#### Text Creation
- "add some text that says 'Hello World'"
- "create a text box with 'Welcome'"
- "add text 'Meeting Notes' in the center"

#### Color Variations
Supported colors: red, blue, green, yellow, orange, purple, pink, gray, black, white, brown, cyan, magenta, lime, indigo, teal, violet, fuchsia, sky, emerald, rose, slate, zinc, neutral, stone, amber, and more.

## Technical Implementation

### Components

- **AIChatInput**: Main UI component for the chat interface
- **OpenAI Service**: Handles API communication and command parsing
- **Shape Command Handler**: Processes parsed commands and creates shapes
- **Canvas Integration**: Seamlessly integrates with existing canvas functionality

### File Structure

```
src/
├── components/
│   └── AI/
│       └── AIChatInput.jsx          # Main chat interface
├── services/
│   └── openai.js                   # OpenAI API integration
├── utils/
│   ├── shapeCommandHandler.js      # Command processing logic
│   └── testAICommands.js           # Mock responses for development
└── contexts/
    └── CanvasContext.jsx          # Updated with AI shape creation
```

### Key Functions

- `parseShapeCommand(command)`: Parses natural language into structured data
- `processShapeCommand(parsedCommand)`: Converts parsed data to shape properties
- `createShapeFromAI(parsedCommand)`: Creates shapes from AI commands
- `validateShapeCommand(parsedCommand)`: Validates command structure

## Error Handling

The feature includes comprehensive error handling:

- **Invalid Commands**: Clear error messages for unrecognized commands
- **Low Confidence**: Warnings when AI confidence is low
- **API Errors**: Graceful fallback when OpenAI API is unavailable
- **Validation**: Input validation for all command parameters

## Development Notes

### Testing Without API Key

The feature includes mock responses for development testing. When no API key is provided, it will use predefined responses for common commands.

### Performance Considerations

- API calls are made only when user submits a command
- Responses are cached to avoid duplicate API calls
- Loading states provide user feedback during processing

### Security Notes

- API key is stored in environment variables
- In production, consider moving API calls to a backend service
- Current implementation uses `dangerouslyAllowBrowser: true` for development

## Future Enhancements

- **Voice Commands**: Add speech-to-text capabilities
- **Command History**: Remember and suggest previous commands
- **Batch Operations**: Support multiple shape creation in one command
- **Advanced Positioning**: More precise position calculations
- **Custom Colors**: Support for hex color codes and color picker
- **Shape Modifications**: Edit existing shapes through natural language

## Troubleshooting

### Common Issues

1. **"Failed to process command"**: Check your OpenAI API key
2. **Shapes not appearing**: Verify canvas context is properly initialized
3. **Position issues**: Check that relative positions are supported

### Debug Mode

Enable console logging to see detailed command processing:
- Open browser developer tools
- Look for messages starting with "🤖" for AI processing
- Check for error messages in the console

## Contributing

When adding new features:

1. Update the command parsing logic in `openai.js`
2. Add new shape types to `shapeCommandHandler.js`
3. Update the UI in `AIChatInput.jsx`
4. Add tests to `testAICommands.js`
5. Update this README with new capabilities
