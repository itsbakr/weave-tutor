# Environment Setup

Create a `.env` file in the `backend/` directory with the following variables:

```bash
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI Models
GOOGLE_LEARNLM_API_KEY=
PERPLEXITY_API_KEY=

# Weave & W&B
WANDB_API_KEY=
WEAVE_PROJECT_NAME=tutorpilot-weavehacks

# Daytona
DAYTONA_API_KEY=
DAYTONA_BASE_URL=https://app.daytona.io/api

# Server
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
```

## Where to Get API Keys

### Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy `URL` and `anon` key

### Google LearnLM
1. Go to https://aistudio.google.com/app/apikey
2. Create or use existing API key
3. Enable Gemini API

### Perplexity
1. Go to https://www.perplexity.ai/settings/api
2. Generate API key

### Weave & W&B
1. Go to https://wandb.ai/settings
2. Copy your API key
3. This will be used for both Weave tracing AND Qwen3 inference

### Daytona
1. Go to https://app.daytona.io
2. Settings → API Keys
3. Generate new API key

