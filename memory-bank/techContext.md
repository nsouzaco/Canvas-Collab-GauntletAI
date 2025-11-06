# Technical Context

## Tech Stack Overview

### Frontend Framework
**React 18.3.1**
- Hooks-based architecture (no class components)
- Concurrent features enabled
- StrictMode for development

**Build Tool: Vite 6.0.1**
- Fast HMR (Hot Module Replacement)
- ES modules based
- Optimized production builds
- Environment variable support (`import.meta.env`)

### Canvas Rendering
**Konva 10.0.2 + React-Konva 18.2.14**
- WebGL-accelerated canvas rendering
- Shape primitives: Rect, Circle, Text, Group, Transformer
- Layer-based organization (Grid Layer, Shapes Layer, Cursors Layer)
- Event system for mouse interactions
- Built-in transformers for resize/rotate

**Why Konva?**
- Better performance than DOM manipulation for many shapes
- Native drag-and-drop support
- Easy coordinate transformations (zoom/pan)
- Export to image/data URL

### Styling
**Tailwind CSS 3.4.0**
- Utility-first CSS framework
- Custom configuration for project-specific values
- PostCSS 8.5.6 for processing
- Responsive design utilities

### Routing
**React Router DOM 7.9.4**
- Client-side routing
- Routes:
  - `/` → Dashboard (redirects to `/dashboard`)
  - `/dashboard` → Canvas list
  - `/canvas/:canvasId` → Canvas workspace

### Icons
**Lucide React 0.546.0**
- Modern icon library
- Tree-shakeable
- Consistent 24x24 default sizing

## Backend Services

### Firebase 12.4.0

**Authentication Module**
- Email/password authentication
- Google OAuth 2.0 integration
- Session management
- User profile updates

**Firestore (NoSQL Document Database)**
- **Collection**: `canvases`
- **Document Structure**:
```javascript
{
  id: string,
  name: string,
  description: string,
  createdBy: string (uid),
  createdAt: Timestamp,
  isPublic: boolean,
  shapes: Array<Shape>,
  lastUpdated: Timestamp
}
```

**Shape Document Structure**:
```javascript
{
  id: string,
  type: 'rectangle' | 'circle' | 'text' | 'stickyNote' | 'card' | 'list',
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string (hex color),
  stroke: string,
  strokeWidth: number,
  
  // Text-specific fields
  text?: string,
  fontSize?: number,
  textType?: 'normal' | 'title' | 'subtitle' | 'heading1' | 'heading2' | 'heading3',
  fontFamily?: string,
  
  // Card/List-specific fields
  title?: string,
  content?: string,
  items?: string[],
  
  // Metadata
  createdBy: string,
  createdAt: Date,
  lastModifiedBy: string,
  lastModifiedAt: Date,
  
  // Collaboration
  isLocked: boolean,
  lockedBy: string | null,
  isSelected: boolean,
  selectedBy: string | null
}
```

**Firestore Operations:**
- `arrayUnion` for atomic shape additions
- `serverTimestamp()` for consistent timestamps
- Real-time listeners via `onSnapshot`
- Batch updates for multi-shape operations

**Firebase Realtime Database (RTDB)**
- **Path**: `sessions/{canvasId}/{userId}`
- **Purpose**: High-frequency cursor position updates
- **Structure**:
```javascript
{
  displayName: string,
  cursorColor: string,
  cursorX: number,
  cursorY: number,
  lastSeen: number (timestamp)
}
```

- **Path**: `positions/{canvasId}/{shapeId}`
- **Purpose**: Real-time shape position during drag
- **Structure**:
```javascript
{
  x: number,
  y: number,
  updatedBy: string,
  timestamp: number
}
```

**Why Both Databases?**
- Firestore: Persistent data, complex queries, transactions
- RTDB: Low-latency updates, simple key-value, auto-cleanup on disconnect

### AI Integration

**OpenAI API 6.4.0**
- Model: `gpt-3.5-turbo`
- Temperature: 0.1 (deterministic) for commands, 0.6-0.8 for content
- Max tokens: 200-500 depending on operation
- Client-side API calls (dangerouslyAllowBrowser: true)

**Current AI Service Architecture:**
```
User Command
     ↓
AIChatInput.jsx
     ↓
parseShapeCommand() [services/openai.js]
     ↓
processAIOperation() [utils/aiOperationHandler.js]
     ↓
Shape Operations (create/move/delete/resize)
```

**AI Operations:**
1. **Command Parsing**: Natural language → JSON structure
2. **Context Injection**: Canvas metadata, conversation history
3. **Content Generation**: Personas, features, user stories, etc.
4. **Validation**: Command structure and confidence checks

## Architecture Patterns

### Context Providers

**AuthContext** (`contexts/AuthContext.jsx`)
- Manages: User authentication state
- Provides: `currentUser`, `loading`
- Wraps: Entire app
- Firebase: `onAuthStateChanged` listener

**CanvasContext** (`contexts/CanvasContext.jsx`)
- Manages: Canvas state, shapes, operations, AI
- Provides: 50+ functions and state variables
- Wraps: Individual canvas views
- Dependencies: AuthContext, useCanvas hook

**Context Architecture:**
```
App (AuthProvider)
 └─ Router
     ├─ Dashboard
     └─ Canvas (CanvasProvider)
         └─ Canvas Components
```

### Custom Hooks

**useCanvas** (`hooks/useCanvas.js`)
- Purpose: Firebase integration for shapes
- Operations: CRUD for shapes, locking, selection
- Real-time: Firestore subscription, RTDB position updates
- Caching: LocalStorage persistence
- Returns: shapes, loading, operations, positions

**usePresence** (`hooks/usePresence.js`)
- Purpose: User presence and cursor tracking
- Operations: Set online/offline, update cursor position
- Real-time: RTDB subscription
- Heartbeat: 30-second presence refresh
- Cleanup: Automatic on disconnect/unmount

**useCursors** (`hooks/useCursors.js`)
- Purpose: Broadcast cursor movements
- Throttling: Updates cursor position in RTDB
- Coordinate: Transforms stage coordinates

**useOptimizedPositioning** (`hooks/useOptimizedPositioning.js`)
- Purpose: Throttled position updates during drag
- Batching: Groups rapid position changes
- Cleanup: Clears positions on drag end

### Component Architecture

**Page Components:**
- `LandingPage`: Marketing/intro
- `Login`: Email/password auth
- `Signup`: Account creation
- `CanvasDashboard`: Canvas list and management

**Canvas Components:**
- `Canvas`: Main canvas renderer (Stage/Layer)
- `Shape`: Individual shape renderer with transformers
- `ShapeToolbar`: Shape creation buttons
- `CanvasControls`: Undo/redo buttons
- `ZoomControls`: Zoom in/out buttons
- `ExportControls`: PNG/JSON export
- `PropertiesPanel`: Edit complex shapes (cards, lists)

**Layout Components:**
- `Navbar`: Top navigation with canvas name
- `ConnectionStatus`: Online/offline indicator
- `Toast`: Notification system

**Shape Components:**
- `Text`: Multi-line text with font styling
- `StickyNote`: Yellow note with pre-formatted text
- `List`: Checklist with title and items

**Collaboration Components:**
- `Cursor`: Other users' cursor display
- `PresenceList`: Online users list
- `CursorDebug`: Debug cursor positions

**AI Components:**
- `AIChatInput`: Natural language input with suggestions

**Debug Components:**
- `PerformanceDashboard`: FPS, memory, render counts

### Service Layer

**auth.js**
- Firebase Auth wrapper
- Functions: signUp, signIn, signInWithGoogle, signOutUser
- Display name extraction logic

**canvas.js**
- Firestore/RTDB operations
- Functions: 
  - Canvas: createCanvas, getCanvas, getAllCanvases, deleteCanvas
  - Shapes: createShape, updateShape, deleteShape
  - Locking: lockShape, unlockShape
  - Selection: updateShapeSelection, clearUserSelections
  - Real-time: updateShapePosition, clearShapePosition, subscribeToAllPositions

**firebase.js**
- Firebase initialization
- Exports: auth, db (Firestore), rtdb (Realtime Database)

**openai.js**
- OpenAI API integration
- Functions:
  - parseShapeCommand: NLP → JSON
  - generateStartupDetails: Idea → Name/Description
  - generatePersonaCard, generateFeatureCard, etc.
  - getCommandSuggestions: Autocomplete suggestions

**presence.js**
- Presence management
- Functions:
  - setUserOnline, setUserOffline
  - updateCursorPosition
  - subscribeToPresence
  - refreshUserPresence (heartbeat)

### Utility Layer

**aiOperationHandler.js**
- AI command processing logic
- Functions:
  - processAIOperation: Route commands to handlers
  - handleCreateOperation, handleMoveOperation, etc.
  - findTargetShape: Identify shapes by type/color
  - generateContextAwareContent: LLM content generation

**aiContentGenerators.js**
- Template-based content generation
- Domain detection (healthcare, fintech, ecommerce, etc.)
- Fallback templates when LLM unavailable

**historyManager.js**
- Undo/redo state management
- Per-shape, per-user operation tracking
- Snapshot creation and restoration

**persistence.js**
- LocalStorage wrapper classes
- CanvasPersistence: Canvas state cache
- PresencePersistence: User presence cache
- AIAssistantPersistence: AI state cache
- OfflineQueue: Failed operation queue

**performanceMonitor.js**
- FPS tracking
- Memory usage
- Render count monitoring
- Performance metrics collection

**positionInterpolation.js**
- Local smooth positioning
- Interpolation between position updates

**remotePositionInterpolation.js**
- Remote user position smoothing
- Cache-based interpolation
- Automatic cleanup of stale positions

**snapUtils.js**
- Grid snapping calculations
- Position alignment to 20px grid

**exportUtils.js**
- PNG export (canvas → image)
- JSON export (shapes → file)
- Grid visibility control

**constants.js**
- Canvas dimensions
- Zoom limits (MIN_ZOOM: 0.1, MAX_ZOOM: 5)
- Grid size (20px)
- Responsive dimension calculations

## Data Flow

### Shape Creation Flow
```
User clicks toolbar
     ↓
addShape(type, position)
     ↓
useCanvas.addShape()
     ↓
createShape() [canvas.js]
     ↓
Firestore arrayUnion
     ↓
onSnapshot listener fires
     ↓
All users' state updates
```

### AI Shape Creation Flow
```
User types command
     ↓
AIChatInput submits
     ↓
parseShapeCommand() [OpenAI]
     ↓
processAIOperation()
     ↓
operations.createShape()
     ↓
Same as manual flow
```

### Shape Movement Flow
```
User drags shape
     ↓
onDragStart → lockShape
     ↓
onDragMove → updateDragPosition (throttled)
     ↓
updateShapePosition() [RTDB]
     ↓
Other users see yellow border
     ↓
onDragEnd → updateShape (Firestore)
     ↓
clearShapePosition() [RTDB]
     ↓
Yellow border removed
```

### Presence Flow
```
User joins canvas
     ↓
setUserOnline() [RTDB]
     ↓
onDisconnect().remove() registered
     ↓
Mouse moves
     ↓
updateCursorPosition() [RTDB]
     ↓
subscribeToPresence fires
     ↓
Cursor components render
```

## Performance Characteristics

### Current Performance
- **Shape Limit**: 100+ shapes at 60 FPS (tested)
- **Sync Latency**: <100ms for shape operations
- **Cursor Latency**: <50ms for cursor updates
- **Bundle Size**: ~2.5MB (uncompressed), ~600KB (gzipped)
- **Initial Load**: ~2-3 seconds on fast connection

### Optimization Techniques Used
1. **Position Interpolation**: Smooth remote movements
2. **Throttled Updates**: 16ms (60 FPS) for RTDB writes
3. **React Memo**: Shape component memoization
4. **UseCallback**: Stable function references
5. **LocalStorage Caching**: Reduce cold start time
6. **Batch Updates**: Group Firebase operations
7. **Optimized Selectors**: Minimize re-renders

### Performance Bottlenecks
1. Large text shapes recalculation
2. Too many Firestore reads on canvas load
3. Re-renders in CanvasContext consumers
4. Position updates during multi-select drag
5. AI requests blocking UI (no loading states)

## Development Workflow

### Environment Setup
```bash
npm install
npm run dev  # Vite dev server on port 5173
```

### Environment Variables
Create `.env` file:
```
VITE_FIREBASE_API_KEY=your_key
VITE_OPENAI_API_KEY=your_key
```

### Build
```bash
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

### Deployment
- Deployed on Vercel
- Automatic deployments from main branch
- Environment variables configured in Vercel dashboard

## Security Configuration

### Firebase Security Rules

**Firestore Rules** (`firestore.rules`):
- Authenticated users can read all canvases
- Authenticated users can create/update canvases
- Users can only delete canvases they created

**Realtime Database Rules** (`database.rules.json`):
- Authenticated users can read/write to sessions
- Authenticated users can read/write to positions

**Current Limitations:**
- No rate limiting
- No input validation in rules
- OpenAI API key exposed client-side

## Target Architecture (Post-Refactoring)

### LangChain Integration

**New Service Structure:**
```
services/
  ├── ai/
  │   ├── agent.ts                 # Main LangChain agent
  │   ├── tools/
  │   │   ├── shapeTools.ts        # Shape operation tools
  │   │   ├── canvasTools.ts       # Canvas operation tools
  │   │   └── searchTools.ts       # Pinecone search tools
  │   ├── prompts.ts               # Agent prompts
  │   └── index.ts                 # Public API
  └── pinecone/
      ├── client.ts                # Pinecone initialization
      ├── embeddings.ts            # Generate embeddings
      ├── canvasIndex.ts           # Canvas context storage
      ├── shapeIndex.ts            # Shape embeddings
      └── conversationIndex.ts     # Chat history
```

**LangChain Agent Pattern:**
```typescript
import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

const model = new ChatOpenAI({ temperature: 0.1 });
const tools = [createShapeTool, moveShapeTool, searchTool];

const executor = await initializeAgentExecutorWithOptions(
  tools,
  model,
  {
    agentType: 'openai-functions',
    verbose: true,
  }
);

const result = await executor.call({
  input: userCommand,
  context: canvasContext
});
```

### Pinecone Schema

**Canvas Index:**
```typescript
{
  id: string,           // canvas ID
  vector: number[],     // embedding of name + description
  metadata: {
    name: string,
    description: string,
    createdBy: string,
    createdAt: number,
    shapeCount: number
  }
}
```

**Shape Index:**
```typescript
{
  id: string,           // shape ID
  vector: number[],     // embedding of text content
  metadata: {
    canvasId: string,
    type: string,
    text: string,
    title: string,
    x: number,
    y: number
  }
}
```

**Conversation Index:**
```typescript
{
  id: string,           // conversation turn ID
  vector: number[],     // embedding of user message
  metadata: {
    userId: string,
    canvasId: string,
    userMessage: string,
    aiResponse: string,
    timestamp: number
  }
}
```

### TypeScript Migration Plan

**Priority 1: Service Layer**
- `services/auth.js` → `auth.ts`
- `services/canvas.js` → `canvas.ts`
- `services/firebase.js` → `firebase.ts`

**Priority 2: AI Layer**
- Create new `services/ai/*.ts` with types
- Migrate `aiOperationHandler.js` → `aiOperationHandler.ts`

**Priority 3: Contexts**
- `contexts/AuthContext.jsx` → `AuthContext.tsx`
- `contexts/CanvasContext.jsx` → `CanvasContext.tsx`

**Priority 4: Hooks**
- All hooks to TypeScript with proper types

**Priority 5: Components**
- Start with leaf components (Shape, Cursor, etc.)
- Move up to containers (Canvas, Dashboard)

## Dependencies Deep Dive

### Core Dependencies

**react & react-dom**: UI framework
**react-router-dom**: Client-side routing
**konva & react-konva**: Canvas rendering engine
**firebase**: Backend services (Auth, Firestore, RTDB)
**openai**: AI integration (to be replaced by LangChain)
**uuid**: Unique ID generation
**lucide-react**: Icon library

### Planned New Dependencies

**@langchain/openai**: LangChain OpenAI integration (for agents)
**@langchain/core**: Core LangChain abstractions (tools, chains)
**@pinecone-database/pinecone**: Vector database client
**langchain**: Main LangChain library (agents, memory)
**zod**: Runtime type validation
**typescript**: Static typing (already in devDependencies)

### Dev Dependencies

**vite**: Build tool and dev server
**@vitejs/plugin-react**: React plugin for Vite
**tailwindcss**: CSS framework
**postcss**: CSS processing
**autoprefixer**: CSS vendor prefixes
**typescript**: Type checking
**eslint**: Code linting

## Build Configuration

### Vite Config (`vite.config.ts`)
```typescript
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth']
  }
});
```

### Tailwind Config (`tailwind.config.js`)
- Custom color palette
- Extended spacing
- Custom font families

### TypeScript Config
- `tsconfig.json`: Base configuration
- `tsconfig.app.json`: App-specific
- `tsconfig.node.json`: Node-specific (Vite)

## Known Technical Limitations

1. **Client-side OpenAI calls**: API key exposed, no rate limiting
2. **Firestore cost**: Reads charged per document, can get expensive
3. **RTDB scaling**: Limited to ~100k concurrent connections
4. **Konva performance**: Slows down with 500+ shapes
5. **No offline editing**: Only queues failed operations
6. **Browser compatibility**: Modern browsers only (ES modules)
7. **Mobile support**: Not optimized for touch/mobile viewport

## Testing Strategy (Planned)

### Unit Tests
- Utility functions (snapUtils, exportUtils, etc.)
- Service layer functions
- Hook logic

### Integration Tests
- Firebase operations
- AI command processing
- Context provider behavior

### E2E Tests
- Multi-user collaboration scenarios
- Shape creation/editing
- Export functionality

### Performance Tests
- Shape count scaling
- Concurrent user limits
- Memory leak detection

## Monitoring (Planned)

### Performance Monitoring
- Core Web Vitals (LCP, FID, CLS)
- Custom metrics (shape count, sync latency)
- Error tracking
- User sessions

### AI Monitoring
- Command success rate
- Response time distribution
- Token usage
- Error patterns

## Conclusion

The current technical architecture is solid for an MVP but has room for improvement in terms of AI capabilities, type safety, and performance optimization. The migration to LangGraph and Pinecone, combined with TypeScript adoption and architectural improvements, will create a more robust and scalable system.

