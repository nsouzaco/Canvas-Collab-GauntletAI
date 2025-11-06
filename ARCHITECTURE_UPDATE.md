# Architecture Update: LangChain Agents (Simplified)

**Date**: November 3, 2025  
**Decision**: Use standard LangChain agents instead of LangGraph workflows

---

## What Changed

### Original Plan
- Use **LangGraph** with complex state graphs
- Multiple specialized agents (router, shape, context, planning, conversation)
- State management with StateGraph
- Complex node and edge configuration

### New Plan (Simplified)
- Use **LangChain agents** with function calling
- Single agent with multiple tools
- Simpler architecture, easier to maintain
- Standard agent patterns from LangChain

---

## Why the Change?

1. **Simplicity**: LangChain agents are simpler and well-documented
2. **Sufficient for Requirements**: All our needs can be met with tools and chains
3. **Easier Onboarding**: Standard patterns, less learning curve
4. **Better Support**: More examples and community support
5. **Incremental Complexity**: Can add LangGraph later if needed

---

## Architecture Comparison

### Before (LangGraph)
```
User Command
     ↓
Router Agent
     ↓
Context Agent (Pinecone)
     ↓
┌────┴────┬────────┬─────────┐
↓         ↓        ↓         ↓
Shape  Planning  Context  Conversation
Agent   Agent     Agent     Agent
```

### After (LangChain)
```
User Command
     ↓
LangChain Agent
     ↓
Context Retrieval (Pinecone)
     ↓
Tool Selection & Execution
  - createShapeTool
  - moveShapeTool
  - deleteShapeTool
  - searchShapesTool
  - getContextTool
     ↓
Response Generation
```

---

## Updated Dependencies

### Removed
- `@langchain/langgraph` - No longer needed

### Added/Kept
- `langchain` - Main library for agents
- `@langchain/openai` - OpenAI integration
- `@langchain/core` - Core abstractions
- `@pinecone-database/pinecone` - Vector database

---

## Code Examples

### Agent Initialization
```typescript
import { ChatOpenAI } from '@langchain/openai';
import { initializeAgentExecutorWithOptions } from 'langchain/agents';

const model = new ChatOpenAI({ temperature: 0.1 });
const tools = [createShapeTool, moveShapeTool, searchTool];

const executor = await initializeAgentExecutorWithOptions(
  tools,
  model,
  { agentType: 'openai-functions' }
);
```

### Tool Definition
```typescript
import { Tool } from '@langchain/core/tools';

class CreateShapeTool extends Tool {
  name = 'create_shape';
  description = 'Creates a shape on the canvas';
  
  async _call(input: string): Promise<string> {
    // Implementation
  }
}
```

---

## Migration Impact

### Documentation Updated
- ✅ `memory-bank/projectbrief.md`
- ✅ `memory-bank/techContext.md`
- ✅ `REFACTORING_TASKS.md`
- ✅ `ENV_SETUP.md`
- ✅ `QUICKSTART.md`
- ✅ `PHASE1_PROGRESS.md`

### Code Updated
- ✅ `collabcanvas/package.json` - Dependencies
- ✅ `collabcanvas/src/services/ai-poc/test-langchain.ts` - New POC test
- ❌ Deleted `test-langgraph.ts` - No longer needed

### Environment Variables
- Changed: `VITE_USE_LANGGRAPH_AI` → `VITE_USE_LANGCHAIN_AI`

---

## Next Steps

All Phase 1 documentation is now consistent with the simplified LangChain approach:

1. Set up Pinecone account
2. Add environment variables
3. Run POC tests:
   - `test-pinecone.ts` - Verify Pinecone connection
   - `test-langchain.ts` - Verify LangChain agent
4. Proceed with Phase 2 implementation

---

## Benefits of This Approach

### Technical
- ✅ Simpler codebase
- ✅ Easier debugging
- ✅ Standard patterns
- ✅ Better documentation
- ✅ Active community support

### Development
- ✅ Faster implementation
- ✅ Lower learning curve
- ✅ More examples available
- ✅ Easier testing
- ✅ Incremental complexity

### Future
- ✅ Can add LangGraph later if needed
- ✅ Can add chains for complex workflows
- ✅ Can add specialized agents
- ✅ Modular, extensible architecture

---

## When to Consider LangGraph

If in the future we need:
- Complex multi-agent orchestration
- State persistence across long sessions
- Parallel agent execution
- Dynamic workflow routing
- Graph-based reasoning

Then we can revisit LangGraph. But for our current requirements, standard LangChain agents are sufficient and simpler.

---

**Status**: All documentation updated ✅  
**Ready for**: Phase 1.3 (POC Testing)

