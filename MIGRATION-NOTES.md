# Migration from Supabase Edge Functions to FastAPI

**Quick reference for adapting the existing codebase**

---

## Key Architecture Changes

| Aspect | Old (Supabase) | New (WaveHacks 2) |
|--------|----------------|-------------------|
| **Runtime** | Deno (Edge Functions) | Python (FastAPI) |
| **Deployment** | Supabase Edge | Railway/Render |
| **Database** | Supabase PostgreSQL | Supabase PostgreSQL (same!) |
| **AI Models** | LearnLM + Perplexity | LearnLM + Perplexity + Qwen3 |
| **Code Sandboxes** | ❌ Not implemented | ✅ Daytona integration |
| **Self-Evaluation** | ❌ Not implemented | ✅ Core feature |
| **Tracing** | ❌ Not implemented | ✅ Weave tracing |

---

## What Stays the Same

✅ **Database Schema**: Same tables (just using fewer of them)  
✅ **AI Prompts**: Copy from existing agents (proven to work)  
✅ **2-Layer Architecture**: Layer 1 (Knowledge) + Layer 2 (Content)  
✅ **Memory System**: platform_memory, agent_performance_metrics  
✅ **Educational Frameworks**: 5E model, Bloom's Taxonomy

---

## What's New

### 1. Self-Evaluation System

**Old**: No evaluation, just generation
```typescript
// Old: Just generate and return
const strategy = await generateStrategy(student, tutor);
return strategy;
```

**New**: Generate → Evaluate → Learn
```python
# New: Generate, evaluate, and store for learning
strategy = await generate_strategy(student, tutor)
evaluation = await evaluator.evaluate_strategy(strategy, student)
await store_performance_metric("strategy_planner", evaluation, strategy.id)

# Background task analyzes low scores and creates insights
```

### 2. Reflection Loop

**Old**: No automated learning
```typescript
// Old: Memory was manual, no automated pattern recognition
```

**New**: Automated pattern recognition every 10 minutes
```python
# New: Background task running continuously
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(periodic_reflection_loop())

async def periodic_reflection_loop():
    while True:
        await asyncio.sleep(600)  # Every 10 minutes
        low_scores = get_recent_low_scores()
        patterns = analyze_failure_patterns(low_scores)
        store_learning_insights(patterns)
```

### 3. Adaptive Prompting

**Old**: Static prompts
```typescript
// Old: Same prompt every time
const prompt = buildStrategyPrompt(student, tutor, weekTopics);
```

**New**: Prompts evolve based on learnings
```python
# New: Load relevant insights and adapt prompt
insights = await load_learning_insights(student.grade, subject)

insights_section = format_insights_for_prompt(insights)
adapted_prompt = base_prompt + insights_section  # Prompt improves over time
```

### 4. Code Sandbox Feature

**Old**: No code generation
```typescript
// Old: Activity Creator only generated descriptions
```

**New**: Generate code + deploy to sandbox
```python
# New: For simulation activities
if activity_type == "simulation":
    code = await generate_simulation_code(topic, grade, explanation)
    sandbox = await daytona_service.create_sandbox(code, "python")
    return {
        "code": code,
        "sandbox_url": sandbox['url']  # Live simulation!
    }
```

---

## Code Migration Examples

### Database Queries

**Old (Deno + Supabase JS)**:
```typescript
const { data: memories, error } = await supabase
  .from('platform_memory')
  .select('*')
  .eq('entity_type', 'student')
  .eq('entity_id', studentId)
  .gte('confidence_score', 0.3)
  .limit(10);
```

**New (Python + Supabase Python)**:
```python
response = supabase.table('platform_memory') \
    .select('*') \
    .eq('entity_type', 'student') \
    .eq('entity_id', student_id) \
    .gte('confidence_score', 0.3) \
    .limit(10) \
    .execute()

memories = response.data
```

### AI Service Calls

**Old (Deno)**:
```typescript
async function callGoogleLearnLM(prompt: string): Promise<string> {
  const response = await fetch('https://generativelanguage.googleapis.com/...', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GOOGLE_API_KEY
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    })
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
```

**New (Python with Weave tracing)**:
```python
import weave
import httpx

@weave.op()  # NEW: Automatic tracing
async def call_google_learnlm(prompt: str) -> str:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            'https://generativelanguage.googleapis.com/...',
            headers={
                'Content-Type': 'application/json',
                'x-goog-api-key': os.getenv('GOOGLE_LEARNLM_API_KEY')
            },
            json={
                'contents': [{'role': 'user', 'parts': [{'text': prompt}]}]
            }
        )
        
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']
```

### Prompt Building

**Old (TypeScript template literals)**:
```typescript
const prompt = `You are a master educator.

STUDENT PROFILE:
- Name: ${student.name}
- Grade: ${student.grade}
- Interests: ${student.interests.join(', ')}

Generate a strategy...`;
```

**New (Python f-strings)**:
```python
prompt = f"""You are a master educator.

STUDENT PROFILE:
- Name: {student['name']}
- Grade: {student['grade']}
- Interests: {', '.join(student.get('interests', []))}

Generate a strategy..."""
```

### Error Handling & Retries

**Old (Deno)**:
```typescript
for (let attempt = 0; attempt <= retries; attempt++) {
  try {
    const response = await fetch(...);
    if (!response.ok) {
      if (response.status === 429 && attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (attempt === retries) throw error;
  }
}
```

**New (Python)**:
```python
for attempt in range(retries + 1):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(...)
            
            if not response.is_success:
                if response.status_code == 429 and attempt < retries:
                    wait_time = backoff_ms * (2 ** attempt) / 1000
                    await asyncio.sleep(wait_time)
                    continue
                raise Exception(f"API error: {response.status_code}")
            
            return response.json()
    except Exception as e:
        if attempt == retries:
            raise e
```

---

## Prompts to Copy Directly

### From strategy-planner/index.ts
✅ **Copy these sections**:
- Weekly topic generation logic
- Strategy structure with 4 weeks
- Learning objectives framework
- Cultural adaptation guidelines

### From lesson-creator/index.ts
✅ **Copy these sections**:
- 5E lesson structure (lines 497-683)
- Attention span calculations
- Differentiation strategies
- Formative assessment methods

### From activity-creator/index.ts
✅ **Copy these sections**:
- Flow state optimization principles (lines 491-550)
- Engagement strategy structure
- Gamification elements
- Difficulty scaling logic

**Don't recreate these prompts!** They're pedagogically sound and well-tested. Just adapt the syntax.

---

## Tables to Keep from Full Schema

From the full `schema.sql`, **only use these 9 tables**:

✅ **Keep**:
1. `tutors` - Basic tutor info
2. `students` - Student profiles
3. `platform_memory` - Memory system (critical!)
4. `agent_performance_metrics` - Self-evaluation scores (NEW usage)
5. `cross_agent_learning` - Pattern propagation
6. `learning_insights` - Optimization opportunities (NEW usage)
7. `strategies` - Generated strategies
8. `lessons` - Generated lessons
9. `activities` - Generated activities (with NEW code fields)

❌ **Skip** (not needed for hackathon):
- `agent_handoffs` - Overkill for 30 hours
- `memory_consolidations` - Can be added later
- `feedback` - Not implementing feedback loop yet
- `strategy_weeks` - Embed in strategies.content JSON instead

---

## Environment Variables Mapping

**Old (.env for Supabase Edge Functions)**:
```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_LEARNLM_API_KEY=...
PERPLEXITY_API_KEY=...
```

**New (.env for FastAPI)**:
```bash
# Same as before
SUPABASE_URL=...
SUPABASE_KEY=...  # Can use anon key instead of service role
GOOGLE_LEARNLM_API_KEY=...
PERPLEXITY_API_KEY=...

# NEW for WaveHacks
WEAVE_PROJECT_NAME=tutorpilot-weavehacks
WEAVE_API_KEY=...
DAYTONA_API_KEY=...

# Optional
QWEN3_API_KEY=...  # If using separate endpoint
```

---

## Deployment Changes

**Old**:
```bash
# Deploy to Supabase
supabase functions deploy strategy-planner
supabase functions deploy lesson-creator
supabase functions deploy activity-creator
```

**New**:
```bash
# Deploy backend to Railway/Render
git push railway main

# Deploy frontend to Vercel
vercel --prod
```

---

## Testing Approach

**Old**:
- Manual testing via Postman
- Test scripts in `test-agents/`

**New (same approach, just different URLs)**:
```bash
# Test FastAPI endpoints
curl -X POST http://localhost:8000/api/v1/agents/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "demo-student-001",
    "weeks": 4,
    "subject": "Physics"
  }'

# Check self-evaluation stored
curl http://localhost:8000/api/v1/metrics/recent
```

---

## Critical Differences to Remember

| Feature | Old Approach | New Approach | Why Changed |
|---------|--------------|--------------|-------------|
| **Generation** | Generate once, return | Generate → Evaluate → Store | Self-improvement |
| **Prompts** | Static | Adaptive (load insights) | Learn from failures |
| **Memory** | Manual insights | Automated pattern detection | Self-improvement |
| **Activities** | Descriptions only | Code generation + sandboxes | Innovation + sponsors |
| **Tracing** | Console logs | Weave tracing | Debugging + demo |

---

## Time-Saving Tips

1. **Don't rewrite prompts**: Copy from existing agents, just change syntax
2. **Use test data**: Hardcode student IDs instead of auth
3. **Skip fancy UI**: Basic Tailwind is fine for hackathon
4. **Focus on demo**: Make self-improvement visible, not perfect
5. **Fallback options**: If Daytona is slow, use local subprocess for code execution

---

## Common Pitfalls to Avoid

❌ **Don't**:
- Rewrite prompts from scratch (waste of time)
- Try to use all 209 lines of schema.sql (too complex)
- Implement authentication (out of scope)
- Perfect the UI (judges care about AI, not design)
- Get stuck on Daytona API (have a fallback)

✅ **Do**:
- Copy working prompts and adapt syntax
- Use minimal 9-table schema
- Hardcode test users
- Focus on showing self-improvement clearly
- Test Daytona early, prepare fallback

---

## Quick Reference: Where to Find Things

### Existing Implementation
- **Strategy prompts**: `supabase/functions/strategy-planner/index.ts` (lines 180-500)
- **Lesson prompts**: `supabase/functions/lesson-creator/index.ts` (lines 497-683)
- **Activity prompts**: `supabase/functions/activity-creator/index.ts` (lines 491-723)
- **Memory queries**: All agent files have `loadStudentMemories()` functions
- **AI calls**: All agent files have `callGoogleLearnLM()` and `callPerplexity()`

### New Implementation
- **Architecture**: `PRD-WEAVEHACKS2-ARCHITECTURE.md`
- **Tasks**: `TASKS-WEAVEHACKS2-30HOURS.md`
- **Prompts**: `PROMPT-REFERENCE.md`
- **Schema**: `schema-minimal.sql`
- **Setup**: `README.md`

---

## Final Checklist Before Starting

- [ ] Read PRD document (understand self-improvement loops)
- [ ] Read tasks document (understand 30-hour timeline)
- [ ] Set up Supabase project (run schema-minimal.sql)
- [ ] Get all API keys (Google, Perplexity, Weave, Daytona)
- [ ] Copy prompts from existing agents (don't rewrite)
- [ ] Test Layer 1 (Knowledge Service) first
- [ ] Test self-evaluator early
- [ ] Have a Daytona fallback plan

---

**Remember**: You're not building from scratch! You're adapting proven agents to a new runtime (FastAPI) and adding self-improvement on top. Focus on the NEW parts (evaluation, reflection, adaptive prompting) and copy the proven parts (prompts, structures).

**Good luck! 🚀**

