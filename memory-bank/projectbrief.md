# CanvasCollab - Project Brief

## Project Overview

**Name**: CanvasCollab (Startup Collab)  
**Type**: Real-time collaborative canvas application with AI-powered content generation  
**Status**: Production-ready MVP with advanced features implemented  
**Branch**: `refactor/optimization-pinecone-langraph` (refactoring branch)

## Vision

Build a collaborative whiteboard application that combines real-time multiplayer features with intelligent AI assistance to help teams brainstorm, design, and develop startup ideas together.

## Current State Assessment

### What Started as MVP
The project began as a basic collaborative canvas with:
- Single global canvas for all users
- Rectangle shapes only
- Basic real-time sync
- Simple authentication

### What It Became
The application has evolved significantly beyond the original MVP:
- **Multi-canvas architecture** with dashboard and canvas management
- **7 shape types**: Rectangle, Circle, Text, Sticky Note, Card, List, with rich styling
- **Advanced AI features** using OpenAI for natural language shape creation
- **Real-time collaboration** with cursor tracking, presence awareness, and shape locking
- **Performance optimizations** including position interpolation and caching
- **Comprehensive editing** with undo/redo, copy/paste, keyboard shortcuts
- **Export functionality** for PNG/JSON with grid toggle
- **Complex shape types** with multi-line text, bullet lists, and card layouts

## Implemented Features Inventory

### 1. Authentication System ✅
- Email/password authentication (Firebase Auth)
- Google OAuth integration
- Persistent sessions
- User display names with truncation logic
- Automatic sign-out functionality

### 2. Canvas Management ✅
- Dashboard with canvas grid view
- Create new canvases with name and description
- Delete canvases (creator only)
- Canvas metadata storage (name, description, creator, timestamp)
- Multiple concurrent canvases per user
- Canvas navigation and routing

### 3. Canvas Workspace ✅
- Large responsive canvas (1200x1000+ based on viewport)
- Smooth pan functionality (drag stage)
- Zoom with mousewheel (0.1x to 5x range)
- Optional grid overlay (20px grid size)
- Canvas boundary indicators
- Export-ready grid visibility toggle
- 60 FPS performance with 100+ shapes

### 4. Shape Types ✅
**Basic Shapes:**
- Rectangle: Dynamic sizing, colored fills
- Circle: Dynamic sizing, colored fills

**Text Shapes:**
- Text: Multiple text types (normal, title, subtitle, h1, h2, h3)
- Font family selection (10 fonts)
- Font size adjustment (10px-48px)
- Inline text editing

**Complex Shapes:**
- Sticky Note: Yellow note-style with multi-line text
- Card: Title + content + optional bullet list items
- List: Title + checklist items with dynamic height

### 5. Shape Manipulation ✅
- Create shapes via toolbar buttons
- Select shapes (single click)
- Multi-select mode with visual indicators
- Drag and move shapes
- Resize shapes with transformer handles
- Delete shapes (Delete/Backspace keys)
- Duplicate shapes (Cmd/Ctrl+D)
- Copy/paste (Cmd/Ctrl+C/V) with offset positioning
- Keyboard arrow movement (10px increments)
- Snap-to-grid toggle (20px grid alignment)
- Color picker with predefined palette
- Shape locking mechanism (prevents concurrent edits)

### 6. Real-Time Collaboration ✅
- Firebase Firestore for persistent shape data
- Firebase Realtime Database for cursor positions
- Sub-100ms shape creation sync
- Optimized position updates during dragging
- Position interpolation for smooth remote movements
- Conflict resolution via shape locking
- Visual indicators for locked shapes (red border)
- Visual indicators for shapes being moved (yellow border)
- Auto-release locks on drag end or disconnect

### 7. Multiplayer Features ✅
- Live cursor tracking for all users
- User name display near cursor
- Unique color per user (8-color palette with hash-based assignment)
- Presence list showing online users
- Join/leave notifications
- Automatic cleanup on disconnect
- Heartbeat system (30-second presence refresh)
- Page visibility handling for reconnection

### 8. AI-Powered Shape Creation ✅
**Natural Language Processing:**
- OpenAI GPT-3.5-turbo integration
- Command parsing for shape operations (create, move, delete, resize)
- Intelligent text extraction from user commands
- Conversation history for context-aware responses

**Semantic Content Generation:**
- Persona cards with domain-specific templates
- Feature lists with contextual generation
- User story cards
- Pain points analysis
- Competitive analysis cards
- Startup idea to title/description conversion

**AI Operations:**
- Create shapes with natural language
- Move shapes by description
- Delete shapes by type/color
- Resize shapes with size descriptions
- Context-aware positioning (smart placement)
- Canvas metadata integration for relevant content

### 9. History & Undo/Redo ✅
- Per-shape history tracking
- User-scoped operations
- Undo support for create/update/delete
- History manager with operation snapshots
- Keyboard shortcuts (Cmd/Ctrl+Z)

### 10. Persistence & Caching ✅
- Canvas state persistence to localStorage
- Presence cache for offline resilience
- AI assistant state persistence
- User preferences storage
- Offline queue for failed operations
- Automatic cache cleanup

### 11. Performance Optimizations ✅
- Position interpolation for smooth remote movements
- Throttled Firebase updates (16ms for 60 FPS)
- Optimized drag tracking with batching
- Remote position caching with automatic cleanup
- React memo and useCallback optimizations
- Performance monitoring dashboard (toggle-able)

### 12. Export & Utilities ✅
- PNG export with transparent/white background options
- JSON export for canvas data
- Grid visibility toggle for exports
- Toast notifications for user feedback
- Properties panel for complex shapes
- Debug tools (cursor debug, performance dashboard)

### 13. UI/UX Features ✅
- Responsive design for different screen sizes
- Modern Tailwind CSS styling
- Floating toolbar with shape tools
- Zoom controls (bottom right)
- Export controls (top right)
- Canvas controls (undo/redo/clear)
- Connection status indicator
- Loading states and error handling
- Smooth transitions and animations

## Technical Architecture

### Current Tech Stack

**Frontend:**
- React 18.3.1 with hooks
- Vite 6.0.1 (build tool)
- Konva 10.0.2 & React-Konva 18.2.14 (canvas rendering)
- Tailwind CSS 3.4.0 (styling)
- React Router DOM 7.9.4 (routing)
- Lucide React (icons)

**Backend/Services:**
- Firebase 12.4.0
  - Authentication (email/password + Google OAuth)
  - Firestore (persistent canvas data)
  - Realtime Database (cursor positions, presence)
- OpenAI 6.4.0 (AI features)

**Utilities:**
- UUID 13.0.0 (unique IDs)
- LocalStorage (caching and offline support)

### Current Architecture Patterns

**Context Providers:**
- `AuthContext`: User authentication state
- `CanvasContext`: Canvas state, shapes, operations, AI execution

**Custom Hooks:**
- `useCanvas`: Firebase integration, shape CRUD, real-time positions
- `usePresence`: User presence and cursor tracking
- `useCursors`: Cursor position updates and broadcasting
- `useOptimizedPositioning`: Throttled position updates during drag

**Service Layer:**
- `auth.js`: Firebase authentication wrapper
- `canvas.js`: Firestore/RTDB operations for shapes
- `firebase.js`: Firebase initialization
- `openai.js`: OpenAI API integration
- `presence.js`: Presence and cursor position management

**Utility Layer:**
- `aiOperationHandler.js`: AI command processing
- `aiContentGenerators.js`: Template-based content generation
- `historyManager.js`: Undo/redo state management
- `persistence.js`: LocalStorage caching
- `performanceMonitor.js`: Performance tracking
- `positionInterpolation.js`: Smooth movement interpolation
- `snapUtils.js`: Grid snapping utilities
- `exportUtils.js`: PNG/JSON export

## Refactoring Goals

### Primary Objective
Migrate AI features from direct OpenAI API calls to a LangChain agent architecture with Pinecone vector storage while improving code quality and performance across the entire application.

### Specific Goals

#### 1. AI Architecture Migration
**From:** Direct OpenAI API calls via `services/openai.js`  
**To:** LangChain agents with tools and Pinecone vector storage

**Why:**
- Agent-based architecture with tool calling for better control
- Conversational context and memory via Pinecone
- Semantic search for shapes and canvases
- More robust error handling and retry logic
- Modular tool-based architecture for extensibility

#### 2. Pinecone Integration

**Use Case 1: Canvas Context Storage**
- Store canvas metadata as embeddings (name, description, purpose)
- Enable semantic search across canvases
- Provide rich context to AI agents for better responses

**Use Case 2: Shape Embeddings**
- Store shape content as embeddings (text, titles, items)
- Enable "find similar shapes" functionality
- Improve AI understanding of canvas layout and content

**Use Case 3: Conversation History**
- Store conversation embeddings for long-term memory
- Enable context-aware responses across sessions
- Track user preferences and patterns

#### 3. LangChain Agent Architecture

**Simplified Agent Architecture:**
```
User Command
     ↓
LangChain Agent (with tools)
     ↓
Context Retrieval (Pinecone)
     ↓
Tool Selection & Execution
     ↓
Response Generation
```

**Available Tools:**
- **createShapeTool**: Create any shape type with properties
- **moveShapeTool**: Move shapes to positions
- **deleteShapeTool**: Remove shapes by criteria
- **resizeShapeTool**: Change shape dimensions
- **searchShapesTool**: Find similar shapes (Pinecone)
- **getContextTool**: Retrieve canvas context (Pinecone)

#### 4. Performance Optimization

**Target Metrics:**
- 50% reduction in unnecessary re-renders
- 40% reduction in Firebase read operations
- Maintain 60 FPS with 1000+ shapes
- AI response time under 2 seconds
- 80%+ cache hit rate for common operations

**Optimization Strategies:**
- Convert more components to TypeScript with proper memoization
- Implement virtualization for large shape counts
- Optimize Firebase query patterns (compound queries, indexing)
- Add request deduplication and batching
- Implement progressive loading for canvases with many shapes

#### 5. Code Quality Improvements

**Target Metrics:**
- 80%+ TypeScript coverage
- Reduced prop drilling (max 2 levels)
- Component complexity score < 15
- 100% error boundary coverage
- Zero console errors/warnings

**Improvement Areas:**
- Migrate critical files to TypeScript (.ts/.tsx)
- Extract business logic from components
- Create proper error boundaries
- Improve type safety across the app
- Better separation of concerns (presentation vs logic)

#### 6. Architecture Improvements

**Current Issues:**
- Direct OpenAI calls in multiple places
- Context providers doing too much
- Mixed concerns in components
- Inconsistent error handling
- Limited offline support

**Target Architecture:**
- Service layer for all external APIs
- Thin context providers (state only)
- Smart/dumb component pattern
- Centralized error handling
- Robust offline queue system

## Migration Strategy

### Phase 1: Foundation (Week 1)
- Set up LangChain development environment
- Set up Pinecone account and index
- Create memory bank documentation (this file and others)
- Audit current codebase thoroughly
- Define TypeScript migration plan

### Phase 2: Infrastructure (Week 2)
- Install LangChain and Pinecone dependencies
- Create new service layer for LangChain agents
- Set up Pinecone embedding generation
- Implement feature flags for gradual rollout
- Create parallel AI system (old + new)

### Phase 3: Core Migration (Week 3-4)
- Create LangChain agent with shape operation tools
- Implement canvas context embeddings
- Add conversation memory with Pinecone
- Test feature parity with old system
- Performance benchmarking

### Phase 4: Advanced Features (Week 5)
- Chain-based multi-step commands
- Shape semantic search with Pinecone
- Improved context awareness
- Enhanced error handling
- Retry logic and fallbacks

### Phase 5: Optimization (Week 6)
- Performance profiling and optimization
- TypeScript migration of critical paths
- Component refactoring
- Firebase query optimization
- Cache improvements

### Phase 6: Validation (Week 7)
- Feature parity testing
- Performance regression testing
- User acceptance testing
- Documentation updates
- Deprecate old AI system

## Success Metrics

### Feature Parity
- ✅ All existing features work identically
- ✅ No regression in user experience
- ✅ Same or better response times

### Performance Improvements
- 📊 50% reduction in re-renders (measured via React DevTools)
- 📊 40% reduction in Firebase reads (measured via Firebase console)
- 📊 Maintain 60 FPS with 1000+ shapes
- 📊 AI responses < 2 seconds (p95)

### Code Quality
- 📊 80%+ TypeScript coverage
- 📊 Reduced component complexity (< 15 score)
- 📊 Zero console errors/warnings
- 📊 100% error boundary coverage

### AI Capabilities
- 🎯 Multi-step command execution ("create a pitch deck")
- 🎯 Conversation memory across sessions
- 🎯 Semantic shape search
- 🎯 Better context-aware responses
- 🎯 Improved error recovery

## Known Issues & Technical Debt

### Current Bugs
1. Occasional race condition when creating shapes rapidly
2. Text shape dimensions not always recalculated after font changes
3. Undo/redo doesn't work for all operations
4. Multi-select drag sometimes desyncs
5. Offline queue doesn't always sync properly on reconnection

### Technical Debt
1. Mixed JavaScript/TypeScript files (.js/.jsx)
2. Large context providers with too many responsibilities
3. Prop drilling in several component trees
4. Inconsistent error handling patterns
5. Limited test coverage
6. Some duplicate logic across utils
7. Performance monitoring code in production
8. Hard-coded constants scattered throughout

### Security Considerations
1. OpenAI API key exposed in browser (client-side calls)
2. Firebase rules need audit
3. No rate limiting on AI requests
4. User input not sanitized in all places

## Dependencies

### Current Dependencies
```json
{
  "firebase": "^12.4.0",
  "konva": "^10.0.2",
  "lucide-react": "^0.546.0",
  "openai": "^6.4.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-konva": "^18.2.14",
  "react-router-dom": "^7.9.4",
  "uuid": "^13.0.0"
}
```

### Planned Dependencies
```json
{
  "@langchain/openai": "latest",
  "@langchain/core": "latest",
  "@pinecone-database/pinecone": "latest",
  "zod": "latest"
}
```

## Environment Variables

### Current
```
VITE_FIREBASE_API_KEY
VITE_OPENAI_API_KEY
```

### Planned
```
VITE_FIREBASE_API_KEY
VITE_OPENAI_API_KEY (still needed for LangChain)
VITE_PINECONE_API_KEY
VITE_PINECONE_ENVIRONMENT
VITE_PINECONE_INDEX_NAME
```

## Risks & Mitigations

### Risk 1: Breaking Existing Features
**Mitigation**: Feature flags, parallel systems, comprehensive testing

### Risk 2: Performance Regression
**Mitigation**: Continuous benchmarking, performance budgets

### Risk 3: LangChain Learning Curve
**Mitigation**: Phased migration, start with simple tools, good documentation

### Risk 4: Pinecone Costs
**Mitigation**: Free tier initially, optimize embeddings, caching

### Risk 5: Migration Timeline
**Mitigation**: Prioritize critical paths, incremental releases, parallel work streams

## Conclusion

This refactoring effort aims to transform CanvasCollab from a well-functioning MVP into a production-ready, scalable, and intelligent collaborative platform. By migrating to LangChain agents and Pinecone vector storage, we gain powerful AI capabilities while improving code quality and performance across the board.

The phased approach ensures we maintain all existing functionality while progressively enhancing the system. Success will be measured by feature parity, performance improvements, and expanded AI capabilities that delight users.

