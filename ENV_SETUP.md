# Environment Variables Setup

## Required Environment Variables

Add these to your `.env` file in the `collabcanvas/` directory:

```bash
# Firebase Configuration (existing)
VITE_FIREBASE_API_KEY=your_firebase_api_key_here

# OpenAI Configuration (existing - still needed for LangChain)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration (NEW - add these)
VITE_PINECONE_API_KEY=your_pinecone_api_key_here
VITE_PINECONE_ENVIRONMENT=your_pinecone_environment_here
VITE_PINECONE_INDEX_NAME=canvascollab

# Feature Flags (NEW - for gradual rollout)
VITE_USE_LANGCHAIN_AI=false
```

## Setup Instructions

### 1. Pinecone Account Setup

1. Go to [pinecone.io](https://www.pinecone.io/)
2. Sign up for a free account
3. Create a new index:
   - **Name**: `canvascollab`
   - **Dimensions**: `1536` (for OpenAI ada-002 embeddings)
   - **Metric**: `cosine`
   - **Pod Type**: `starter` (free tier)
4. Get your API key from the Pinecone dashboard
5. Note your environment (e.g., `us-east-1-aws`)

### 2. Update .env File

Create or update `/Users/nat/CanvasCollab/collabcanvas/.env`:

```bash
# Copy your existing Firebase and OpenAI keys
VITE_FIREBASE_API_KEY=<your_existing_firebase_key>
VITE_OPENAI_API_KEY=<your_existing_openai_key>

# Add new Pinecone configuration
VITE_PINECONE_API_KEY=<your_pinecone_api_key>
VITE_PINECONE_ENVIRONMENT=<your_pinecone_environment>
VITE_PINECONE_INDEX_NAME=canvascollab

# Feature flag (keep false during development)
VITE_USE_LANGCHAIN_AI=false
```

### 3. Verify Setup

After adding environment variables, restart your dev server:

```bash
cd collabcanvas
npm run dev
```

The new AI services will be available but not active until the feature flag is enabled.

## Next Steps

Once environment variables are set:

1. Test Pinecone connection (see `services/ai-poc/test-pinecone.ts`)
2. Test LangChain agent (see `services/ai-poc/test-langchain.ts`)
3. Run proof of concept scripts
4. Enable feature flag when ready for testing

## Security Notes

- ⚠️ **Never commit `.env` files to git**
- ⚠️ `.env` is already in `.gitignore`
- ⚠️ For production, use Vercel environment variables
- ⚠️ Keep API keys secure and rotate regularly

