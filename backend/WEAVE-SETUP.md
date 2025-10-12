# Weave & W&B Inference Setup

## Overview

This project uses **W&B Inference** to host the Qwen3 Coder 480B model, with **Weave** automatically tracing all AI calls.

## How It Works

### 1. Weave Tracing (All AI Models)

Weave automatically logs ALL AI operations when you:
1. Call `weave.init("tutorpilot-weavehacks")` at startup
2. Decorate functions with `@weave.op()`

```python
import weave

# In main.py startup
weave.init("tutorpilot-weavehacks")

# In any AI service function
@weave.op()
async def call_google_learnlm(prompt: str) -> str:
    # This call is automatically traced
    response = await genai_model.generate_content_async(prompt)
    return response.text
```

**What gets logged:**
- Input prompts
- Output responses
- Execution time
- Token usage
- All parameters
- Errors and retries

**View traces at:** https://wandb.ai/your-username/tutorpilot-weavehacks

### 2. W&B Inference (Qwen3 Coder)

W&B provides a **hosted API** for large models like Qwen3 Coder 480B.

**Implementation:**
```python
from openai import AsyncOpenAI

# Create client pointing to W&B Inference
wb_client = AsyncOpenAI(
    base_url='https://api.inference.wandb.ai/v1',
    api_key=os.getenv("WANDB_API_KEY")  # Same key as Weave
)

# Call Qwen3 Coder 480B (hosted by W&B)
response = await wb_client.chat.completions.create(
    model="Qwen/Qwen3-Coder-480B-A35B-Instruct",
    messages=[...],
    temperature=0.2,
    max_tokens=4096
)

code = response.choices[0].message.content
```

**Benefits:**
- ✅ No need to download 480B model
- ✅ Uses OpenAI-compatible API
- ✅ Automatically traced by Weave
- ✅ Uses your hackathon credits

## Setup Steps

### 1. Get W&B API Key

1. Go to https://wandb.ai/authorize
2. Copy your API key
3. Add to `.env`:
   ```bash
   WANDB_API_KEY=your_api_key_here
   WEAVE_PROJECT_NAME=tutorpilot-weavehacks
   ```

### 2. Initialize Weave (Already Done in `main.py`)

```python
import weave
import os

weave.init(os.getenv("WEAVE_PROJECT_NAME", "tutorpilot-weavehacks"))
```

### 3. Use `@weave.op()` Decorator (Already Done)

All AI functions in `services/ai_service.py` are decorated:
- `call_google_learnlm()` ✅
- `call_perplexity()` ✅
- `call_qwen3_coder()` ✅

## Viewing Traces

After running the backend:

1. Go to https://wandb.ai
2. Navigate to your project: `tutorpilot-weavehacks`
3. Click on "Weave" tab
4. See all traced operations:
   - LearnLM calls for strategy/lesson generation
   - Perplexity calls for knowledge retrieval
   - Qwen3 calls for React code generation
   - Self-evaluation calls
   - Timing and token usage

## Example: Full Trace Flow

When generating an activity:

```
1. call_perplexity()
   ├─ Input: "Explain chemical bonding for grade 10"
   ├─ Duration: 2.3s
   └─ Output: 2000 chars + 5 sources

2. call_qwen3_coder()
   ├─ Input: React activity prompt (4000 chars)
   ├─ Duration: 8.5s
   ├─ Model: Qwen3-Coder-480B-A35B-Instruct
   ├─ Tokens: 1200 prompt + 3500 completion
   └─ Output: React component code (3500 chars)

3. evaluate_activity()
   ├─ Input: Activity + student context
   ├─ Duration: 3.2s
   └─ Output: Evaluation scores (7.5/10)
```

All visible in Weave dashboard with detailed timing and parameters!

## Model Availability

### W&B Inference Models
- ✅ `Qwen/Qwen3-Coder-480B-A35B-Instruct` - Code generation (what we use)
- ✅ Other models available through W&B Inference

### Direct API Models
- ✅ Google LearnLM - Educational content (via Google AI Studio)
- ✅ Perplexity Sonar - Knowledge retrieval (via Perplexity API)

## Troubleshooting

### Issue: "Weave not showing traces"
**Solution:**
1. Check `WANDB_API_KEY` is set in `.env`
2. Verify `weave.init()` is called at startup
3. Ensure functions have `@weave.op()` decorator
4. Check terminal for authentication errors

### Issue: "Qwen3 Coder returns error"
**Solution:**
1. Verify `WANDB_API_KEY` is valid
2. Check W&B Inference quota (hackathon credits)
3. Try with smaller `max_tokens` (e.g., 2048)
4. Check model name: `Qwen/Qwen3-Coder-480B-A35B-Instruct`

### Issue: "Rate limited"
**Solution:**
- W&B Inference has rate limits
- Add delays between calls: `await asyncio.sleep(1)`
- Use batch operations with delays

## Cost & Credits

For WaveHacks 2 hackathon:
- ✅ Weave tracing: Free (part of W&B)
- ✅ W&B Inference: Uses hackathon credits
- ℹ️ Google LearnLM: Your own API key
- ℹ️ Perplexity Sonar: Your own API key

## References

- **W&B Inference Tutorial**: https://wandb.ai/wandb_fc/genai-research/reports/Tutorial-Run-inference-with-Qwen3-Coder
- **Weave Docs**: https://wandb.me/weave
- **W&B Inference Docs**: https://docs.wandb.ai/guides/inference
- **Qwen3 Coder Model**: https://huggingface.co/Qwen/Qwen3-Coder-480B-A35B-Instruct

---

**Status**: Configuration Complete ✅  
**Next**: Test with actual API keys

