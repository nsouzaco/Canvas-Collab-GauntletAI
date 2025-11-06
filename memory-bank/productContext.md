# Product Context

## Why This Project Exists

### Problem Statement
Teams working on startup ideas, product designs, and collaborative brainstorming need a tool that combines:
1. **Real-time collaboration** - Multiple people working together simultaneously
2. **Visual thinking** - Canvas-based workspace for spatial organization
3. **AI assistance** - Intelligent content generation to accelerate ideation
4. **Simplicity** - No steep learning curve, instant productivity

### Target Users
- **Startup founders** planning product features and roadmaps
- **Product managers** creating user personas and stories
- **Design teams** brainstorming and wireframing
- **Remote teams** collaborating asynchronously across time zones

### User Pain Points Addressed
1. **Idea capture is slow** - Manual creation of cards, personas, features
2. **Context switching** - Jumping between tools (Figma, Notion, Miro, etc.)
3. **Collaboration friction** - Version conflicts, lost changes, unclear ownership
4. **Content creation tedium** - Repetitive work generating similar content

## How It Works

### User Journey

#### 1. Getting Started
**Landing Page**
- User arrives at clean landing page
- "Get Started" CTA
- No complex signup flow

**Authentication**
- Email/password signup
- Google OAuth (one-click)
- Automatic login on subsequent visits

#### 2. Canvas Management
**Dashboard View**
- Grid of canvas cards showing:
  - Canvas name and description
  - Creator name
  - Creation date
  - Shape count
- "Create New Canvas" button prominently displayed
- Delete option for canvas creators

**Creating a Canvas**
- Modal with two fields:
  - Name (required)
  - Description (optional but recommended for AI)
- Click "Create" → Immediately navigate to new canvas
- Description used as context for AI-generated content

#### 3. Canvas Workspace
**Initial View**
- Large white canvas (1200x1000+ responsive)
- Optional grid overlay (20px squares)
- Floating toolbar at bottom center
- Zoom controls at bottom right
- Export options at top right
- User's cursor visible with their name

**Toolbar Actions**
- **Select tool** (cursor icon) - Default mode
- **Multi-select tool** (dashed square) - Select multiple shapes
- **Rectangle** - Create colored rectangles
- **Circle** - Create colored circles
- **Text** - Add text with styling options
- **Sticky Note** - Yellow note for quick thoughts
- **Card** - Title + content + optional bullets
- **List** - Checklist with title and items
- **Font Size** - Adjust text size (10-48px)
- **Text Type** - Normal, title, subtitle, H1, H2, H3
- **Font Family** - Choose from 10 fonts
- **Color Picker** - Change shape fill color

#### 4. Collaboration
**Multi-User Experience**
- See other users' cursors in real-time
- Each user has unique color (name displayed near cursor)
- Red border = Shape locked by another user
- Yellow border = Shape being moved in real-time
- Presence list shows all online users

**Concurrent Editing**
- First to select/drag locks the shape
- Others see visual indicators
- Locks auto-release on drag end or disconnect
- No conflicts, no overwrites

#### 5. AI Assistant
**Activation**
- AI chat panel always visible (can be toggled)
- Quick command buttons for common operations
- Text input with autocomplete suggestions

**Natural Language Commands**
Examples:
- "Create a persona card" → Generates user persona with context
- "Add app features" → Creates feature list relevant to canvas
- "Create user story" → Generates user story card
- "Add pain points" → Lists common user challenges
- "Create red circle" → Shapes with specific attributes
- "Add sticky note" → Quick note creation

**AI-Generated Content**
All AI content is context-aware:
- Uses canvas name and description
- Detects domain (healthcare, fintech, ecommerce, etc.)
- Generates relevant personas, features, pain points
- Falls back to templates if LLM unavailable

#### 6. Editing & Manipulation
**Shape Selection**
- Click any shape to select
- Transformer handles appear (resize corners/edges)
- Selected shape shows blue border
- Properties visible in toolbar

**Moving Shapes**
- Click and drag to move
- Snap to grid if enabled
- Real-time sync to other users
- Arrow keys for precise movement (10px)

**Resizing Shapes**
- Drag transformer handles
- Maintain aspect ratio (hold Shift - planned)
- Min/max size constraints

**Editing Content**
- Double-click text shapes → Inline editor
- Double-click cards/lists → Properties panel opens
- Properties panel shows:
  - Title field
  - Content field
  - Bullet list editor (add/remove items)

**Copy & Paste**
- Select shape(s)
- Cmd/Ctrl+C to copy
- Cmd/Ctrl+V to paste
- Pasted shapes offset by 20px

**Duplication**
- Select shape
- Cmd/Ctrl+D to duplicate
- Duplicate offset by 20px

**Deletion**
- Select shape(s)
- Press Delete or Backspace
- Immediate removal
- Syncs to all users

#### 7. Canvas Navigation
**Panning**
- Click empty canvas and drag
- Smooth movement
- Works at any zoom level

**Zooming**
- Mousewheel up/down
- Zoom controls (+ / -)
- Range: 0.1x to 5x
- Centers on cursor position

**Snap to Grid**
- Toggle button (bottom left)
- Aligns shapes to 20px grid
- Makes layout cleaner
- Can be disabled for freeform

#### 8. Export Options
**PNG Export**
- Button in top right
- Options:
  - Transparent background
  - White background
- Grid visibility toggle
- Downloads immediately

**JSON Export**
- Export canvas data
- All shapes and metadata
- Can be reimported (future feature)

#### 9. History & Undo
**Undo/Redo**
- Cmd/Ctrl+Z to undo
- Cmd/Ctrl+Shift+Z to redo
- Per-shape history tracking
- User-scoped operations
- Currently limited scope (planned: full history)

## Feature Details

### Shape Types

#### 1. Rectangle
**Properties:**
- Position (x, y)
- Size (width, height)
- Fill color (from palette)
- Stroke (optional)

**Use Cases:**
- Generic containers
- Highlighting areas
- Creating boxes/frames
- Background elements

#### 2. Circle
**Properties:**
- Position (x, y)
- Size (width, height)
- Fill color (from palette)
- Stroke (optional)

**Use Cases:**
- Icons/avatars
- Decorative elements
- Highlighting points
- Status indicators

#### 3. Text
**Properties:**
- Content (string)
- Font size (10-48px)
- Font family (10 options)
- Text type (normal, title, subtitle, h1, h2, h3)
- Position and size

**Text Types:**
- **Normal**: Regular body text (14px default)
- **Title**: Large bold text (32px)
- **Subtitle**: Medium text (18px, gray)
- **Heading 1**: Extra large bold (24px)
- **Heading 2**: Large bold (20px)
- **Heading 3**: Medium bold (16px)

**Use Cases:**
- Labels and titles
- Descriptions
- Headers
- Notes

#### 4. Sticky Note
**Properties:**
- Text content (multi-line)
- Fixed yellow background
- Fixed size (200x120px default)
- Simulates physical post-it

**Features:**
- Multi-line text support
- Auto-wrapping
- Can be resized

**Use Cases:**
- Quick thoughts
- Reminders
- Brainstorming
- To-do items

#### 5. Card
**Properties:**
- Title (bold, prominent)
- Content (multi-line description)
- Optional bullet list (items array)
- White background
- Fixed width (280px), dynamic height

**Layout:**
```
┌────────────────────┐
│ Title (Bold)       │
├────────────────────┤
│ Content text here  │
│ Can be multiple    │
│ lines              │
│                    │
│ • Bullet 1         │
│ • Bullet 2         │
│ • Bullet 3         │
└────────────────────┘
```

**Use Cases:**
- User personas
- Feature descriptions
- Product cards
- Information boxes

#### 6. List
**Properties:**
- Title (bold header)
- Items (array of strings)
- Each item shown with checkbox
- White background
- Fixed width (280px), dynamic height

**Layout:**
```
┌────────────────────┐
│ List Title         │
├────────────────────┤
│ ☐ Item 1           │
│ ☐ Item 2           │
│ ☐ Item 3           │
│ ☐ Item 4           │
│ ☐ Item 5           │
└────────────────────┘
```

**Use Cases:**
- Task lists
- Checklists
- Feature backlogs
- Requirements

### AI Capabilities

#### Semantic Operations

**1. Persona Generation**
- Command: "Create a persona card"
- Generates:
  - Name and age (e.g., "Sarah Johnson, 34")
  - 3 bullet points about their life/context
  - Domain-specific details
- Uses canvas description for relevance

**2. Feature Lists**
- Command: "Add app features"
- Generates:
  - Title: "{Canvas Name} Features"
  - 6-8 key features
  - Relevant to canvas domain
- Content or bullet format

**3. User Stories**
- Command: "Create user story"
- Generates:
  - 4-6 user stories
  - Format: "As a [user], I want to [goal] so that [benefit]"
  - Contextual to canvas purpose

**4. Pain Points**
- Command: "Add pain points"
- Generates:
  - 5-6 common user challenges
  - Domain-specific problems
  - Problems the app could solve

**5. Competitive Analysis**
- Command: "Create competitive analysis"
- Generates:
  - 5-6 key competitors
  - Brief strength descriptions
  - Market positioning

**6. Startup Idea Expansion**
- Command: Describe a startup idea
- Generates:
  - Title text shape (large, bold)
  - Description text shape (smaller, below)
  - Positioned center canvas

#### Shape Operations

**Create**
- "Create [color] [shape]" → Shape at smart position
- "Add [shape type]" → Creates with defaults
- Smart positioning: Mid-top center with random spread

**Move**
- "Move the [color] [shape] to [position]" → Repositions
- Supports: top, bottom, left, right, center, etc.

**Delete**
- "Delete the [color] [shape]" → Removes shape
- Identifies by type and color

**Resize**
- "Make the [color] [shape] [size]" → Resizes
- Supports: bigger, smaller, large, medium, small

### Collaboration Features

#### Real-Time Sync
- **Latency**: <100ms for shape operations
- **Cursor updates**: <50ms
- **Conflict resolution**: Lock-based system
- **Offline support**: Queue failed operations

#### Presence System
- **Join notification**: User appears in presence list
- **Leave notification**: User removed after 30s timeout
- **Heartbeat**: 30-second refresh
- **Reconnection**: Auto-refresh on visibility change

#### Visual Indicators
- **Cursor**: Colored circle with name label
- **Locked shape**: Red border (4px)
- **Moving shape**: Yellow border (4px)
- **Selected shape**: Blue border with transformer handles
- **Multi-selected**: All selected shapes show blue border

#### User Colors
8-color palette:
- Red (#FF5733)
- Blue (#33C1FF)
- Green (#33FF57)
- Magenta (#FF33C1)
- Purple (#C133FF)
- Orange (#FFC133)
- Cyan (#33FFC1)
- Yellow-Green (#C1FF33)

Assigned via hash of userId for consistency.

### Export Features

#### PNG Export
- **Quality**: Full resolution
- **Background options**:
  - Transparent (for overlays)
  - White (for documents)
- **Grid control**: Show/hide before export
- **Filename**: `canvas-{canvasId}.png`

#### JSON Export
- **Format**: Complete canvas data
- **Includes**:
  - All shapes with properties
  - Canvas metadata
  - Timestamps
- **Use cases**:
  - Backup
  - Version control
  - Data migration
  - Future: Import functionality

### Performance Features

#### Optimization Techniques
- **Position interpolation**: Smooth remote movements
- **Throttled updates**: 60 FPS for RTDB writes
- **LocalStorage caching**: Faster cold starts
- **Lazy loading**: Components load on demand
- **Memoization**: Prevent unnecessary re-renders

#### Performance Targets
- **60 FPS**: With 100+ shapes
- **Sub-100ms sync**: For all operations
- **< 3s initial load**: On fast connection
- **No jank**: During pan/zoom/drag

## User Experience Goals

### Ease of Use
- **Zero learning curve**: Familiar patterns
- **Instant productivity**: No setup required
- **Clear feedback**: Every action has visual response
- **Forgiving**: Easy undo, no data loss

### Collaboration Feel
- **Presence awareness**: Always know who's here
- **No conflicts**: Intelligent locking prevents issues
- **Smooth sync**: Changes feel instantaneous
- **Clear ownership**: See who's editing what

### AI Experience
- **Natural language**: No special syntax
- **Context-aware**: Understands canvas purpose
- **Fast response**: < 2 seconds for generation
- **Helpful suggestions**: Quick command buttons
- **Fallback gracefully**: Works without API key

### Visual Design
- **Clean and minimal**: No clutter
- **Consistent styling**: Tailwind-based design system
- **Clear hierarchy**: Important actions stand out
- **Responsive**: Works on different screen sizes
- **Smooth animations**: Polished interactions

## Business Logic

### Canvas Ownership
- Creator can delete canvas
- All authenticated users can edit
- No permission system (currently)

### Shape Ownership
- Shapes tracked by createdBy
- All users can edit any shape
- Lock system prevents conflicts
- History tracked per user

### AI Usage
- Client-side API calls (no backend)
- No rate limiting (currently)
- API key required in environment
- Fallback to templates on failure

### Data Persistence
- Auto-save to Firestore
- No manual save button needed
- LocalStorage cache for speed
- Offline queue for resilience

## Future Enhancements (Planned)

### Short-Term
- Full TypeScript migration
- Comprehensive undo/redo
- Shape grouping
- Layer management
- Canvas templates

### Medium-Term
- LangGraph AI agents
- Pinecone vector search
- Semantic shape search
- Multi-step AI workflows
- Conversation memory

### Long-Term
- Real-time audio/video
- Comments and annotations
- Version history
- Canvas branching
- Mobile app
- Collaboration analytics
- Team workspaces
- Permission management

## Success Metrics

### User Engagement
- Time spent on canvas
- Shapes created per session
- AI commands per session
- Collaboration sessions (multi-user)

### Technical Performance
- P95 sync latency
- Frame rate during interactions
- Time to first interaction
- Error rate

### AI Effectiveness
- Command success rate
- AI-generated shape retention
- User satisfaction with AI content

## Conclusion

CanvasCollab provides a unique blend of real-time collaboration and AI assistance, specifically designed for startup ideation and product planning. The focus is on removing friction from both collaboration and content creation, allowing teams to focus on thinking and creating rather than tool management.

