# TutorPilot Backend - WaveHacks 2

**Self-Improving AI Tutoring Platform**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env` file and add your API keys:

```bash
# Update .env with your credentials:
# - SUPABASE_URL and SUPABASE_KEY
# - GOOGLE_LEARNLM_API_KEY
# - PERPLEXITY_API_KEY
# - TOGETHER_API_KEY (for Qwen3 Coder)
# - WANDB_API_KEY (for Weave tracing)
# - DAYTONA_API_KEY (for sandboxes)
```

### 3. Setup Database

Run the SQL schema in your Supabase dashboard:
```bash
# Copy contents of ../schema-minimal.sql
# Paste into Supabase SQL Editor
# Execute
```

### 4. Run Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server will be available at: http://localhost:8000

API Documentation: http://localhost:8000/docs

---

## 📁 Project Structure

```
backend/
├── main.py                   # FastAPI app with CORS
├── requirements.txt           # Dependencies
├── .env                       # Environment variables (UPDATE THIS!)
├── agents/
│   ├── evaluator.py          # Self-evaluation agent ✅
│   ├── strategy_planner.py   # TODO: Strategy generation
│   ├── lesson_creator.py     # TODO: Lesson generation  
│   └── activity_creator.py   # TODO: React code generation + auto-fix
├── services/
│   ├── ai_service.py         # LearnLM, Perplexity, Qwen3 ✅
│   ├── knowledge_service.py  # Layer 1: Query + Explain ✅
│   ├── memory_service.py     # Platform memory CRUD ✅
│   ├── daytona_service.py    # Sandbox management ✅
│   └── learning_service.py   # TODO: Reflection loop
├── models/
│   ├── student.py            # Pydantic models ✅
│   ├── strategy.py
│   ├── lesson.py
│   ├── activity.py
│   └── evaluation.py
└── db/
    └── supabase_client.py    # Database client ✅
```

---

## ✅ Completed Components

### Phase 1: Foundation (DONE)
- ✅ FastAPI app with CORS and lifespan events
- ✅ Environment configuration (.env)
- ✅ Requirements.txt with latest libraries

### Phase 2: Database & Models (DONE)
- ✅ Supabase client with helper functions
- ✅ Pydantic models for all entities
- ✅ Memory loading functions

### Phase 3: AI Services (DONE)
- ✅ **call_google_learnlm()** - LearnLM with retry logic
- ✅ **call_perplexity()** - Perplexity Sonar with sources
- ✅ **call_qwen3_coder()** - Qwen3 via Together AI
- ✅ All wrapped with **@weave.op()** for tracing

### Phase 4: Knowledge Service - Layer 1 (DONE)
- ✅ **generate_queries()** - Generate 2-3 search queries
- ✅ **explain_topic_with_sources()** - Explain single topic
- ✅ **explain_multiple_topics()** - Parallel topic explanation

### Phase 5: Self-Evaluator Agent (DONE)
- ✅ **evaluate_strategy()** - Evaluate strategies
- ✅ **evaluate_lesson()** - Evaluate lessons
- ✅ **evaluate_activity()** - Evaluate activities + code quality
- ✅ JSON parsing with fallback

### Phase 6: Daytona Integration (DONE)
- ✅ **DaytonaService** class
- ✅ **create_sandbox()** - Deploy code to sandbox
- ✅ **get_sandbox_logs()** - Fetch error logs
- ✅ **delete_sandbox()** - Cleanup
- ✅ **get_sandbox_status()** - Check status

---

## 🚧 Next Steps (TODO)

### Phase 7: Strategy Planner Agent
- [ ] Create `agents/strategy_planner.py`
- [ ] Implement `generate_strategy()` with self-evaluation
- [ ] Load learning insights for adaptive prompting
- [ ] Create API endpoint: `POST /api/v1/agents/strategy`

### Phase 8: Lesson Creator Agent
- [ ] Create `agents/lesson_creator.py`
- [ ] Implement 5E lesson structure
- [ ] Integrate with Knowledge Service
- [ ] Create API endpoint: `POST /api/v1/agents/lesson`

### Phase 9: Activity Creator Agent (CRITICAL)
- [ ] Create `agents/activity_creator.py`
- [ ] Implement React code generation with Qwen3
- [ ] Implement auto-fix loop (up to 3 attempts)
- [ ] Create API endpoint: `POST /api/v1/agents/activity`

### Phase 10: Reflection Loop
- [ ] Create `services/learning_service.py`
- [ ] Implement pattern identification
- [ ] Background task: runs every 10 minutes
- [ ] Store learning insights

### Phase 11: API Endpoints
- [ ] Knowledge Service endpoint
- [ ] Strategy Planner endpoint
- [ ] Lesson Creator endpoint
- [ ] Activity Creator endpoint

---

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

### Test Knowledge Service (once endpoint is created)
```bash
curl -X POST http://localhost:8000/api/v1/knowledge/explain \
  -H "Content-Type: application/json" \
  -d '{
    "topics": ["Forces & Motion"],
    "grade_level": "10",
    "subject": "Physics"
  }'
```

### Test Strategy Generation (once endpoint is created)
```bash
curl -X POST http://localhost:8000/api/v1/agents/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "weeks": 4,
    "subject": "Physics"
  }'
```

---

## 📊 Weave Tracing

All AI calls are traced with Weave. View traces at:
- https://wandb.ai/your-username/tutorpilot-weavehacks

Traces include:
- Input prompts
- Output responses
- Execution time
- Token usage
- All parameters

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors
**Solution**: Make sure venv is activated and dependencies installed
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "Connection refused" to Supabase
**Solution**: Check SUPABASE_URL and SUPABASE_KEY in .env

### Issue: "API key invalid" errors
**Solution**: Verify all API keys in .env are correct

### Issue: Weave traces not showing
**Solution**: 
1. Check WANDB_API_KEY is set
2. Verify `weave.init()` is called at startup
3. Check logs for authentication errors

---

## 📝 Development Notes

### Adding a New Agent

1. Create file in `agents/` directory
2. Import necessary services:
   ```python
   from services.ai_service import call_google_learnlm
   from services.knowledge_service import explain_topic_with_sources
   from services.memory_service import load_student_memories, load_learning_insights
   from agents.evaluator import evaluator
   import weave
   ```

3. Wrap main function with `@weave.op()`:
   ```python
   @weave.op()
   async def generate_something(student_id: str):
       # Your logic
       pass
   ```

4. Always call evaluator after generation:
   ```python
   evaluation = await evaluator.evaluate_strategy(strategy, student)
   await store_performance_metric('strategy_planner', evaluation)
   ```

5. Create FastAPI endpoint in main.py

### Rate Limiting

If you hit API rate limits, add delays:
```python
await asyncio.sleep(1)  # Wait 1 second between calls
```

---

## 🎯 Demo Checklist

- [ ] All API endpoints working
- [ ] Weave traces visible in dashboard
- [ ] Self-evaluation scores stored in database
- [ ] Learning insights generated by reflection loop
- [ ] Daytona sandbox successfully deploys React code
- [ ] Auto-fix loop works (shows error → fix → success)
- [ ] Demo data seeded in database

---

## 📚 Resources

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Weave Docs**: https://wandb.me/weave
- **Supabase Docs**: https://supabase.com/docs
- **Daytona Docs**: https://www.daytona.io/docs
- **Integration Guide**: See `../INTEGRATION-GUIDE.md`

---

**Status**: Foundation Complete ✅  
**Next**: Implement agents (Strategy, Lesson, Activity)  
**Timeline**: 20 hours remaining for full implementation

