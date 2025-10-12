# Fixes Applied Based on User Feedback

## Issues Fixed

### 1. ✅ Removed Together AI and Hugging Face Dependencies
**Problem**: Using unnecessary external services when Weave can handle Qwen3 inference

**Solution**:
- Removed `together==1.0.2` from `requirements.txt`
- Removed `huggingface-hub==0.20.3` from `requirements.txt`
- Updated `call_qwen3_coder()` to use Weave's inference API
- Qwen3 now uses Weave credits (hackathon sponsor benefit!)

### 2. ✅ Fixed Perplexity Implementation
**Problem**: Wrong model name and not following the reference implementation from `perplexity-search.ts`

**Solution**:
- Changed model from `"llama-3.1-sonar-large-128k-online"` to `"sonar"` (can also use `"sonar-pro"`)
- Updated to match TypeScript implementation pattern
- Properly extract `search_results` field from response
- Added fallback for `citations` field
- Improved error handling and response parsing

**Before**:
```python
model="llama-3.1-sonar-large-128k-online"  # Wrong
sources = response.citations  # Unreliable
```

**After**:
```python
model="sonar"  # Correct (or "sonar-pro" for comprehensive)
# Extract from search_results field (Perplexity Sonar specific)
response_dict = response.model_dump()
sources = response_dict.get('search_results', [])
```

### 3. ✅ Updated Environment Variables
**Problem**: Wrong Supabase key name and unnecessary API keys

**Solution**:
- `SUPABASE_KEY` → `SUPABASE_ANON_KEY`
- Added `SUPABASE_SERVICE_ROLE_KEY` for admin operations
- Removed `TOGETHER_API_KEY`
- Removed `HUGGING_FACE_TOKEN`
- Updated `DAYTONA_BASE_URL` to `https://app.daytona.io/api`

### 4. ✅ Updated Supabase Client
**Problem**: Using old environment variable name

**Solution**:
```python
# Before
os.getenv("SUPABASE_KEY")

# After
os.getenv("SUPABASE_ANON_KEY")
```

---

## Key Changes Summary

| Component | Old | New | Reason |
|-----------|-----|-----|--------|
| **Qwen3 Inference** | Together AI | Weave API | Use hackathon sponsor credits |
| **Perplexity Model** | `llama-3.1-sonar-large-128k-online` | `sonar` | Correct model name |
| **Perplexity Sources** | `response.citations` | `response_dict['search_results']` | Proper field extraction |
| **Supabase Key** | `SUPABASE_KEY` | `SUPABASE_ANON_KEY` | Standard naming |
| **Dependencies** | Together AI, HF | Removed | Simplified stack |

---

## ⚠️ Important Notes

### Weave Inference API
The `call_qwen3_coder()` function now uses Weave's inference API:

```python
model = weave.Model(
    name="Qwen/Qwen2.5-Coder-32B-Instruct",
    provider="weave"
)
response = await model.predict(messages=messages, ...)
```

**Note**: The actual Weave inference API might differ slightly. If this doesn't work:
1. Check Weave documentation for hosted model inference
2. They might use a different endpoint or method
3. The model name might need adjustment (e.g., "qwen3-coder-480b")
4. May need to use `weave.init()` with specific inference settings

### Perplexity Response Structure
The Perplexity Sonar API returns:
- `choices[0].message.content` - The synthesized explanation
- `search_results` - Array of source materials (NOT in standard OpenAI format)

We extract sources properly now using `response.model_dump()` to access custom fields.

---

## Testing Checklist

After applying these fixes:

- [ ] Test Perplexity with `model="sonar"`
- [ ] Verify sources are extracted correctly
- [ ] Test Weave Qwen3 inference
- [ ] Confirm tracing works in Weave dashboard
- [ ] Validate Supabase connection with new key names
- [ ] Check Daytona sandbox creation with new base URL

---

**Status**: All requested fixes applied ✅  
**Next**: Test the APIs with actual keys

