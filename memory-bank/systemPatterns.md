# System Patterns

## Design Patterns in Use

### 1. Context Provider Pattern

**Purpose**: Share global state without prop drilling

**Implementation:**
```javascript
// AuthContext.jsx
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  // ... auth logic
  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
};
```

**Used For:**
- `AuthContext`: User authentication state
- `CanvasContext`: Canvas operations and state

**Benefits:**
- No prop drilling
- Centralized state management
- Easy access via hooks

**Current Issues:**
- CanvasContext is too large (900+ lines)
- Too many responsibilities in one context
- Re-renders entire subtree on any state change

**Refactoring Plan:**
- Split CanvasContext into smaller contexts:
  - ShapesContext (shape data)
  - OperationsContext (CRUD functions)
  - CollaborationContext (presence, cursors)
  - AIContext (AI operations)

### 2. Custom Hooks Pattern

**Purpose**: Extract reusable stateful logic

**Examples:**

**useCanvas** - Firebase Integration
```javascript
export const useCanvas = (canvasId) => {
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Subscribe to Firestore
  useEffect(() => {
    const unsubscribe = subscribeToShapes(canvasId, setShapes);
    return unsubscribe;
  }, [canvasId]);
  
  // CRUD operations
  const addShape = useCallback(async (type, position) => {
    // ...
  }, [canvasId, currentUser]);
  
  return { shapes, loading, addShape, updateShape, deleteShape };
};
```

**usePresence** - Presence Management
```javascript
export const usePresence = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  // Set user online on mount
  useEffect(() => {
    setUserOnline(canvasId, userId, displayName, color);
    return () => setUserOffline(canvasId, userId);
  }, [canvasId, userId]);
  
  return { onlineUsers };
};
```

**Benefits:**
- Reusable logic
- Testable in isolation
- Clean component code

**Pattern:**
1. Accept dependencies as parameters
2. Use useEffect for subscriptions
3. Return cleanup functions
4. Use useCallback for stable references
5. Return operations and state

### 3. Service Layer Pattern

**Purpose**: Abstract external API interactions

**Structure:**
```
services/
  ├── auth.js          # Firebase Auth wrapper
  ├── canvas.js        # Firestore/RTDB operations
  ├── firebase.js      # Firebase initialization
  ├── openai.js        # OpenAI API
  └── presence.js      # Presence/cursor management
```

**Example:**
```javascript
// canvas.js
export const createShape = async (canvasId, shapeData) => {
  const canvasRef = doc(db, 'canvases', canvasId);
  await updateDoc(canvasRef, {
    shapes: arrayUnion(shape)
  });
};

export const updateShape = async (canvasId, shapeId, updates) => {
  // ... implementation
};
```

**Benefits:**
- Single source of truth for API calls
- Easy to mock for testing
- Clear separation of concerns
- Can add middleware (logging, error handling)

**Usage:**
```javascript
// In component or hook
import { createShape, updateShape } from '../services/canvas';

const handleCreate = async () => {
  await createShape(canvasId, shapeData);
};
```

### 4. Optimistic Update Pattern

**Purpose**: Immediate UI updates before server confirmation

**Implementation:**
```javascript
const addShape = async (type, position) => {
  const tempId = `temp_${Date.now()}`;
  
  // Optimistic update - update UI immediately
  setShapes(prev => [...prev, { id: tempId, type, ...position }]);
  
  try {
    // Actual API call
    const realId = await createShape(canvasId, shapeData);
    
    // Replace temp ID with real ID
    setShapes(prev => 
      prev.map(s => s.id === tempId ? { ...s, id: realId } : s)
    );
  } catch (error) {
    // Rollback on error
    setShapes(prev => prev.filter(s => s.id !== tempId));
    showError('Failed to create shape');
  }
};
```

**Current Status:** Partially implemented
- Used in some operations
- Not consistent across all mutations
- No visual indication of pending operations

**Benefits:**
- Feels instant to users
- Better UX during network latency
- Automatic rollback on errors

### 5. Pub/Sub Pattern (via Firebase)

**Purpose**: Real-time synchronization across clients

**Implementation:**
```javascript
// Publisher (any client)
await updateDoc(canvasRef, {
  shapes: arrayUnion(newShape)
});

// Subscribers (all clients)
onSnapshot(canvasRef, (doc) => {
  const shapes = doc.data().shapes;
  setShapes(shapes);  // All clients update
});
```

**Used For:**
- Shape changes (Firestore)
- Cursor positions (RTDB)
- Presence updates (RTDB)

**Benefits:**
- Automatic synchronization
- No polling required
- Built-in connection management

### 6. Locking Pattern

**Purpose**: Prevent concurrent edits to same object

**Implementation:**
```javascript
// Lock acquisition
const selectShape = async (shapeId) => {
  const shape = shapes.find(s => s.id === shapeId);
  
  // Check if locked by another user
  if (shape.lockedBy && shape.lockedBy !== currentUser.uid) {
    showToast('Shape is locked by another user');
    return;
  }
  
  // Acquire lock
  await lockShape(canvasId, shapeId, currentUser.uid);
  setSelectedId(shapeId);
};

// Lock release
const deselectShape = async (shapeId) => {
  await unlockShape(canvasId, shapeId);
  setSelectedId(null);
};
```

**Lock Types:**
- **Explicit Lock**: Via selection (red border)
- **Implicit Lock**: During drag operation (yellow border)

**Auto-release:**
- On drag end
- On deselection
- On disconnect (via onDisconnect in RTDB)
- On timeout (3-5 seconds)

### 7. Command Pattern (AI Operations)

**Purpose**: Encapsulate AI operations as executable commands

**Implementation:**
```javascript
// Command interface
const operations = {
  createShape: async (type, shapeData) => {
    return await addShape(type, shapeData);
  },
  moveShape: async (shapeId, x, y) => {
    return await updateShape(shapeId, { x, y });
  },
  deleteShape: async (shapeId) => {
    return await deleteShape(shapeId);
  }
};

// Command execution
const result = await processAIOperation(parsedCommand, shapes, operations);
```

**Benefits:**
- Decouples AI parsing from execution
- Easy to add new operations
- Can add undo/redo support
- Testable command handlers

### 8. Strategy Pattern (Content Generation)

**Purpose**: Different strategies for generating content

**Implementation:**
```javascript
// Domain detection
const domain = detectDomain(canvasMetadata);  // 'healthcare', 'fintech', etc.

// Strategy selection
const templates = getPersonaTemplates(domain);
const persona = templates[Math.random() * templates.length];

// Fallback to LLM if templates insufficient
if (requiresCustom) {
  const generated = await generatePersonaCard(canvasMetadata);
}
```

**Strategies:**
- Template-based (fast, offline-capable)
- LLM-based (smart, context-aware)
- Hybrid (templates + LLM enhancement)

### 9. Observer Pattern (Performance Monitoring)

**Purpose**: Track performance metrics without coupling

**Implementation:**
```javascript
class PerformanceMonitor {
  constructor() {
    this.observers = [];
    this.metrics = { fps: 0, memory: 0, renders: 0 };
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  notify() {
    this.observers.forEach(obs => obs(this.metrics));
  }
  
  updateMetrics(newMetrics) {
    this.metrics = { ...this.metrics, ...newMetrics };
    this.notify();
  }
}
```

**Current Status:** Basic implementation
- FPS tracking
- Memory usage
- Render count

### 10. Factory Pattern (Shape Creation)

**Purpose**: Centralize shape creation logic

**Implementation:**
```javascript
const createShapeData = (type, position) => {
  const baseShape = {
    id: generateId(),
    type,
    x: position.x,
    y: position.y,
    createdBy: currentUser.uid
  };
  
  switch (type) {
    case 'rectangle':
      return { ...baseShape, width: 100, height: 100, fill: '#3B82F6' };
    case 'circle':
      return { ...baseShape, width: 100, height: 100, fill: '#06B6D4' };
    case 'text':
      return { ...baseShape, text: 'Text', fontSize: 14 };
    case 'stickyNote':
      return { ...baseShape, text: 'Note', width: 200, height: 120 };
    // ... etc
  }
};
```

**Benefits:**
- Consistent shape initialization
- Easy to add new shape types
- Centralized default values

## Component Architecture

### Component Hierarchy

```
App (AuthProvider)
└─ Router
   ├─ LandingPage
   ├─ Login
   ├─ Signup
   ├─ Dashboard
   │  ├─ Navbar
   │  ├─ CreateCanvasModal
   │  └─ CanvasCard (list)
   └─ Canvas (CanvasProvider)
      ├─ Navbar
      ├─ Canvas (Konva Stage)
      │  ├─ Grid Layer
      │  ├─ Shapes Layer
      │  │  └─ Shape (for each shape)
      │  │     ├─ Rectangle/Circle/Text
      │  │     └─ Transformer
      │  └─ Cursors Layer
      │     └─ Cursor (for each user)
      ├─ ShapeToolbar
      ├─ CanvasControls
      ├─ ZoomControls
      ├─ ExportControls
      ├─ SnapToGridToggle
      ├─ PropertiesPanel
      ├─ ConnectionStatus
      └─ Toast
```

### Component Types

**Container Components (Smart)**
- Access context
- Manage state
- Handle business logic
- Pass data to presentational components

Examples:
- `CanvasDashboard`: Fetch canvases, handle CRUD
- `Canvas`: Manage stage, handle events
- `AIChatInput`: Process AI commands

**Presentational Components (Dumb)**
- Receive data via props
- Display UI
- Emit events via callbacks
- No direct state management

Examples:
- `Shape`: Render shape based on props
- `Cursor`: Display cursor at position
- `ColorPicker`: Show color options

**Hybrid Components**
- Both logic and presentation
- Acceptable for small components
- Most current components are hybrids

Examples:
- `ShapeToolbar`: Has local state + renders UI
- `CreateCanvasModal`: Form state + modal UI

### State Management Patterns

**Local State (useState)**
```javascript
const [isOpen, setIsOpen] = useState(false);
const [input, setInput] = useState('');
```

**Used For:**
- Component-local UI state
- Form inputs
- Toggle states
- Temporary values

**Context State**
```javascript
const { currentUser } = useAuth();
const { shapes, addShape } = useCanvas();
```

**Used For:**
- Shared state across components
- Authentication
- Canvas data
- Collaborative features

**Derived State**
```javascript
const selectedShape = selectedId 
  ? shapes.find(s => s.id === selectedId) 
  : null;
```

**Used For:**
- Computed from other state
- No separate useState needed
- Recalculated on dependency change

**Ref State (useRef)**
```javascript
const stageRef = useRef(null);
const inputRef = useRef(null);
```

**Used For:**
- DOM references
- Mutable values that don't trigger renders
- Previous values
- Timers/intervals

### Effect Patterns

**Subscription Effect**
```javascript
useEffect(() => {
  const unsubscribe = subscribeToShapes(canvasId, setShapes);
  return unsubscribe;  // Cleanup
}, [canvasId]);
```

**Sync Effect**
```javascript
useEffect(() => {
  if (isVisible && inputRef.current) {
    inputRef.current.focus();
  }
}, [isVisible]);
```

**Lifecycle Effect**
```javascript
useEffect(() => {
  // On mount
  initialize();
  
  return () => {
    // On unmount
    cleanup();
  };
}, []);
```

### Callback Optimization

**useCallback for Stable References**
```javascript
const handleClick = useCallback(() => {
  doSomething(dependency);
}, [dependency]);
```

**When to Use:**
- Passed to memoized children
- Used in dependency arrays
- Expensive function creation

**When Not to Use:**
- Simple inline functions
- Functions that change often
- Over-optimization (premature)

### Memoization Patterns

**React.memo for Component Memoization**
```javascript
const Shape = React.memo(({ shape, isSelected, onSelect }) => {
  // Only re-renders if props change
  return <Rect {...shape} />;
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.shape === nextProps.shape;
});
```

**useMemo for Expensive Calculations**
```javascript
const sortedShapes = useMemo(() => {
  return shapes.sort((a, b) => a.y - b.y);
}, [shapes]);
```

## Data Flow Patterns

### Unidirectional Data Flow

```
User Action
    ↓
Event Handler
    ↓
Service Call (async)
    ↓
Firebase Update
    ↓
onSnapshot Listener
    ↓
State Update (setState)
    ↓
Re-render (React)
    ↓
UI Updates
```

### Event Flow (Canvas)

```
Mouse Event (Konva)
    ↓
Canvas Component Handler
    ↓
Context Function Call
    ↓
Hook Function (useCanvas)
    ↓
Service Function
    ↓
Firebase API
```

### AI Command Flow

```
User Input
    ↓
AIChatInput.handleSubmit
    ↓
parseShapeCommand (OpenAI)
    ↓
processAIOperation
    ↓
operations.createShape
    ↓
Same as manual flow
```

## Error Handling Patterns

### Try-Catch with User Feedback

```javascript
const handleOperation = async () => {
  try {
    setLoading(true);
    await riskyOperation();
    showToast('Success!', 'success');
  } catch (error) {
    console.error('Operation failed:', error);
    showToast('Operation failed. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
};
```

### Fallback Pattern

```javascript
// Try LLM, fall back to templates
let content;
try {
  content = await generateWithLLM(prompt);
} catch (error) {
  console.warn('LLM failed, using template');
  content = getTemplate(type);
}
```

### Error Boundaries (Planned)

```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

## Performance Patterns

### Throttling (Position Updates)

```javascript
let lastUpdate = 0;
const THROTTLE_MS = 16;  // 60 FPS

const throttledUpdate = (position) => {
  const now = Date.now();
  if (now - lastUpdate < THROTTLE_MS) return;
  
  lastUpdate = now;
  updatePosition(position);
};
```

### Debouncing (Search/Input)

```javascript
const [input, setInput] = useState('');
const [debouncedValue, setDebouncedValue] = useState('');

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedValue(input);
  }, 300);
  
  return () => clearTimeout(timer);
}, [input]);
```

### Batch Updates

```javascript
// Instead of multiple updates
for (const shape of shapes) {
  await updateShape(shape.id, updates);  // Bad: N queries
}

// Batch into single update
const batch = shapes.map(s => ({ id: s.id, ...updates }));
await batchUpdateShapes(batch);  // Good: 1 query
```

### Virtual Scrolling (Planned)

```javascript
// For large lists (>1000 shapes)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={shapes.length}
  itemSize={50}
>
  {ShapeRow}
</FixedSizeList>
```

## Testing Patterns (Planned)

### Component Testing

```javascript
import { render, fireEvent } from '@testing-library/react';

test('creates shape on button click', async () => {
  const mockAddShape = jest.fn();
  const { getByText } = render(
    <ShapeToolbar addShape={mockAddShape} />
  );
  
  fireEvent.click(getByText('Rectangle'));
  expect(mockAddShape).toHaveBeenCalledWith('rectangle', expect.any(Object));
});
```

### Hook Testing

```javascript
import { renderHook, act } from '@testing-library/react-hooks';

test('useCanvas loads shapes', async () => {
  const { result, waitForNextUpdate } = renderHook(() => 
    useCanvas('canvas-123')
  );
  
  await waitForNextUpdate();
  expect(result.current.shapes).toHaveLength(5);
});
```

### Service Testing

```javascript
test('createShape adds to Firestore', async () => {
  const mockDoc = jest.fn();
  const mockUpdateDoc = jest.fn();
  
  await createShape('canvas-1', shapeData);
  
  expect(mockUpdateDoc).toHaveBeenCalledWith(
    expect.any(Object),
    expect.objectContaining({ shapes: expect.any(Array) })
  );
});
```

## Code Organization Principles

### File Naming Conventions

- Components: PascalCase (e.g., `ShapeToolbar.jsx`)
- Hooks: camelCase with `use` prefix (e.g., `useCanvas.js`)
- Utils: camelCase (e.g., `snapUtils.js`)
- Services: camelCase (e.g., `canvas.js`)
- Contexts: PascalCase + Context (e.g., `AuthContext.jsx`)

### Directory Structure

```
src/
├── components/          # React components
│   ├── AI/             # AI-related components
│   ├── Auth/           # Authentication views
│   ├── Canvas/         # Canvas and toolbar
│   ├── Collaboration/  # Cursors, presence
│   ├── Dashboard/      # Canvas management
│   ├── Debug/          # Development tools
│   ├── Landing/        # Marketing page
│   ├── Layout/         # Shared layout
│   ├── Performance/    # Performance tools
│   ├── shapes/         # Shape-specific components
│   └── ui/             # Reusable UI components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── services/           # External API wrappers
├── utils/              # Pure utility functions
├── App.tsx             # Root component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

### Import Order Convention

```javascript
// 1. React/library imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Context/hook imports
import { useAuth } from '../../contexts/AuthContext';
import { useCanvas } from '../../hooks/useCanvas';

// 3. Component imports
import ShapeToolbar from './ShapeToolbar';
import Canvas from './Canvas';

// 4. Service/util imports
import { createShape } from '../../services/canvas';
import { snapToGrid } from '../../utils/snapUtils';

// 5. Type imports (once TypeScript)
import type { Shape, Position } from '../../types';
```

## Anti-Patterns to Avoid

### ❌ Prop Drilling

```javascript
// Bad: Passing through multiple levels
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data}>
      <GreatGrandChild data={data} />
```

**Solution:** Use Context or composition

### ❌ Mutating State Directly

```javascript
// Bad
shapes[0].x = 100;
setShapes(shapes);

// Good
setShapes(prev => prev.map(s => 
  s.id === shapeId ? { ...s, x: 100 } : s
));
```

### ❌ Missing Dependencies in useEffect

```javascript
// Bad
useEffect(() => {
  doSomething(value);
}, []);  // Missing 'value' dependency

// Good
useEffect(() => {
  doSomething(value);
}, [value]);
```

### ❌ Over-abstraction

```javascript
// Bad: Too generic
const useGenericDataFetcher = (url, parser, transformer, validator) => {
  // ...complex logic
};

// Good: Specific and simple
const useCanvasShapes = (canvasId) => {
  // ...focused logic
};
```

### ❌ God Components

```javascript
// Bad: 1000+ line component doing everything
const CanvasContext = () => {
  // Auth logic
  // Shape logic
  // AI logic
  // Presence logic
  // Export logic
  // ...
};

// Good: Split into focused contexts
const ShapesContext = () => { /* shape logic */ };
const CollaborationContext = () => { /* collab logic */ };
```

## Future Patterns (Planned)

### Finite State Machine (Canvas States)

```typescript
type CanvasState = 
  | { status: 'idle' }
  | { status: 'selecting', shapeId: string }
  | { status: 'dragging', shapeId: string }
  | { status: 'resizing', shapeId: string }
  | { status: 'editing', shapeId: string };

const [canvasState, setCanvasState] = useState<CanvasState>({ status: 'idle' });
```

### Agent Pattern (LangGraph)

```typescript
interface Agent {
  name: string;
  tools: Tool[];
  execute: (input: string) => Promise<AgentResponse>;
}

class ShapeAgent implements Agent {
  async execute(input: string) {
    // Parse and execute shape operations
  }
}
```

### Repository Pattern (Data Access)

```typescript
interface ShapeRepository {
  findById(id: string): Promise<Shape>;
  findByCanvas(canvasId: string): Promise<Shape[]>;
  save(shape: Shape): Promise<void>;
  delete(id: string): Promise<void>;
}

class FirestoreShapeRepository implements ShapeRepository {
  // Implementation
}
```

## Conclusion

The current codebase uses solid React patterns but has room for improvement in terms of separation of concerns, TypeScript adoption, and advanced patterns for AI integration. The refactoring effort will introduce more sophisticated patterns while maintaining the working functionality.

