# CanvasCollab Architecture

## Tech Stack Overview

**Frontend:**
- React 18 + Vite (for fast development)
- TypeScript + JavaScript (mixed)
- Konva.js (high-performance canvas rendering at 60 FPS)
- Tailwind CSS (styling)
- React Router (routing)

**Backend:**
- Firebase Authentication (email/password + Google OAuth)
- Cloud Firestore (persistent storage for shapes and canvas data)
- Firebase Realtime Database (high-frequency cursor/presence updates)
- Firebase Hosting (deployment)
- OpenAI API (AI-powered shape generation)

## Architecture Pattern: Layered React Application

The application follows a clean layered architecture:

```
Presentation Layer (Components)
         ↓
State Management Layer (Contexts)
         ↓
Business Logic Layer (Hooks)
         ↓
Service Layer (Firebase/API Services)
         ↓
Data Layer (Firebase Backend)
```

---

## 1. Frontend Architecture

### Component Organization (`src/components/`)

The UI is organized by feature domain:

**Auth Components** (`Auth/`)
- `Login.jsx`, `Signup.jsx` - Authentication forms
- Handle email/password and Google OAuth flows

**Canvas Components** (`Canvas/`)
- `Canvas.jsx` - Main canvas rendering with Konva Stage/Layer
- `Shape.jsx` - Individual shape rendering with selection/locking
- `CanvasControls.jsx` - Tool selection UI
- `ShapeToolbar.jsx` - Shape creation buttons
- `PropertiesPanel.jsx` - Edit panel for selected shapes
- `ZoomControls.jsx`, `SnapToGridToggle.jsx` - Canvas controls
- `ExportControls.jsx` - PNG/SVG export functionality

**Collaboration Components** (`Collaboration/`)
- `Cursor.jsx` - Renders other users' cursors
- `PresenceList.jsx` - Shows online users

**Dashboard Components** (`Dashboard/`)
- `CanvasDashboard.jsx` - Canvas selection/management
- `CreateCanvasModal.jsx` - New canvas creation

**AI Components** (`AI/`)
- `AIChatInput.jsx` - Natural language shape creation interface

### State Management (`src/contexts/`)

Uses React Context API for global state:

**AuthContext** - User authentication state
```javascript
{
  currentUser,  // Firebase user object
  loading       // Auth state loading
}
```

**CanvasContext** - Canvas state and operations (800+ lines!)
```javascript
{
  shapes,              // Array of all shapes on canvas
  selectedId,          // Currently selected shape
  selectedIds,         // Multi-selection array
  currentTool,         // Active tool (select/multiselect)
  realTimePositions,   // Live drag positions
  canvasMetadata,      // Canvas name/description
  
  // Operations
  addShape, updateShape, deleteShape,
  selectShape, deselectAll,
  lockShape, unlockShape,
  executeAIOperation,
  undo, redo,
  copyShapes, pasteShapes
}
```

### Custom Hooks (`src/hooks/`)

Encapsulate reusable business logic:

**useCanvas** - Core canvas operations
- Subscribes to Firestore shape updates
- Manages shape CRUD operations
- Handles offline mode with local caching
- Real-time position updates via RTDB

**usePresence** - User presence management
- Sets user online/offline in RTDB
- Subscribes to presence changes
- Heartbeat system (30s intervals)
- Handles visibility changes and page unload

**useCursors** - Cursor position tracking
- Broadcasts cursor movements (throttled to 20-30 FPS)
- Receives other users' cursor positions

**useOptimizedPositioning** - Performance optimization
- Throttles position updates during drag
- Interpolates positions for smooth rendering

---

## 2. Backend Architecture (Firebase)

The backend uses **two Firebase databases** for different purposes:

### Cloud Firestore (Persistent Storage)

**Collection: `canvases`**
```javascript
{
  id: "canvas_123...",
  name: "My Design",
  description: "Project description",
  createdBy: "user_id",
  createdAt: timestamp,
  shapes: [
    {
      id: "shape_456...",
      type: "rectangle",
      x: 100, y: 200,
      width: 150, height: 100,
      fill: "#3B82F6",
      isLocked: false,
      lockedBy: null,
      isSelected: false,
      selectedBy: null,
      createdBy: "user_id",
      lastModifiedBy: "user_id"
    }
  ]
}
```

**Why Firestore?**
- Persistent storage (survives refreshes)
- Automatic conflict resolution
- Real-time listeners (`onSnapshot`)
- Atomic updates with `arrayUnion`
- Suitable for <100ms shape updates

### Firebase Realtime Database (High-Frequency Updates)

**Path: `/positions/{canvasId}/{shapeId}`**
```javascript
{
  x: 450,
  y: 300,
  updatedBy: "user_id",
  timestamp: 1234567890
}
```

**Path: `/sessions/{canvasId}/{userId}`**
```javascript
{
  displayName: "John Doe",
  cursorColor: "#FF5733",
  cursorX: 450,
  cursorY: 300,
  lastSeen: timestamp
}
```

**Why Realtime Database?**
- Lower latency (<50ms)
- Better for high-frequency updates (cursor movements)
- Simpler key-value structure
- Automatic cleanup with `onDisconnect`

---

## 3. Real-Time Collaboration System

### Shape Locking Mechanism

Prevents editing conflicts when multiple users work simultaneously:

1. User clicks shape → `selectShape()`
2. Shape locks in Firestore: `{ isLocked: true, lockedBy: userId }`
3. Other users see locked shape (different border color)
4. Other users cannot select/drag locked shapes
5. Lock releases on:
   - Deselection (click elsewhere)
   - Page unload/refresh
   - User disconnect

### Cursor Tracking

1. **Broadcasting**: `useCursors` hook captures mouse movement
2. **Throttling**: Updates sent at 20-30 FPS to RTDB
3. **Receiving**: Subscribe to `/sessions/{canvasId}`
4. **Rendering**: `Cursor.jsx` component displays each user's cursor
5. **Color Assignment**: Deterministic hash-based color from user ID

### Position Interpolation

For smooth remote shape movements:

**Problem**: Network updates arrive at irregular intervals (jitter)

**Solution**: `remotePositionInterpolation.js`
```javascript
// Interpolate between last known position and new position
const smoothPos = lerp(lastPos, newPos, alpha)
```

This creates 60 FPS smooth animations even with 20 FPS network updates.

### Presence System

**Online Detection:**
- User joins → Write to `/sessions/{canvasId}/{userId}`
- Heartbeat every 30 seconds
- Firebase `onDisconnect` automatically cleans up on disconnect

**Presence List:**
- `PresenceList.jsx` shows all online users
- Displays name, color indicator, online status

---

## 4. Canvas Rendering with Konva.js

### Why Konva?

- Native canvas rendering (not DOM elements)
- 60 FPS performance with hundreds of shapes
- Built-in drag/drop, transformations, events
- Works well with React via `react-konva`

### Canvas Structure

```javascript
<Stage>
  <Layer ref={gridLayerRef}>  // Grid + Background
    <Rect fill="#ffffff" />
    <Grid />
  </Layer>
  
  <Layer>  // Shapes
    {shapes.map(shape => 
      <Shape key={shape.id} />
    )}
  </Layer>
  
  <Layer>  // Cursors (on top)
    {users.map(user => 
      <Cursor key={user.id} />
    )}
  </Layer>
</Stage>
```

### Shape Types

- **Rectangle**: Basic colored rectangle
- **Circle**: Circular shape
- **Text**: Editable text with multiple styles (title, heading, normal)
- **Sticky Note**: Yellow note with editable text
- **Card**: White card with title + content + optional checklist
- **List**: Checklist with title + items

---

## 5. AI-Powered Shape Creation

### Architecture

**User Input** → **OpenAI GPT-4** → **Parsed Command** → **Shape Creation**

### Command Processing Flow

1. **User types command**: "Create a red circle at the top"
2. **AI parsing** (`openai.js`): Extract structured data
   ```javascript
   {
     operation: "create",
     type: "circle",
     color: "red",
     position: { relative: "top" }
   }
   ```
3. **Command handling** (`aiOperationHandler.js`): Process command
   - Resolve color to hex
   - Calculate position coordinates
   - Apply size dimensions
4. **Shape creation**: Same as manual creation via `addShape()`

### Semantic Creation

**Special feature**: Context-aware content generation

```javascript
// User: "Create a persona card"
// AI generates:
{
  operation: "semantic_create",
  semantic_type: "persona",
  // OpenAI generates realistic persona data based on canvas context
}
```

Supported semantic types:
- Persona cards
- Feature cards  
- User story cards
- Pain points cards
- Competitive analysis cards

### Startup Canvas Mode

Detects startup descriptions and auto-generates structured canvas:

```javascript
// User: "I want to build a fitness app for busy professionals"
// Creates: Title text + Description text centered on canvas
```

---

## 6. Data Flow Examples

### Creating a Shape (Manual)

```
User clicks "Rectangle" button
    ↓
ShapeToolbar.jsx → handleAddShape()
    ↓
CanvasContext → addShape()
    ↓
useCanvas hook → createShape()
    ↓
canvas.js service → updateDoc(Firestore)
    ↓
Firestore triggers onSnapshot
    ↓
All clients receive update
    ↓
Re-render with new shape
```

### Dragging a Shape

```
User drags shape
    ↓
Shape.jsx → onDragMove event
    ↓
Canvas.jsx → handleShapeDragMove()
    ↓
useOptimizedPositioning → updateDragPosition()
    ↓
canvas.js → updateShapePosition(RTDB)  // Real-time
    ↓
Other users see yellow border (being moved)
    ↓
Drag ends → Final position to Firestore
    ↓
Yellow border disappears
```

### AI Shape Creation

```
User: "Create a blue circle"
    ↓
AIChatInput.jsx → handleSendMessage()
    ↓
openai.js → parseShapeCommand() [GPT-4 API]
    ↓
Returns: { operation: "create", type: "circle", color: "blue" }
    ↓
CanvasContext → executeAIOperation()
    ↓
aiOperationHandler.js → processAIOperation()
    ↓
Calculates position, resolves color
    ↓
operations.createShape() → Same as manual flow
```

---

## 7. Performance Optimizations

### Rendering Optimizations

**Konva Performance:**
- Canvas-based rendering (not DOM)
- Layer separation (grid, shapes, cursors)
- Selective re-rendering with React keys
- 60 FPS maintained with 500+ shapes

**Position Interpolation:**
- Smooth animations despite network jitter
- `remotePositionInterpolation.js` uses linear interpolation
- Cached positions cleared after 1 second of inactivity

**Throttling:**
- Cursor updates: 20-30 FPS (16ms throttle)
- Real-time positions: 60 FPS (~16ms throttle)
- Presence heartbeat: Every 30 seconds

### Offline Support

**Local Caching** (`persistence.js`):
```javascript
// Save to localStorage
CanvasPersistence.saveCanvasState(shapes, metadata)

// Load on reconnect
const cached = CanvasPersistence.loadCanvasState()
```

**Offline Queue:**
- Actions queued when offline
- Synced when connection restored
- Optimistic UI updates

### Memory Management

- Remote position cache cleanup after 1 second
- Unsubscribe from Firebase listeners on unmount
- Clear locks/selections on page unload

---

## 8. Key Design Patterns

### Service Layer Pattern

All Firebase operations isolated in service files:
- `auth.js` - Authentication operations
- `canvas.js` - Canvas/shape CRUD
- `presence.js` - Presence management
- `openai.js` - AI operations

### Observer Pattern

Real-time updates via Firebase listeners:
```javascript
subscribeToShapes(canvasId, (shapes) => {
  setShapes(shapes)  // Auto-updates on remote changes
})
```

### Command Pattern (AI)

AI operations structured as commands:
```javascript
{
  operation: "create" | "move" | "delete" | "resize",
  target: { type, color },  // For move/delete/resize
  ...params
}
```

### Composite Pattern (Shapes)

All shapes share common interface but have unique properties:
```javascript
// Common: id, x, y, width, height, fill
// Text-specific: text, textType, fontSize
// Card-specific: title, content, items
```

---

## 9. State Management Strategy

### Why Context API?

- No external dependencies (Redux, Zustand)
- Good enough for single-canvas collaboration
- Direct integration with Firebase listeners
- Simple mental model

### Context Splitting

Two separate contexts to avoid unnecessary re-renders:
- **AuthContext**: User authentication (changes rarely)
- **CanvasContext**: Canvas state (changes frequently)

### Optimistic Updates

Local state updated immediately, Firebase updated async:
```javascript
setShapes(prev => [...prev, newShape])  // Immediate
await createShape(canvasId, shapeData)  // Async
```

---

## 10. Error Handling & Resilience

### Network Resilience

- Offline detection with `window.addEventListener('offline')`
- Automatic reconnection on `'online'` event
- Presence refresh when tab becomes visible
- Firestore/RTDB handle reconnection automatically

### Conflict Resolution

- **Firestore**: Last-write-wins for persistent data
- **Locking**: First-user-to-lock wins for active editing
- **Real-time positions**: Latest position always wins

### Cleanup on Disconnect

Multiple layers of cleanup:
1. `beforeunload` event → Clear locks/selections
2. `pagehide` event → Mobile cleanup
3. Firebase `onDisconnect()` → Automatic RTDB cleanup
4. Component unmount → Unsubscribe listeners

---

## Summary

CanvasCollab is a **real-time collaborative canvas application** with:

1. **Dual-database architecture**: Firestore for persistence, RTDB for real-time
2. **Layered frontend**: Components → Contexts → Hooks → Services
3. **Konva.js rendering**: High-performance canvas with 60 FPS
4. **Sophisticated locking**: Prevents edit conflicts
5. **Smooth interpolation**: Jitter-free remote movements
6. **AI integration**: Natural language shape creation
7. **Offline support**: Local caching and queue
8. **Multi-canvas support**: Dashboard for canvas management

The architecture balances **simplicity** (Context API, straightforward data flow) with **performance** (Konva, throttling, interpolation) while maintaining **real-time collaboration** quality comparable to Figma or Miro.

### Key Architectural Decisions

✓ **Two databases for different update patterns** - Firestore for persistence, RTDB for real-time  
✓ **Canvas rendering instead of DOM manipulation** - Konva.js for 60 FPS performance  
✓ **Optimistic updates for responsive UX** - Local state updates immediately  
✓ **Service layer isolation for testability** - Clean separation of concerns  
✓ **Context API for adequate state management** - Simple, no external dependencies  

The codebase demonstrates production-ready patterns for building real-time collaborative tools.

---

## File Structure

```
CanvasCollab/
├── collabcanvas/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AI/
│   │   │   │   └── AIChatInput.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Signup.jsx
│   │   │   ├── Canvas/
│   │   │   │   ├── Canvas.jsx
│   │   │   │   ├── Shape.jsx
│   │   │   │   ├── CanvasControls.jsx
│   │   │   │   ├── ShapeToolbar.jsx
│   │   │   │   ├── PropertiesPanel.jsx
│   │   │   │   ├── ZoomControls.jsx
│   │   │   │   ├── ExportControls.jsx
│   │   │   │   └── ...
│   │   │   ├── Collaboration/
│   │   │   │   ├── Cursor.jsx
│   │   │   │   └── PresenceList.jsx
│   │   │   ├── Dashboard/
│   │   │   │   ├── CanvasDashboard.jsx
│   │   │   │   └── CreateCanvasModal.jsx
│   │   │   └── Layout/
│   │   │       ├── Navbar.jsx
│   │   │       └── ConnectionStatus.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CanvasContext.jsx
│   │   ├── hooks/
│   │   │   ├── useCanvas.js
│   │   │   ├── usePresence.js
│   │   │   ├── useCursors.js
│   │   │   └── useOptimizedPositioning.js
│   │   ├── services/
│   │   │   ├── auth.js
│   │   │   ├── canvas.js
│   │   │   ├── firebase.js
│   │   │   ├── presence.js
│   │   │   └── openai.js
│   │   ├── utils/
│   │   │   ├── aiOperationHandler.js
│   │   │   ├── shapeCommandHandler.js
│   │   │   ├── persistence.js
│   │   │   ├── remotePositionInterpolation.js
│   │   │   ├── snapUtils.js
│   │   │   ├── exportUtils.js
│   │   │   ├── historyManager.js
│   │   │   └── constants.js
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── firebase.json
├── firestore.rules
├── database.rules.json
└── README.md
```
