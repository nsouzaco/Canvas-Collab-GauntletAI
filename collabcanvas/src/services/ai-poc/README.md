# AI Proof of Concept (POC)

This directory contains proof of concept scripts to verify that LangGraph and Pinecone are set up correctly before full implementation.

## Purpose

Before migrating the entire AI system from direct OpenAI calls to LangGraph + Pinecone, we need to verify that:
1. Pinecone connection works
2. Embedding generation works
3. LangGraph workflows execute properly
4. The integration is viable

## Files

### `test-pinecone.ts`
Tests Pinecone setup including:
- Environment variable validation
- Client initialization
- Index connection
- Embedding generation (OpenAI ada-002)
- Document upsert
- Semantic search
- Cleanup

### `test-langgraph.ts`
Tests LangGraph setup including:
- OpenAI model initialization
- Simple chat completion
- Agent node creation
- StateGraph workflow
- Command processing

## Prerequisites

1. **Environment Variables Set**
   - See `ENV_SETUP.md` in project root
   - `VITE_PINECONE_API_KEY`
   - `VITE_PINECONE_ENVIRONMENT`
   - `VITE_PINECONE_INDEX_NAME`
   - `VITE_OPENAI_API_KEY`

2. **Pinecone Index Created**
   - Name: `canvascollab` (or as configured)
   - Dimensions: 1536
   - Metric: cosine
   - Pod Type: starter (free tier)

3. **Dependencies Installed**
   ```bash
   npm install @langchain/langgraph @langchain/openai @langchain/core @pinecone-database/pinecone
   ```

## Running Tests

### Option 1: Using ts-node (Recommended)
```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run Pinecone test
npx ts-node src/services/ai-poc/test-pinecone.ts

# Run LangGraph test
npx ts-node src/services/ai-poc/test-langgraph.ts
```

### Option 2: Using Vite dev server
Import and run the tests in a component during development.

## Expected Results

### Pinecone Test Success
```
🧪 Testing Pinecone Connection...

1️⃣ Checking environment variables...
✅ Environment variables found

2️⃣ Initializing Pinecone client...
✅ Pinecone client initialized

3️⃣ Connecting to index...
✅ Connected to index: canvascollab

4️⃣ Generating test embedding...
✅ Embedding generated: 1536 dimensions

5️⃣ Upserting test document to Pinecone...
✅ Document upserted with ID: test-1234567890

6️⃣ Querying for similar documents...
✅ Found 1 matches:
   1. Score: 0.9234 | ID: test-1234567890

7️⃣ Cleaning up test document...
✅ Test document deleted

🎉 All tests passed! Pinecone is set up correctly.
```

### LangGraph Test Success
```
🧪 Testing LangGraph Setup...

1️⃣ Checking environment variables...
✅ OpenAI API key found

2️⃣ Initializing OpenAI model...
✅ OpenAI model initialized

3️⃣ Testing simple chat completion...
✅ Response: "LangChain is working!"

4️⃣ Creating simple agent workflow...
5️⃣ Building StateGraph...
✅ Workflow compiled successfully

6️⃣ Running test command through workflow...
   Input: "create a red rectangle"
✅ Workflow response:
   {"type": "rectangle", "color": "red"}

🎉 All tests passed! LangGraph is set up correctly.
```

## Troubleshooting

### Pinecone Errors

**Error: Missing environment variables**
- Check `.env` file exists in `collabcanvas/` directory
- Verify variables are prefixed with `VITE_`
- Restart dev server after adding variables

**Error: Index not found**
- Log into Pinecone dashboard
- Create index with correct name
- Verify environment matches your account

**Error: API key invalid**
- Get new API key from Pinecone dashboard
- Update `.env` file
- Ensure no extra spaces in the key

### LangGraph Errors

**Error: OpenAI API key not found**
- Check `VITE_OPENAI_API_KEY` in `.env`
- Verify the key is valid and active
- Check your OpenAI account has credits

**Error: Rate limit exceeded**
- Wait a few minutes and try again
- Check your OpenAI usage limits
- Consider upgrading OpenAI plan if needed

**Error: Model not found**
- Ensure you have access to GPT-3.5-turbo
- Try switching to 'gpt-4' if you have access
- Check OpenAI API status page

## Next Steps

After both tests pass:

1. **Document Results**
   - Create `POC_RESULTS.md` with findings
   - Note response times
   - Document any issues encountered

2. **Architecture Design** (Phase 1.4)
   - Design full agent workflow
   - Define tool interfaces
   - Plan Pinecone index schemas
   - Create TypeScript types

3. **Implementation** (Phase 2+)
   - Build shape agent
   - Build context agent
   - Build planning agent
   - Integrate with existing system

## Cleanup

These POC files can be kept for reference or removed after successful implementation. They serve as:
- Documentation of setup process
- Quick verification tools
- Examples for new developers
- Regression test baseline

## Notes

- These are **test files only**, not production code
- They use simplified logic to verify setup
- Real agents will be more sophisticated
- See `REFACTORING_TASKS.md` for full implementation plan

